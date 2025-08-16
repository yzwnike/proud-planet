import imageSearchService from '../../../services/imageSearchService.js';
import customTeamsService from '../../../services/customTeamsService.js';
import laLigaService from '../../../services/laLigaService.js';
import customResultsService from '../../../services/customResultsService.js';

// Equipos personalizados definidos directamente
const customTeams = [
  {
    id: 21, nombre: "Nike FC", nombre_corto: "Nike FC", ciudad: "Madrid",
    estadio: "Estadio Nike", fundado: 2024, escudo: "/escudos/nike-fc.svg",
    colores: { primario: "#ff6b35", secundario: "#ffffff" }, custom: true
  },
  {
    id: 22, nombre: "Adidas FC", nombre_corto: "Adidas FC", ciudad: "Barcelona",
    estadio: "Estadio Adidas", fundado: 2024, escudo: "/escudos/adidas-fc.svg",
    colores: { primario: "#000000", secundario: "#ffffff" }, custom: true
  },
  {
    id: 23, nombre: "Puma FC", nombre_corto: "Puma FC", ciudad: "Valencia",
    estadio: "Estadio Puma", fundado: 2024, escudo: "/escudos/puma-fc.svg",
    colores: { primario: "#005cbf", secundario: "#ffffff" }, custom: true
  },
  {
    id: 24, nombre: "Kappa FC", nombre_corto: "Kappa FC", ciudad: "Sevilla",
    estadio: "Estadio Kappa", fundado: 2024, escudo: "/escudos/kappa-fc.svg",
    colores: { primario: "#6b46c1", secundario: "#ffffff" }, custom: true
  }
];

const realTeams = [
  'Real Madrid', 'FC Barcelona', 'Atlético Madrid', 'Athletic Club',
  'Real Sociedad', 'Villarreal', 'Real Betis', 'Sevilla',
  'Valencia', 'Espanyol', 'Osasuna', 'Celta de Vigo',
  'Rayo Vallecano', 'Mallorca', 'Levante', 'Alavés',
  'Getafe', 'Girona', 'Elche', 'Real Oviedo'
];

export async function GET({ url }) {
  try {
    const includeCustom = url.searchParams.get('includeCustom') === 'true';

    console.log('🔄 Obteniendo clasificación con imágenes automáticas...');
    
    // Usar el servicio de La Liga que ya incluye imágenes automáticas
    const standings = await laLigaService.generateStandings();
    
    let finalStandings = standings;
    
    // Añadir equipos personalizados si está habilitado
    if (includeCustom) {
      try {
        // Obtener clasificación de equipos personalizados con resultados reales
        const customStandings = customResultsService.getCurrentStandings();
        
        // Si no hay datos, crear equipos con estadísticas en 0
        let teamsToProcess;
        if (customStandings.length === 0) {
          console.log('📊 Creando equipos iniciales con 0 puntos...');
          teamsToProcess = customTeams.map(team => {
            const teamData = {
              team: team.nombre,
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              goalDifference: 0,
              points: 0,
              form: []
            };
            console.log(`⚙️ Creando equipo: ${teamData.team}`);
            return teamData;
          });
        } else {
          console.log('📊 Usando clasificación existente...');
          teamsToProcess = customStandings;
        }
        
        // Transformar formato para compatibilidad con la vista
        const transformedCustomStandings = teamsToProcess.map((team, index) => {
          console.log(`🔧 Procesando equipo completo:`, team);
          
          // Obtener el nombre del equipo (diferentes formatos posibles)
          const teamName = team.equipo || team.team || team.nombre || `Equipo ${index + 1}`;
          console.log(`📝 Nombre del equipo: ${teamName}`);
          
          // Logos simples por equipo
          const teamLogos = {
            'Nike FC': '/escudos/nike-fc.svg',
            'Adidas FC': '/escudos/adidas-fc.svg', 
            'Puma FC': '/escudos/puma-fc.svg',
            'Kappa FC': '/escudos/kappa-fc.svg'
          };
          
          const result = {
            posicion: standings.length + index + 1,
            equipo: teamName,
            // Mapear desde customResultsService (español) a formato esperado
            partidos_jugados: team.partidos_jugados || team.played || 0,
            ganados: team.ganados || team.won || 0,
            empatados: team.empatados || team.drawn || 0,
            perdidos: team.perdidos || team.lost || 0,
            goles_favor: team.goles_favor || team.goalsFor || 0,
            goles_contra: team.goles_contra || team.goalsAgainst || 0,
            diferencia_goles: team.diferencia_goles || team.goalDifference || 0,
            puntos: team.puntos || team.points || 0,
            ultimos_5: team.ultimos_5 || team.form || [],
            escudo: teamLogos[teamName] || '🏆',
            custom: true
          };
          
          console.log(`✅ Equipo procesado:`, result);
          return result;
        });
        
        // Combinar clasificaciones y reordenar por puntos
        const allTeams = [...standings, ...transformedCustomStandings];
        
        // Ordenar por puntos, diferencia de goles, goles a favor
        finalStandings = allTeams
          .sort((a, b) => {
            if (b.puntos !== a.puntos) return b.puntos - a.puntos;
            if (b.diferencia_goles !== a.diferencia_goles) return b.diferencia_goles - a.diferencia_goles;
            return b.goles_favor - a.goles_favor;
          })
          .map((team, index) => ({ ...team, posicion: index + 1 }));
          
        console.log(`📊 Equipos personalizados añadidos: ${transformedCustomStandings.length}`);
        console.log(`🏆 Equipos custom:`, transformedCustomStandings.map(t => t.equipo));
          
      } catch (error) {
        console.error('Error al obtener clasificación de equipos personalizados:', error);
        // Si hay error, usar la clasificación sin equipos personalizados
        finalStandings = standings;
      }
    }
    
    console.log(`✅ Clasificación generada con ${finalStandings.length} equipos y logos automáticos`);
    console.log(`📊 Primeros 3 logos:`, finalStandings.slice(0, 3).map(t => ({ equipo: t.equipo, escudo: t.escudo })));
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        ultima_actualizacion: new Date().toISOString(),
        temporada: '2025-26',
        jornada: 0,
        clasificacion: finalStandings
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting standings:', error);
    return new Response(JSON.stringify({
      success: false, 
      error: 'Error al obtener la clasificación'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
