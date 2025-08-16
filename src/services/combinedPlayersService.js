import fs from 'fs';
import path from 'path';

/**
 * Servicio para combinar jugadores reales de La Liga + jugadores personalizados
 * Genera rankings realistas de goleadores y asistidores mezclando ambos tipos
 */
class CombinedPlayersService {
  constructor() {
    this.playersData = [];
    this.loadPlayersData();
    
    // Jugadores reales de La Liga con stats aleatorias
    this.realPlayers = [
      // Real Madrid
      { name: 'Vinicius Jr.', team: 'Real Madrid', position: 'EXT', photo: '/jugadores/vinicius.png' },
      { name: 'Karim Benzema', team: 'Real Madrid', position: 'DEL', photo: '/jugadores/benzema.png' },
      { name: 'Luka Modrić', team: 'Real Madrid', position: 'CEN', photo: '/jugadores/modric.png' },
      { name: 'Toni Kroos', team: 'Real Madrid', position: 'CEN', photo: '/jugadores/kroos.png' },
      { name: 'Federico Valverde', team: 'Real Madrid', position: 'CEN', photo: '/jugadores/valverde.png' },
      
      // FC Barcelona  
      { name: 'Robert Lewandowski', team: 'FC Barcelona', position: 'DEL', photo: '/jugadores/lewandowski.png' },
      { name: 'Pedri', team: 'FC Barcelona', position: 'CEN', photo: '/jugadores/pedri.png' },
      { name: 'Gavi', team: 'FC Barcelona', position: 'CEN', photo: '/jugadores/gavi.png' },
      { name: 'Raphinha', team: 'FC Barcelona', position: 'EXT', photo: '/jugadores/raphinha.png' },
      { name: 'Ferran Torres', team: 'FC Barcelona', position: 'EXT', photo: '/jugadores/ferran.png' },
      
      // Atlético Madrid
      { name: 'Antoine Griezmann', team: 'Atlético Madrid', position: 'DEL', photo: '/jugadores/griezmann.png' },
      { name: 'João Félix', team: 'Atlético Madrid', position: 'DEL', photo: '/jugadores/joaofelix.png' },
      { name: 'Koke', team: 'Atlético Madrid', position: 'CEN', photo: '/jugadores/koke.png' },
      { name: 'Álvaro Morata', team: 'Atlético Madrid', position: 'DEL', photo: '/jugadores/morata.png' },
      { name: 'Yannick Carrasco', team: 'Atlético Madrid', position: 'EXT', photo: '/jugadores/carrasco.png' },
      
      // Athletic Club
      { name: 'Iñaki Williams', team: 'Athletic Club', position: 'EXT', photo: '/jugadores/inaki.png' },
      { name: 'Nico Williams', team: 'Athletic Club', position: 'EXT', photo: '/jugadores/nico.png' },
      { name: 'Oihan Sancet', team: 'Athletic Club', position: 'CEN', photo: '/jugadores/sancet.png' },
      { name: 'Gorka Guruzeta', team: 'Athletic Club', position: 'DEL', photo: '/jugadores/guruzeta.png' },
      { name: 'Mikel Vesga', team: 'Athletic Club', position: 'CEN', photo: '/jugadores/vesga.png' },
      
      // Real Sociedad
      { name: 'Alexander Isak', team: 'Real Sociedad', position: 'DEL', photo: '/jugadores/isak.png' },
      { name: 'Mikel Oyarzabal', team: 'Real Sociedad', position: 'EXT', photo: '/jugadores/oyarzabal.png' },
      { name: 'David Silva', team: 'Real Sociedad', position: 'CEN', photo: '/jugadores/silva.png' },
      { name: 'Martin Ødegaard', team: 'Real Sociedad', position: 'CEN', photo: '/jugadores/odegaard.png' },
      { name: 'Takefusa Kubo', team: 'Real Sociedad', position: 'EXT', photo: '/jugadores/kubo.png' }
    ];
  }

