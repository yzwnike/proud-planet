import fs from 'fs';
import path from 'path';

export async function POST({ request }) {
  try {
    const { jugadoresActualizados, accion } = await request.json();
    
    console.log('🏆 Transfermarkt - Acción recibida:', accion);
    console.log('📊 Transfermarkt - Datos recibidos:', Object.keys(jugadoresActualizados || {}).length, 'jugadores');
    
    // Ruta al archivo de transfermarkt
    const filePath = path.join(process.cwd(), 'src', 'data', 'transfermarkt.json');
    
    if (accion === 'actualizar_transfermarkt') {
      console.log('💰 Actualizando valores de Transfermarkt...');
      
      if (!jugadoresActualizados || typeof jugadoresActualizados !== 'object') {
        return new Response(JSON.stringify({ error: 'Datos de jugadores inválidos para actualización de Transfermarkt' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Leer archivo actual de transfermarkt
      const jugadoresActuales = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Actualizar valores de transfermarkt
      const jugadoresUpdated = jugadoresActuales.map(jugador => {
        if (jugadoresActualizados[jugador.nombre]) {
          const datosActualizados = jugadoresActualizados[jugador.nombre];
          
          console.log(`🏆 Actualizando valor Transfermarkt de ${jugador.nombre}: €${jugador.valor_transfermarkt.toLocaleString('es-ES')} → €${datosActualizados.valor_transfermarkt.toLocaleString('es-ES')}`);
          
          return {
            ...jugador,
            valor_transfermarkt: datosActualizados.valor_transfermarkt,
            ultima_actualizacion_transfermarkt: new Date().toISOString()
          };
        }
        return jugador;
      });
      
      // Crear backup antes de actualizar
      const backupPath = path.join(process.cwd(), 'src', 'data', 'transfermarkt-backup.json');
      const currentData = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(backupPath, currentData);
      
      // Guardar archivo actualizado
      fs.writeFileSync(filePath, JSON.stringify(jugadoresUpdated, null, 2));
      
      console.log('✅ Valores de Transfermarkt actualizados exitosamente');
      
      return new Response(JSON.stringify({
        success: true,
        mensaje: `${Object.keys(jugadoresActualizados).length} valores de Transfermarkt actualizados`,
        jugadoresActualizados: Object.keys(jugadoresActualizados).length,
        fecha: new Date().toISOString(),
        tipo: 'transfermarkt'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Acción de respaldo para reemplazar todo el archivo
    if (accion === 'reemplazar_completo') {
      const { jugadores } = await request.json();
      
      if (!jugadores || !Array.isArray(jugadores)) {
        return new Response(JSON.stringify({ error: 'Datos de jugadores inválidos' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Crear backup antes de actualizar
      const backupPath = path.join(process.cwd(), 'src', 'data', 'transfermarkt-backup.json');
      const currentData = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(backupPath, currentData);
      
      // Escribir los nuevos datos
      fs.writeFileSync(filePath, JSON.stringify(jugadores, null, 2));
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Archivo Transfermarkt reemplazado exitosamente',
        jugadoresActualizados: jugadores.length,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Acción no reconocida' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error actualizando Transfermarkt:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Error interno del servidor',
      details: error.message,
      tipo: 'transfermarkt'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ 
    message: 'Endpoint para actualizar valores de Transfermarkt. Use POST para enviar datos.',
    usage: {
      method: 'POST',
      body: {
        accion: 'actualizar_transfermarkt',
        jugadoresActualizados: 'Objeto con nombre del jugador como clave y datos actualizados como valor'
      }
    },
    tipo: 'transfermarkt'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
