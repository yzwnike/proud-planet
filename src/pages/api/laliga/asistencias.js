import combinedPlayersService from '../../../services/combinedPlayersService.js';

// API-Football para La Liga (RapidAPI) - Para asistidores (no se usa más)
const API_FOOTBALL_ASSISTS = 'https://v3.football.api-sports.io/players/topassists';
const RAPIDAPI_KEY = 'demo'; // Necesitarás registrarte en RapidAPI para obtener una key real

// Como fallback, usando la API de goleadores de football-data.org para obtener jugadores reales
const FOOTBALL_DATA_API = 'https://api.football-data.org/v4/competitions/PD/scorers';
const API_KEY = 'demo';

// Jugadores de equipos personalizados (creativos)
const customAssistPlayers = [
  { name: 'Creative Nike', team: 'Nike FC' },
  { name: 'Playmaker Swoosh', team: 'Nike FC' },
  { name: 'Vision Air', team: 'Nike FC' },
  { name: 'Maestro Adidas', team: 'Adidas FC' },
  { name: 'Assist Trefoil', team: 'Adidas FC' },
  { name: 'Pass Stripes', team: 'Adidas FC' },
  { name: 'Magic Puma', team: 'Puma FC' },
  { name: 'Creator Cat', team: 'Puma FC' },
  { name: 'Genius Form', team: 'Puma FC' },
  { name: 'Alpha Creator', team: 'Kappa FC' },
  { name: 'Beta Assist', team: 'Kappa FC' },
  { name: 'Gamma Vision', team: 'Kappa FC' }
];

// Intentar obtener asistidores reales de API-Football
async function fetchRealAssisters() {
  try {
    const response = await fetch(`${API_FOOTBALL_ASSISTS}?league=140&season=2024`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    });
    
    if (!response.ok) {
      console.warn('API-Football call failed, trying fallback');
      return await fetchPlayersFromScorersAPI();
    }
    
    const data = await response.json();
    
    return data.response?.map((assister, index) => ({
      posicion: index + 1,
      jugador: assister.player?.name || 'Jugador desconocido',
      equipo: assister.statistics?.[0]?.team?.name || 'Equipo desconocido',
      asistencias: assister.statistics?.[0]?.goals?.assists || 0,
      pases_clave: assister.statistics?.[0]?.passes?.key || 0,
      centros_exitosos: assister.statistics?.[0]?.passes?.accuracy || 0,
      minutos_jugados: assister.statistics?.[0]?.games?.minutes || 0,
      partidos_jugados: assister.statistics?.[0]?.games?.appearences || 0,
      asistencias_por_partido: assister.statistics?.[0]?.games?.appearences 
        ? (assister.statistics[0].goals.assists / assister.statistics[0].games.appearences).toFixed(2) 
        : 0.0,
      custom_player: false
    })) || [];
  } catch (error) {
    console.error('Error fetching assisters from API-Football:', error);
    return await fetchPlayersFromScorersAPI();
  }
}

// Fallback: obtener jugadores de la API de goleadores y simular asistencias
async function fetchPlayersFromScorersAPI() {
  try {
    const response = await fetch(FOOTBALL_DATA_API, {
      headers: {
        'X-Auth-Token': API_KEY
      }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    // Tomar jugadores de la API de goleadores y convertirlos en "asistidores" con 0 asistencias
    return data.scorers?.slice(0, 30).map((scorer, index) => ({
      posicion: index + 1,
      jugador: scorer.player?.name || 'Jugador desconocido',
      equipo: scorer.team?.shortName || scorer.team?.name || 'Equipo desconocido',
      asistencias: 0, // Inicio de temporada
      pases_clave: 0,
      centros_exitosos: 0,
      minutos_jugados: 0,
      partidos_jugados: 0,
      asistencias_por_partido: 0.0,
      custom_player: false
    })) || [];
  } catch (error) {
    console.error('Error fetching players from scorers API:', error);
    return [];
  }
}

// Generar ranking completo de asistidores
async function generateAssists() {
  const realAssisters = await fetchRealAssisters();
  
  // Si no hay datos reales, usar solo equipos personalizados
  if (realAssisters.length === 0) {
    return customAssistPlayers.map((player, index) => ({
      posicion: index + 1,
      jugador: player.name,
      equipo: player.team,
      asistencias: 0,
      pases_clave: 0,
      centros_exitosos: 0,
      minutos_jugados: 0,
      partidos_jugados: 0,
      asistencias_por_partido: 0.0,
      custom_player: true
    }));
  }
  
  // Añadir jugadores personalizados al final
  const customAssisters = customAssistPlayers.map((player, index) => ({
    posicion: realAssisters.length + index + 1,
    jugador: player.name,
    equipo: player.team,
    asistencias: 0,
    pases_clave: 0,
    centros_exitosos: 0,
    minutos_jugados: 0,
    partidos_jugados: 0,
    asistencias_por_partido: 0.0,
    custom_player: true
  }));
  
  return [...realAssisters, ...customAssisters];
}

export async function GET({ url }) {
  try {
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    
    console.log('🔄 Generando ranking de asistidores (reales + personalizados)...');
    
    // Usar el nuevo servicio combinado que mezcla jugadores reales y personalizados
    const assisters = combinedPlayersService.generateAssists(limit);
    
    // Convertir formato para compatibilidad
    const formattedAssisters = assisters.map((assister, index) => ({
      posicion: assister.posicion_ranking || index + 1,
      jugador: assister.jugador,
      equipo: assister.equipo,
      posicion_campo: assister.posicion,
      asistencias: assister.asistencias,
      goles: assister.goles,
      partidos_jugados: assister.partidos,
      minutos_jugados: assister.minutos,
      asistencias_por_partido: parseFloat(assister.asistencias_por_partido),
      pases_clave: Math.floor(assister.asistencias * 2.5), // Estimación
      centros_exitosos: Math.floor(assister.asistencias * 1.8), // Estimación
      foto: assister.foto,
      custom_player: assister.custom_player,
      ovr: assister.ovr
    }));
    
    console.log(`✅ Ranking generado: ${formattedAssisters.length} asistidores`);
    console.log(`📊 Mix: ${formattedAssisters.filter(p => !p.custom_player).length} reales + ${formattedAssisters.filter(p => p.custom_player).length} personalizados`);
    console.log(`🅰️ Líder: ${formattedAssisters[0]?.jugador} (${formattedAssisters[0]?.equipo}) - ${formattedAssisters[0]?.asistencias} asistencias`);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        ultima_actualizacion: new Date().toISOString(),
        temporada: '2025-26',
        jornada: Math.floor(Math.random() * 10) + 1, // Jornada simulada
        total_jugadores: formattedAssisters.length,
        asistentes: formattedAssisters
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting assists:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error al obtener asistencias'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
