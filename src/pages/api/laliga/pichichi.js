import combinedPlayersService from '../../../services/combinedPlayersService.js';

// API de football-data.org para La Liga (no se usa más)
const FOOTBALL_DATA_API = 'https://api.football-data.org/v4/competitions/PD/scorers';
const API_KEY = 'demo'; // Usar 'demo' para pruebas limitadas

// Jugadores de equipos personalizados para mezclar con datos reales
const customPlayers = [
  { name: 'Marcus Nike', team: 'Nike FC' },
  { name: 'Swoosh González', team: 'Nike FC' },
  { name: 'Air Jordan', team: 'Nike FC' },
  { name: 'Klaus Adidas', team: 'Adidas FC' },
  { name: 'Trefoil Rodríguez', team: 'Adidas FC' },
  { name: 'Stripes Müller', team: 'Adidas FC' },
  { name: 'Leo Puma', team: 'Puma FC' },
  { name: 'Cat Silva', team: 'Puma FC' },
  { name: 'Formstrip López', team: 'Puma FC' },
  { name: 'Kappa Alpha', team: 'Kappa FC' },
  { name: 'Beta Kappa', team: 'Kappa FC' },
  { name: 'Gamma Martínez', team: 'Kappa FC' }
];

// Obtener goleadores reales de la API
async function fetchRealScorers() {
  try {
    const response = await fetch(FOOTBALL_DATA_API, {
      headers: {
        'X-Auth-Token': API_KEY
      }
    });
    
    if (!response.ok) {
      console.warn('API call failed, using fallback data');
      return [];
    }
    
    const data = await response.json();
    
    return data.scorers?.map((scorer, index) => ({
      posicion: index + 1,
      jugador: scorer.player?.name || 'Jugador desconocido',
      equipo: scorer.team?.shortName || scorer.team?.name || 'Equipo desconocido',
      goles: scorer.goals || 0,
      penaltis: scorer.penalties || 0,
      minutos_jugados: scorer.playedMatches * 90 || 0, // Estimación
      partidos_jugados: scorer.playedMatches || 0,
      goles_por_partido: scorer.playedMatches ? (scorer.goals / scorer.playedMatches).toFixed(2) : 0.0,
      custom_player: false
    })) || [];
  } catch (error) {
    console.error('Error fetching scorers from API:', error);
    return [];
  }
}

// Generar ranking completo mezclando datos reales y personalizados
async function generatePichichi() {
  const realScorers = await fetchRealScorers();
  
  // Si no hay datos reales (por límites de API), usar equipos personalizados solamente
  if (realScorers.length === 0) {
    return customPlayers.map((player, index) => ({
      posicion: index + 1,
      jugador: player.name,
      equipo: player.team,
      goles: 0, // Al inicio de temporada todos tienen 0
      penaltis: 0,
      minutos_jugados: 0,
      partidos_jugados: 0,
      goles_por_partido: 0.0,
      custom_player: true
    }));
  }
  
  // Añadir jugadores personalizados con 0 goles al final
  const customScorers = customPlayers.map((player, index) => ({
    posicion: realScorers.length + index + 1,
    jugador: player.name,
    equipo: player.team,
    goles: 0,
    penaltis: 0,
    minutos_jugados: 0,
    partidos_jugados: 0,
    goles_por_partido: 0.0,
    custom_player: true
  }));
  
  return [...realScorers, ...customScorers];
}

export async function GET({ url }) {
  try {
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    
    console.log('🔄 Generando ranking de goleadores (reales + personalizados)...');
    
    // Usar el nuevo servicio combinado que mezcla jugadores reales y personalizados
    const goalScorers = combinedPlayersService.generateGoalScorers(limit);
    
    // Añadir posición en ranking y convertir formato para compatibilidad
    const formattedScorers = goalScorers.map((scorer, index) => ({
      posicion: scorer.posicion_ranking || index + 1,
      jugador: scorer.jugador,
      equipo: scorer.equipo,
      posicion_campo: scorer.posicion,
      goles: scorer.goles,
      asistencias: scorer.asistencias,
      partidos_jugados: scorer.partidos,
      minutos_jugados: scorer.minutos,
      goles_por_partido: parseFloat(scorer.goles_por_partido),
      foto: scorer.foto,
      custom_player: scorer.custom_player,
      ovr: scorer.ovr
    }));
    
    console.log(`✅ Ranking generado: ${formattedScorers.length} goleadores`);
    console.log(`📊 Mix: ${formattedScorers.filter(p => !p.custom_player).length} reales + ${formattedScorers.filter(p => p.custom_player).length} personalizados`);
    console.log(`🥇 Pichichi: ${formattedScorers[0]?.jugador} (${formattedScorers[0]?.equipo}) - ${formattedScorers[0]?.goles} goles`);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        ultima_actualizacion: new Date().toISOString(),
        temporada: '2025-26',
        jornada: Math.floor(Math.random() * 10) + 1, // Jornada simulada
        total_jugadores: formattedScorers.length,
        goleadores: formattedScorers
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting goal scorers:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error al obtener goleadores'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
