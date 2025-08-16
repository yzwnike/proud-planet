const LALIGA_API_URL = 'https://raw.githubusercontent.com/openfootball/football.json/master/2025-26/es.1.json';

// Equipos personalizados y partidos simulados
const customTeams = [
  { nombre: "Nike FC", estadio: "Estadio Nike" },
  { nombre: "Adidas FC", estadio: "Estadio Adidas" },
  { nombre: "Puma FC", estadio: "Estadio Puma" },
  { nombre: "Kappa FC", estadio: "Estadio Kappa" }
];

const realTeams = [
  'Real Madrid', 'FC Barcelona', 'Atlético Madrid', 'Athletic Club',
  'Real Sociedad', 'Villarreal', 'Real Betis', 'Sevilla',
  'Valencia', 'Espanyol', 'Osasuna', 'Celta de Vigo',
  'Rayo Vallecano', 'Mallorca', 'Levante', 'Alavés',
  'Getafe', 'Girona', 'Elche', 'Real Oviedo'
];

// Generar partidos personalizados
function generateCustomMatches(limit = 10) {
  const matches = [];
  const startDate = new Date('2025-08-15');
  
  for (let round = 1; round <= 10; round++) {
    const roundDate = new Date(startDate);
    roundDate.setDate(startDate.getDate() + (round - 1) * 7);
    
    customTeams.forEach((customTeam, index) => {
      const rivalIndex = ((round - 1) * customTeams.length + index) % realTeams.length;
      const rival = realTeams[rivalIndex];
      
      const isHome = round % 2 === 1;
      const team1 = isHome ? customTeam.nombre : rival;
      const team2 = isHome ? rival : customTeam.nombre;
      
      const hours = [17, 19, 21, 22];
      const hour = hours[index % hours.length];
      
      matches.push({
        round: `Matchday ${round}`,
        date: roundDate.toISOString().split('T')[0],
        time: `${hour.toString().padStart(2, '0')}:00`,
        team1: team1,
        team2: team2,
        venue: isHome ? customTeam.estadio : null,
        custom_match: true
      });
    });
  }
  
  return matches
    .filter(match => {
      const matchDate = new Date(match.date + 'T00:00:00Z');
      return matchDate > new Date('2025-08-14T00:00:00Z');
    })
    .slice(0, limit);
}

export async function GET({ url }) {
  try {
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const includeCustom = url.searchParams.get('includeCustom') === 'true';
    
    let allMatches = [];
    
    // Obtener próximos partidos de la API de La Liga (equipos reales)
    try {
      const response = await fetch(LALIGA_API_URL);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.matches && data.matches.length > 0) {
          const cutoffDate = new Date('2025-08-14T00:00:00Z');
          
          const realMatches = data.matches
            .filter(match => {
              const matchDate = new Date(match.date + 'T00:00:00Z');
              return matchDate > cutoffDate;
            })
            .map(match => ({
              round: match.round,
              date: match.date,
              time: match.time,
              team1: match.team1,
              team2: match.team2,
              venue: match.venue || null,
              custom_match: false
            }));
          
          allMatches = [...allMatches, ...realMatches];
        }
      }
    } catch (fetchError) {
      console.error('Error fetching real matches:', fetchError);
    }
    
    // Añadir partidos de equipos personalizados si está habilitado
    if (includeCustom) {
      const customMatches = generateCustomMatches(limit);
      allMatches = [...allMatches, ...customMatches];
    }
    
    // Ordenar por fecha y hora, y limitar resultados
    const sortedMatches = allMatches
      .sort((a, b) => {
        const dateA = new Date(a.date + 'T' + (a.time || '00:00') + ':00Z');
        const dateB = new Date(b.date + 'T' + (b.time || '00:00') + ':00Z');
        return dateA - dateB;
      })
      .slice(0, limit);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        ultima_actualizacion: new Date().toISOString(),
        temporada: '2025-26',
        proximos_partidos: sortedMatches,
        total_encontrados: sortedMatches.length,
        incluye_personalizados: includeCustom
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting upcoming matches:', error);
    return new Response(JSON.stringify({
      success: true,
      data: {
        ultima_actualizacion: new Date().toISOString(),
        temporada: '2025-26',
        proximos_partidos: [],
        error: 'No se pudieron obtener los partidos'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