  /**
   * Cargar jugadores personalizados del JSON
   */
  loadPlayersData() {
    try {
      const backupFile = 'src/data/players-backup.json';
      if (fs.existsSync(backupFile)) {
        const playersJson = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
        
        // Filtrar solo jugadores de equipos personalizados y convertir formato
        this.playersData = playersJson
          .filter(player => ['Nike FC', 'Adidas FC', 'Puma FC', 'Kappa FC'].includes(player.equipo))
          .map(player => ({
            name: player.nombre,
            team: player.equipo,
            position: this.convertPosition(player.posicion),
            photo: player.foto, // Ya tiene formato /jugadores/nombre.png
            age: player.edad,
            ovr: player.ovr || 75,
            // Usar stats existentes si están disponibles, sino generar
            currentGoals: player.goles || 0,
            currentAssists: player.asistencias || 0,
            matches: player.partidos_jugados || 0
          }));
          
        console.log(`✅ Cargados ${this.playersData.length} jugadores personalizados del JSON`);
      }
    } catch (error) {
      console.warn('No se pudieron cargar jugadores del JSON:', error.message);
      this.playersData = [];
    }
  }

  /**
   * Convertir códigos de posición a nombres legibles
   */
  convertPosition(positionCode) {
    const positions = {
      'POR': 'Portero',
      'DFC': 'Defensa',
      'DC': 'Defensa Central', 
      'MC': 'Centrocampista',
      'DEL': 'Delantero',
      'EXT': 'Extremo',
      'CEN': 'Centrocampista'
    };
    return positions[positionCode] || positionCode;
  }

  /**
   * Generar stats aleatorias realistas basadas en la posición
   */
  generateRealisticStats(position) {
    let goals, assists;
    
    switch (position) {
      case 'DEL': // Delantero
      case 'Delantero':
        goals = Math.floor(Math.random() * 25) + 5; // 5-29 goles
        assists = Math.floor(Math.random() * 12) + 2; // 2-13 asistencias
        break;
        
      case 'EXT': // Extremo
      case 'Extremo':
        goals = Math.floor(Math.random() * 18) + 3; // 3-20 goles
        assists = Math.floor(Math.random() * 15) + 5; // 5-19 asistencias
        break;
        
      case 'CEN': // Centrocampista
      case 'MC':
      case 'Centrocampista':
        goals = Math.floor(Math.random() * 12) + 1; // 1-12 goles
        assists = Math.floor(Math.random() * 18) + 3; // 3-20 asistencias
        break;
        
      case 'DFC': // Defensa
      case 'DC':
      case 'Defensa':
      case 'Defensa Central':
        goals = Math.floor(Math.random() * 6) + 0; // 0-5 goles
        assists = Math.floor(Math.random() * 5) + 0; // 0-4 asistencias
        break;
        
      case 'POR': // Portero
      case 'Portero':
        goals = Math.floor(Math.random() * 2); // 0-1 goles
        assists = Math.floor(Math.random() * 2); // 0-1 asistencias
        break;
        
      default:
        goals = Math.floor(Math.random() * 15) + 2;
        assists = Math.floor(Math.random() * 10) + 1;
    }
    
    return {
      goals,
      assists,
      matches: Math.floor(Math.random() * 15) + 20, // 20-34 partidos
      minutes: Math.floor(Math.random() * 2000) + 1000 // 1000-2999 minutos
    };
  }

  /**
   * Generar ranking completo de goleadores mezclando reales y personalizados
   */
  generateGoalScorers(limit = 50) {
    const allPlayers = [];
    
    // Añadir jugadores reales con stats aleatorias
    this.realPlayers.forEach(player => {
      const stats = this.generateRealisticStats(player.position);
      allPlayers.push({
        jugador: player.name,
        equipo: player.team,
        posicion: player.position,
        goles: stats.goals,
        asistencias: stats.assists,
        partidos: stats.matches,
        minutos: stats.minutes,
        goles_por_partido: (stats.goals / stats.matches).toFixed(2),
        foto: player.photo,
        custom_player: false,
        ovr: Math.floor(Math.random() * 15) + 80 // 80-94 OVR
      });
    });
    
    // Añadir jugadores personalizados con stats aleatorias
    this.playersData.forEach(player => {
      // Si ya tienen stats, usarlas, sino generar nuevas
      let stats;
      if (player.currentGoals > 0 || player.currentAssists > 0 || player.matches > 0) {
        stats = {
          goals: player.currentGoals,
          assists: player.currentAssists, 
          matches: player.matches || 20,
          minutes: player.matches * 90 || 1800
        };
      } else {
        stats = this.generateRealisticStats(player.position);
      }
      
      allPlayers.push({
        jugador: player.name,
        equipo: player.team,
        posicion: player.position,
        goles: stats.goals,
        asistencias: stats.assists,
        partidos: stats.matches,
        minutos: stats.minutes,
        goles_por_partido: (stats.goals / stats.matches).toFixed(2),
        foto: player.photo,
        custom_player: true,
        ovr: player.ovr
      });
    });
    
    // Ordenar por goles descendente y agregar posiciones
    const sortedPlayers = allPlayers
      .sort((a, b) => {
        if (b.goles !== a.goles) return b.goles - a.goles;
        return parseFloat(b.goles_por_partido) - parseFloat(a.goles_por_partido);
      })
      .slice(0, limit)
      .map((player, index) => ({
        ...player,
        posicion_ranking: index + 1
      }));
    
    console.log(`✅ Ranking de goleadores generado: ${sortedPlayers.length} jugadores`);
    console.log(`📊 Reales: ${sortedPlayers.filter(p => !p.custom_player).length}, Personalizados: ${sortedPlayers.filter(p => p.custom_player).length}`);
    console.log(`🥇 Pichichi: ${sortedPlayers[0]?.jugador} (${sortedPlayers[0]?.equipo}) - ${sortedPlayers[0]?.goles} goles`);
    
    return sortedPlayers;
  }

