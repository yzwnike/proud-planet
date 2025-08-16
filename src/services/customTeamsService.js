import imageSearchService from './imageSearchService.js';

// Servicio para manejar los 4 equipos personalizados
class CustomTeamsService {
  constructor() {
    // Definir los 4 equipos personalizados
    this.customTeams = [
      {
        id: 21,
        nombre: "Nike FC",
        nombre_corto: "Nike FC",
        ciudad: "Madrid",
        estadio: "Estadio Nike",
        fundado: 2024,
        escudo: "/escudos/nike-fc.svg",
        colores: {
          primario: "#ff6b35",
          secundario: "#ffffff"
        },
        custom: true
      },
      {
        id: 22,
        nombre: "Adidas FC",
        nombre_corto: "Adidas FC", 
        ciudad: "Barcelona",
        estadio: "Estadio Adidas",
        fundado: 2024,
        escudo: "/escudos/adidas-fc.svg",
        colores: {
          primario: "#000000",
          secundario: "#ffffff"
        },
        custom: true
      },
      {
        id: 23,
        nombre: "Puma FC",
        nombre_corto: "Puma FC",
        ciudad: "Valencia",
        estadio: "Estadio Puma",
        fundado: 2024,
        escudo: "/escudos/puma-fc.svg",
        colores: {
          primario: "#005cbf",
          secundario: "#ffffff"
        },
        custom: true
      },
      {
        id: 24,
        nombre: "Kappa FC",
        nombre_corto: "Kappa FC",
        ciudad: "Sevilla",
        estadio: "Estadio Kappa",
        fundado: 2024,
        escudo: "/escudos/kappa-fc.svg",
        colores: {
          primario: "#6b46c1",
          secundario: "#ffffff"
        },
        custom: true
      }
    ];

    // Equipos reales de La Liga 2025/26
    this.realTeams = [
      'Real Madrid', 'FC Barcelona', 'Atlético Madrid', 'Athletic Club',
      'Real Sociedad', 'Villarreal', 'Real Betis', 'Sevilla',
      'Valencia', 'Espanyol', 'Osasuna', 'Celta de Vigo',
      'Rayo Vallecano', 'Mallorca', 'Levante', 'Alavés',
      'Getafe', 'Girona', 'Elche', 'Real Oviedo'
    ];

    this.customMatches = null;
  }

  // Generar calendario de partidos para los equipos personalizados
  generateCustomMatches() {
    if (this.customMatches) {
      return this.customMatches;
    }

    const matches = [];
    const startDate = new Date('2025-08-15');
    const totalRounds = 38; // Total de jornadas de La Liga
    const matchesPerRound = this.customTeams.length; // 4 partidos por jornada (uno por cada equipo personalizado)

    // Para cada jornada
    for (let round = 1; round <= totalRounds; round++) {
      // Calcular fecha de la jornada (aproximadamente cada 7 días)
      const roundDate = new Date(startDate);
      roundDate.setDate(startDate.getDate() + (round - 1) * 7);
      
      // Para cada equipo personalizado
      this.customTeams.forEach((customTeam, index) => {
        // Seleccionar rival real de forma que haya variedad
        // Usar módulo para distribuir rivales de manera uniforme
        const rivalIndex = ((round - 1) * this.customTeams.length + index) % this.realTeams.length;
        const rival = this.realTeams[rivalIndex];
        
        // Alternar local/visitante según la jornada
        const isHome = round % 2 === 1;
        const team1 = isHome ? customTeam.nombre : rival;
        const team2 = isHome ? rival : customTeam.nombre;
        
        // Generar horarios diferentes para cada partido
        const hours = [17, 19, 21, 22];
        const minutes = [0, 15, 30, 45];
        const hour = hours[index % hours.length];
        const minute = minutes[index % minutes.length];
        
        matches.push({
          round: `Matchday ${round}`,
          date: roundDate.toISOString().split('T')[0],
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          team1: team1,
          team2: team2,
          custom_match: true,
          custom_team: customTeam.nombre,
          rival: rival,
          is_home: isHome,
          venue: isHome ? customTeam.estadio : null
        });
      });
    }

    this.customMatches = matches;
    return matches;
  }

