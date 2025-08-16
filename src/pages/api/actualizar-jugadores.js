import fs from 'fs';
import path from 'path';

export async function POST({ request }) {
  try {
    const { jugadoresActualizados, accion } = await request.json();
    
    console.log('📨 Acción recibida:', accion);
    console.log('📊 Datos recibidos:', Object.keys(jugadoresActualizados || {}).length, 'jugadores');
    
    // Ruta al archivo de jugadores
    const filePath = path.join(process.cwd(), 'src', 'data', 'players.json');
    
    // Manejo de diferentes acciones
    if (accion === 'reemplazar_completo') {
      // Acción original: reemplazar todo el archivo
      const { jugadores } = await request.json();
      
      if (!jugadores || !Array.isArray(jugadores)) {
        return new Response(JSON.stringify({ error: 'Datos de jugadores inválidos' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Crear backup antes de actualizar
      const backupPath = path.join(process.cwd(), 'src', 'data', 'players-backup.json');
      const currentData = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(backupPath, currentData);
      
      // Escribir los nuevos datos
      fs.writeFileSync(filePath, JSON.stringify(jugadores, null, 2));
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Jugadores reemplazados exitosamente',
        jugadoresActualizados: jugadores.length,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Nueva acción: actualizar valores de mercado
    if (accion === 'actualizar_mercado') {
      console.log('💰 Actualizando valores de mercado...');
      
      if (!jugadoresActualizados || typeof jugadoresActualizados !== 'object') {
        return new Response(JSON.stringify({ error: 'Datos de jugadores inválidos para actualización de mercado' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Leer archivo actual de jugadores
      const jugadoresActuales = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Actualizar valores de mercado
      const jugadoresUpdated = jugadoresActuales.map(jugador => {
        if (jugadoresActualizados[jugador.nombre]) {
          const datosActualizados = jugadoresActualizados[jugador.nombre];
          
          console.log(`💰 Actualizando valor de ${jugador.nombre}: ${jugador.valor_mercado} → ${datosActualizados.valor_mercado}`);
          
          return {
            ...jugador,
            valor_mercado: datosActualizados.valor_mercado,
            ultima_actualizacion: new Date().toISOString()
          };
        }
        return jugador;
      });
      
      // Crear backup antes de actualizar
      const backupPath = path.join(process.cwd(), 'src', 'data', 'players-backup.json');
      const currentData = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(backupPath, currentData);
      
      // Guardar archivo actualizado
      fs.writeFileSync(filePath, JSON.stringify(jugadoresUpdated, null, 2));
      
      console.log('✅ Valores de mercado actualizados exitosamente');
      
      return new Response(JSON.stringify({
        success: true,
        mensaje: `${Object.keys(jugadoresActualizados).length} valores de mercado actualizados`,
        jugadoresActualizados: Object.keys(jugadoresActualizados).length,
        fecha: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Acción por defecto: actualizar estadísticas acumuladas
    if (!jugadoresActualizados || typeof jugadoresActualizados !== 'object') {
      return new Response(JSON.stringify({ error: 'Datos de jugadores actualizados inválidos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('📨 Recibiendo actualización de jugadores:', Object.keys(jugadoresActualizados).length, 'jugadores');
    
    // Leer archivo actual de jugadores
    const jugadoresActuales = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log('📚 Jugadores en archivo actual:', jugadoresActuales.length);
    
    // Actualizar cada jugador con sus estadísticas acumuladas
    const jugadoresUpdated = jugadoresActuales.map(jugador => {
      if (jugadoresActualizados[jugador.nombre]) {
        const statsActualizadas = jugadoresActualizados[jugador.nombre];
        
        console.log(`🔄 Actualizando ${jugador.nombre}:`, {
          puntos_antes: jugador.puntos || 0,
          puntos_despues: statsActualizadas.puntosTotal || 0,
          goles_antes: jugador.goles || 0,  
          goles_despues: statsActualizadas.golesTotal || 0
        });
        
        return {
          ...jugador,
          puntos: statsActualizadas.puntosTotal || 0,
          goles: statsActualizadas.golesTotal || 0,
          asistencias: statsActualizadas.asistenciasTotal || 0,
          tarjetas_amarillas: statsActualizadas.tarjetasAmarillasTotal || 0,
          tarjetas_rojas: statsActualizadas.tarjetasRojasTotal || 0,
          partidos_jugados: statsActualizadas.partidosJugados || 0,
          ultima_actualizacion: new Date().toISOString()
        };
      }
      return jugador;
    });
    
    // Crear backup antes de actualizar
    const backupPath = path.join(process.cwd(), 'src', 'data', 'players-backup.json');
    const currentData = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(backupPath, currentData);
    
    // Guardar archivo actualizado
    fs.writeFileSync(filePath, JSON.stringify(jugadoresUpdated, null, 2));
    
    console.log('✅ Archivo de jugadores actualizado exitosamente');
    
    return new Response(JSON.stringify({
      success: true,
      mensaje: `${Object.keys(jugadoresActualizados).length} jugadores actualizados con estadísticas acumuladas`,
      jugadoresActualizados: Object.keys(jugadoresActualizados).length,
      fecha: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('❌ Error actualizando jugadores:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Error interno del servidor',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ 
    message: 'Endpoint para actualizar jugadores. Use POST para enviar datos.',
    usage: {
      method: 'POST',
      body: {
        jugadores: 'Array de objetos jugador con campos actualizados'
      }
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
