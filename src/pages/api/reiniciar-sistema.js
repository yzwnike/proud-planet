import fs from 'fs';
import path from 'path';

export async function POST({ request }) {
  try {
    console.log('🔄 INICIANDO REINICIO COMPLETO DEL SISTEMA...');
    
    // Ruta al archivo de jugadores
    const playersPath = path.join(process.cwd(), 'src', 'data', 'players.json');
    
    // Crear backup antes de reiniciar
    const backupPath = path.join(process.cwd(), 'src', 'data', `players-backup-${Date.now()}.json`);
    const currentData = fs.readFileSync(playersPath, 'utf8');
    fs.writeFileSync(backupPath, currentData);
    console.log('📋 Backup creado:', backupPath);
    
    // Leer jugadores actuales
    const jugadores = JSON.parse(currentData);
    console.log('👥 Total jugadores encontrados:', jugadores.length);
    
    // Reiniciar estadísticas de todos los jugadores
    const jugadoresReiniciados = jugadores.map(jugador => ({
      ...jugador,
      puntos: 0,
      goles: 0,
      asistencias: 0,
      tarjetas_amarillas: 0,
      tarjetas_rojas: 0,
      partidos_jugados: 0,
      ultima_actualizacion: new Date().toISOString()
    }));
    
    // Guardar archivo reiniciado
    fs.writeFileSync(playersPath, JSON.stringify(jugadoresReiniciados, null, 2));
    console.log('✅ Archivo players.json reiniciado');
    
    // Log de algunos jugadores reiniciados para verificar
    const ejemplos = jugadoresReiniciados.slice(0, 3);
    ejemplos.forEach(jugador => {
      console.log(`🔄 ${jugador.nombre}: ${jugador.puntos} pts, ${jugador.goles} goles, ${jugador.partidos_jugados} partidos`);
    });
    
    return new Response(JSON.stringify({
      success: true,
      mensaje: 'Sistema reiniciado completamente',
      detalles: {
        jugadoresReiniciados: jugadoresReiniciados.length,
        backupCreado: backupPath,
        fechaReinicio: new Date().toISOString()
      },
      instrucciones: {
        localStorage: 'Debes limpiar manualmente el localStorage del navegador',
        pasos: [
          '1. Abre DevTools (F12)',
          '2. Ve a Application/Storage → Local Storage',
          '3. Elimina todas las keys que contengan:',
          '   - estadisticasJugadores',
          '   - estadisticasPartidos', 
          '   - jornadas_Nike FC',
          '   - jornadas_Adidas FC',
          '   - jornadas_Puma FC',
          '   - jornadas_Kappa FC',
          '   - estado_jugadores_[equipo]'
        ]
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error al reiniciar sistema:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Error al reiniciar el sistema',
      detalles: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({
    message: '🔄 Endpoint para reiniciar completamente el sistema',
    descripcion: 'Reinicia todos los puntos de jugadores a 0 y limpia estadísticas',
    uso: {
      method: 'POST',
      body: 'No requiere parámetros',
      efectos: [
        'Todos los jugadores tendrán 0 puntos',
        'Todos los jugadores tendrán 0 goles/asistencias', 
        'Todos los jugadores tendrán 0 partidos jugados',
        'Se crea un backup automático',
        'NOTA: También debes limpiar localStorage manualmente'
      ]
    },
    advertencia: '⚠️ Esta acción no se puede deshacer (excepto por el backup)'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