  // Obtener próximos partidos de equipos personalizados
  getUpcomingCustomMatches(limit = 10) {
    const allMatches = this.generateCustomMatches();
    const today = new Date();
    const cutoffDate = new Date('2025-08-14T00:00:00Z');

    return allMatches
      .filter(match => {
        const matchDate = new Date(match.date + 'T00:00:00Z');
        return matchDate > cutoffDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time + ':00Z');
        const dateB = new Date(b.date + 'T' + b.time + ':00Z');
        return dateA - dateB;
      })
      .slice(0, limit);
  }

  // Generar estadísticas ficticias para los equipos personalizados
  generateCustomStandings() {
    return this.customTeams.map((team, index) => {
      // Generar estadísticas aleatorias pero realistas
      const partidosJugados = 0; // Al principio de temporada
      const ganados = 0;
      const empatados = 0;
      const perdidos = 0;
      const golesFavor = 0;
      const golesContra = 0;
      
      return {
        posicion: 21 + index, // Posiciones 21-24
        equipo: team.nombre,
        partidos_jugados: partidosJugados,
        ganados: ganados,
        empatados: empatados,
        perdidos: perdidos,
        goles_favor: golesFavor,
        goles_contra: golesContra,
        diferencia_goles: golesFavor - golesContra,
        puntos: ganados * 3 + empatados,
        ultimos_5: [],
        racha_actual: '',
        forma: 'neutral',
        custom: true,
        escudo: team.escudo,
        colores: team.colores
      };
    });
  }

  // Obtener información de un equipo personalizado
  getCustomTeam(teamName) {
    return this.customTeams.find(team => team.nombre === teamName);
  }

  // Obtener todos los equipos personalizados
  getAllCustomTeams() {
    return this.customTeams;
  }

  // Obtener escudo de un equipo (real o personalizado)
  getTeamLogo(teamName) {
    const customTeam = this.getCustomTeam(teamName);
    if (customTeam) {
      return customTeam.escudo;
    }

    // Para equipos reales, devolver una URL temporal que será reemplazada por la búsqueda automática
    return `/escudos/loading-${teamName.toLowerCase().replace(/\s+/g, '-')}.png`;
  }

  // Obtener escudo de un equipo automáticamente desde internet
  async getTeamLogoAuto(teamName) {
    const customTeam = this.getCustomTeam(teamName);
    if (customTeam) {
      return customTeam.escudo;
    }

    // Para equipos reales, buscar automáticamente en internet
    try {
      const logoUrl = await imageSearchService.getTeamLogo(teamName, 'laliga');
      return logoUrl;
    } catch (error) {
      console.error(`Error obteniendo logo automático para ${teamName}:`, error);
      return this.getDefaultTeamLogo(teamName);
    }
  }

  // Obtener logo por defecto para un equipo
  getDefaultTeamLogo(teamName) {
    const colors = ['FF6B35', '4ECDC4', '45B7D1', 'F9CA24', 'F0932B', 'EB4D4B', '6C5CE7'];
    const hash = teamName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const color = colors[hash % colors.length];
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&size=512&background=${color}&color=fff&format=png&rounded=true&bold=true`;
  }
}

// Precargar logos de todos los equipos reales al inicializar
const customTeamsService = new CustomTeamsService();

// Función para precargar todos los logos de equipos reales
customTeamsService.preloadAllTeamLogos = async function() {
  console.log('Precargando logos de equipos de La Liga...');
  try {
    const results = await imageSearchService.preloadTeamLogos(this.realTeams);
    console.log(`Logos precargados: ${results.filter(r => r.success).length}/${results.length}`);
    return results;
  } catch (error) {
    console.error('Error precargando logos:', error);
    return [];
  }
};

// Función para obtener todos los logos de equipos con URLs automáticas
customTeamsService.getAllTeamLogosWithAuto = async function() {
  const allTeams = [...this.realTeams, ...this.customTeams.map(t => t.nombre)];
  const logos = {};
  
  for (const teamName of allTeams) {
    try {
      logos[teamName] = await this.getTeamLogoAuto(teamName);
    } catch (error) {
      console.error(`Error obteniendo logo de ${teamName}:`, error);
      logos[teamName] = this.getDefaultTeamLogo(teamName);
    }
  }
  
  return logos;
};

export default customTeamsService;