  /**
   * Generar ranking completo de asistidores mezclando reales y personalizados
   */
  generateAssists(limit = 50) {
    const allPlayers = [];
    
    // Añadir jugadores reales con stats aleatorias
    this.realPlayers.forEach(player => {
      const stats = this.generateRealisticStats(player.position);
      allPlayers.push({
        jugador: player.name,
        equipo: player.team,
        posicion: player.position,
        goles: stats.goals,
        asistencias: stats.assists,
        partidos: stats.matches,
        minutos: stats.minutes,
        asistencias_por_partido: (stats.assists / stats.matches).toFixed(2),
        foto: player.photo,
        custom_player: false,
        ovr: Math.floor(Math.random() * 15) + 80
      });
    });
    
    // Añadir jugadores personalizados con stats aleatorias
    this.playersData.forEach(player => {
      let stats;
      if (player.currentGoals > 0 || player.currentAssists > 0 || player.matches > 0) {
        stats = {
          goals: player.currentGoals,
          assists: player.currentAssists,
          matches: player.matches || 20,
          minutes: player.matches * 90 || 1800
        };
      } else {
        stats = this.generateRealisticStats(player.position);
      }
      
      allPlayers.push({
        jugador: player.name,
        equipo: player.team,
        posicion: player.position,
        goles: stats.goals,
        asistencias: stats.assists,
        partidos: stats.matches,
        minutos: stats.minutes,
        asistencias_por_partido: (stats.assists / stats.matches).toFixed(2),
        foto: player.photo,
        custom_player: true,
        ovr: player.ovr
      });
    });
    
    // Ordenar por asistencias descendente y agregar posiciones
    const sortedPlayers = allPlayers
      .sort((a, b) => {
        if (b.asistencias !== a.asistencias) return b.asistencias - a.asistencias;
        return parseFloat(b.asistencias_por_partido) - parseFloat(a.asistencias_por_partido);
      })
      .slice(0, limit)
      .map((player, index) => ({
        ...player,
        posicion_ranking: index + 1
      }));
    
    console.log(`✅ Ranking de asistidores generado: ${sortedPlayers.length} jugadores`);
    console.log(`📊 Reales: ${sortedPlayers.filter(p => !p.custom_player).length}, Personalizados: ${sortedPlayers.filter(p => p.custom_player).length}`);
    console.log(`🅰️ Líder: ${sortedPlayers[0]?.jugador} (${sortedPlayers[0]?.equipo}) - ${sortedPlayers[0]?.asistencias} asistencias`);
    
    return sortedPlayers;
  }

  /**
   * Obtener estadísticas del servicio
   */
  getStats() {
    return {
      totalRealPlayers: this.realPlayers.length,
      totalCustomPlayers: this.playersData.length,
      totalPlayers: this.realPlayers.length + this.playersData.length,
      customTeams: [...new Set(this.playersData.map(p => p.team))],
      realTeams: [...new Set(this.realPlayers.map(p => p.team))]
    };
  }

  /**
   * Regenerar stats para todos los jugadores (útil para testing)
   */
  regenerateAllStats() {
    console.log('🔄 Regenerando estadísticas aleatorias para todos los jugadores...');
    // Las stats se generan dinámicamente cada vez que se llama a los métodos
    // No es necesario almacenar permanentemente
    console.log('✅ Stats regeneradas - se aplicarán en el próximo ranking');
  }
}

export default new CombinedPlayersService();
