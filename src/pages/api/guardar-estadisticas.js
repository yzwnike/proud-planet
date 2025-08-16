import fs from 'fs';
import path from 'path';

export async function POST({ request }) {
  try {
    console.log('📥 Recibida petición POST para guardar estadísticas');
    
    // Validar que hay contenido
    const contentType = request.headers.get('content-type');
    console.log('📋 Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Content-Type inválido:', contentType);
      return new Response(JSON.stringify({ error: 'Content-Type debe ser application/json' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.text();
    console.log('📄 Body recibido:', body.substring(0, 200) + '...');
    
    if (!body || body.trim() === '') {
      console.error('❌ Body vacío');
      return new Response(JSON.stringify({ error: 'Body de la petición vacío' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let data;
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      console.error('❌ Error al parsear JSON:', parseError.message);
      console.error('📄 Body problemático:', body);
      return new Response(JSON.stringify({ 
        error: 'JSON inválido', 
        details: parseError.message,
        receivedBody: body.substring(0, 500)
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { jugadores } = data;
    
    if (!jugadores || !Array.isArray(jugadores)) {
      return new Response(JSON.stringify({ error: 'Datos de jugadores inválidos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ruta al archivo de jugadores
    const filePath = path.join(process.cwd(), 'src', 'data', 'players.json');
    
    // Leer datos actuales
    const currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Crear backup antes de actualizar
    const backupPath = path.join(process.cwd(), 'src', 'data', 'players-backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(currentData, null, 2));
    
    // Actualizar solo los jugadores que están en la lista
    const jugadoresActualizados = currentData.map(jugadorActual => {
      const jugadorNuevo = jugadores.find(j => j.nombre === jugadorActual.nombre);
      if (jugadorNuevo) {
        // Actualizar campos específicos sin perder otros datos
        return {
          ...jugadorActual,
          puntos: jugadorNuevo.puntos || 0,
          goles: jugadorNuevo.goles || jugadorActual.goles || 0,
          asistencias: jugadorNuevo.asistencias || jugadorActual.asistencias || 0,
          tarjetasAmarillas: jugadorNuevo.tarjetasAmarillas || jugadorActual.tarjetasAmarillas || 0,
          tarjetasRojas: jugadorNuevo.tarjetasRojas || jugadorActual.tarjetasRojas || 0,
          // Conservar otros campos existentes
          variacion: jugadorActual.variacion || 0,
          valor_mercado: jugadorActual.valor_mercado,
          edad: jugadorActual.edad,
          equipo: jugadorActual.equipo,
          foto: jugadorActual.foto,
          ovr: jugadorActual.ovr,
          posicion: jugadorActual.posicion
        };
      }
      return jugadorActual;
    });
    
    // Escribir los nuevos datos
    fs.writeFileSync(filePath, JSON.stringify(jugadoresActualizados, null, 2));
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Estadísticas guardadas exitosamente',
      jugadoresActualizados: jugadores.length,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Error al guardar estadísticas:', error);
    
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
    message: 'Endpoint para guardar estadísticas. Use POST para enviar datos.',
    usage: {
      method: 'POST',
      body: {
        jugadores: 'Array de objetos jugador con estadísticas actualizadas'
      }
    }
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
