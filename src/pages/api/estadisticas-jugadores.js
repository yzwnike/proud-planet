import fs from 'fs';
import path from 'path';

const ESTADISTICAS_FILE = path.join(process.cwd(), 'src', 'data', 'estadisticas-jugadores.json');

// Función helper para leer estadísticas
function leerEstadisticas() {
  try {
    if (!fs.existsSync(ESTADISTICAS_FILE)) {
      fs.writeFileSync(ESTADISTICAS_FILE, '{}');
    }
    const data = fs.readFileSync(ESTADISTICAS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo estadísticas de jugadores:', error);
    return {};
  }
}

// Función helper para guardar estadísticas
function guardarEstadisticas(estadisticas) {
  try {
    fs.writeFileSync(ESTADISTICAS_FILE, JSON.stringify(estadisticas, null, 2));
    return true;
  } catch (error) {
    console.error('Error guardando estadísticas de jugadores:', error);
    return false;
  }
}

export async function GET() {
  try {
    const estadisticas = leerEstadisticas();
    console.log(`📈 Sirviendo estadísticas para ${Object.keys(estadisticas).length} jugadores`);
    
    return new Response(JSON.stringify(estadisticas), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return new Response(JSON.stringify({ 
      error: 'Error al cargar estadísticas',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    const { nombre, partido } = await request.json();
    
    if (!nombre || !partido) {
      return new Response(JSON.stringify({ 
        error: 'Faltan datos requeridos: nombre y datos del partido' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const estadisticas = leerEstadisticas();
    
    // Inicializar estadísticas para el jugador si no existe
    if (!estadisticas[nombre]) {
      estadisticas[nombre] = {
        partidosJugados: 0,
        puntosTotal: 0,
        golesTotal: 0,
        asistenciasTotal: 0,
        tarjetasAmarillasTotal: 0,
        tarjetasRojasTotal: 0,
        lesionesTotal: 0,
        historial: []
      };
    }
    
    // Actualizar estadísticas acumuladas
    const stats = estadisticas[nombre];
    stats.partidosJugados += 1;
    stats.puntosTotal += partido.puntos || 0;
    stats.golesTotal += partido.goles || 0;
    stats.asistenciasTotal += partido.asistencias || 0;
    stats.tarjetasAmarillasTotal += partido.tarjetasAmarillas || 0;
    stats.tarjetasRojasTotal += partido.tarjetasRojas || 0;
    if (partido.lesion) stats.lesionesTotal += 1;
    
    // Agregar al historial
    stats.historial.push({
      fecha: new Date().toISOString(),
      puntos: partido.puntos || 0,
      goles: partido.goles || 0,
      asistencias: partido.asistencias || 0,
      tarjetasAmarillas: partido.tarjetasAmarillas || 0,
      tarjetasRojas: partido.tarjetasRojas || 0,
      lesion: partido.lesion || false
    });
    
    // Mantener solo los últimos 100 partidos por jugador
    if (stats.historial.length > 100) {
      stats.historial = stats.historial.slice(-100);
    }
    
    // Guardar cambios
    const guardado = guardarEstadisticas(estadisticas);
    
    if (guardado) {
      console.log(`✅ Partido agregado para ${nombre}: ${partido.puntos || 0} pts`);
      
      return new Response(JSON.stringify({
        success: true,
        message: `Partido agregado para ${nombre}`,
        estadisticas: stats,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Error al guardar archivo');
    }
    
  } catch (error) {
    console.error('❌ Error al agregar partido:', error);
    return new Response(JSON.stringify({ 
      error: 'Error al agregar partido',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT({ request }) {
  try {
    const { estadisticasCompletas } = await request.json();
    
    if (!estadisticasCompletas || typeof estadisticasCompletas !== 'object') {
      return new Response(JSON.stringify({ 
        error: 'Datos de estadísticas inválidos' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const guardado = guardarEstadisticas(estadisticasCompletas);
    
    if (guardado) {
      const totalJugadores = Object.keys(estadisticasCompletas).length;
      console.log(`✅ Estadísticas completas actualizadas para ${totalJugadores} jugadores`);
      
      return new Response(JSON.stringify({
        success: true,
        message: `Estadísticas actualizadas para ${totalJugadores} jugadores`,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Error al guardar archivo');
    }
    
  } catch (error) {
    console.error('❌ Error al actualizar estadísticas completas:', error);
    return new Response(JSON.stringify({ 
      error: 'Error al actualizar estadísticas completas',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
