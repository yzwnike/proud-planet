import axios from 'axios';
import imageSearchService from './imageSearchService.js';
import playersService from './playersService.js';

const LALIGA_API_URL = 'https://raw.githubusercontent.com/openfootball/football.json/master/2025-26/es.1.json';

class LaLigaService {
  constructor() {
    this.cache = {
      matches: null,
      standings: null,
      lastUpdate: null
    };
  }

  // Obtener partidos de la temporada 2025-26
  async fetchMatches() {
    try {
      const response = await axios.get(LALIGA_API_URL, { timeout: 10000 });
      const data = response.data;
      this.cache.matches = data.matches || [];
      this.cache.lastUpdate = new Date();
      return data.matches || [];
    } catch (error) {
      console.error('Error fetching La Liga matches:', error);
      return [];
    }
  }

  // Procesar partidos para generar clasificación
  async generateStandings() {
    const matches = await this.fetchMatches();
    const standings = {};

    // Inicializar todos los equipos con estadísticas en 0
    const teams = this.getAllTeams(matches);
    
    // Si no hay equipos en los partidos, usar equipos predefinidos de La Liga
    const defaultTeams = teams.length === 0 ? [
      'Real Madrid', 'FC Barcelona', 'Atlético Madrid', 'Athletic Club',
      'Real Sociedad', 'Villarreal', 'Real Betis', 'Sevilla',
      'Valencia', 'Espanyol', 'Osasuna', 'Celta de Vigo',
      'Rayo Vallecano', 'Mallorca', 'Levante', 'Alavés',
      'Getafe', 'Girona', 'Elche', 'Real Oviedo'
    ] : teams;
    
    defaultTeams.forEach(team => {
      standings[team] = {
        equipo: team,
        partidos_jugados: 0,
        ganados: 0,
        empatados: 0,
        perdidos: 0,
        goles_favor: 0,
        goles_contra: 0,
        diferencia_goles: 0,
        puntos: 0,
        ultimos_5: [],
        racha_actual: '',
        forma: 'neutral'
      };
    });

    // Procesar solo partidos ya jugados
    const playedMatches = matches.filter(match => 
      match.score && match.score.ft && match.score.ft.length === 2
    );

    playedMatches.forEach(match => {
      const team1 = match.team1;
      const team2 = match.team2;
      const score1 = match.score.ft[0];
      const score2 = match.score.ft[1];

      // Actualizar estadísticas
      standings[team1].partidos_jugados++;
      standings[team2].partidos_jugados++;
      standings[team1].goles_favor += score1;
      standings[team1].goles_contra += score2;
      standings[team2].goles_favor += score2;
      standings[team2].goles_contra += score1;

      if (score1 > score2) {
        // Team1 gana
        standings[team1].ganados++;
        standings[team1].puntos += 3;
        standings[team2].perdidos++;
        standings[team1].ultimos_5.push('V');
        standings[team2].ultimos_5.push('D');
      } else if (score1 < score2) {
        // Team2 gana
        standings[team2].ganados++;
        standings[team2].puntos += 3;
        standings[team1].perdidos++;
        standings[team1].ultimos_5.push('D');
        standings[team2].ultimos_5.push('V');
      } else {
        // Empate
        standings[team1].empatados++;
        standings[team2].empatados++;
        standings[team1].puntos++;
        standings[team2].puntos++;
        standings[team1].ultimos_5.push('E');
        standings[team2].ultimos_5.push('E');
      }
    });

    // Calcular diferencia de goles y mantener solo los últimos 5 resultados
    Object.keys(standings).forEach(team => {
      standings[team].diferencia_goles = standings[team].goles_favor - standings[team].goles_contra;
      standings[team].ultimos_5 = standings[team].ultimos_5.slice(-5);
      standings[team].racha_actual = standings[team].ultimos_5[standings[team].ultimos_5.length - 1] || '';
    });

    // Convertir a array y ordenar por puntos, diferencia de goles, goles favor
    const standingsArray = Object.values(standings).sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      if (b.diferencia_goles !== a.diferencia_goles) return b.diferencia_goles - a.diferencia_goles;
      return b.goles_favor - a.goles_favor;
    });

    // Añadir posición
    // Añadir posición y información adicional
    const standingsWithLogos = await Promise.all(
      standingsArray.map(async (team, index) => {
        team.posicion = index + 1;
        
        // Obtener logo automáticamente
        try {
          team.escudo = await imageSearchService.getTeamLogo(team.equipo, 'laliga');
        } catch (error) {
          team.escudo = imageSearchService.getDefaultTeamLogo(team.equipo);
        }
        
        return team;
      })
    );

    this.cache.standings = standingsWithLogos;
    return standingsWithLogos;
  }

  // Obtener todos los equipos únicos de los partidos
  getAllTeams(matches) {
    const teams = new Set();
    matches.forEach(match => {
      teams.add(match.team1);
      teams.add(match.team2);
    });
    return Array.from(teams);
  }

  // Generar estadísticas de goleadores
  async generateGoalScorers() {
    const matches = await this.fetchMatches();
    const goalScorers = [];

    // Procesar partidos jugados para extraer goleadores
    matches.filter(match => match.score && match.score.ft).forEach(match => {
      if (match.goals) {
        match.goals.forEach(goal => {
          const existingScorer = goalScorers.find(scorer => 
            scorer.jugador === goal.player && scorer.equipo === goal.team
          );

          if (existingScorer) {
            existingScorer.goles++;
          } else {
            goalScorers.push({
              jugador: goal.player,
              equipo: goal.team,
              goles: 1,
              partidos: 1,
              minutos: 90, // Estimado
              goles_por_partido: 1
            });
          }
        });
      }
    });

    // Ordenar por goles descendente
    goalScorers.sort((a, b) => b.goles - a.goles);
    
    // Actualizar goles por partido y añadir fotos
    const goalScorersWithPhotos = await Promise.all(
      goalScorers.map(async (scorer) => {
        scorer.goles_por_partido = parseFloat((scorer.goles / scorer.partidos).toFixed(2));
        
        // Obtener foto del jugador
        try {
          scorer.foto = await playersService.getPlayerPhoto(scorer.jugador, scorer.equipo);
        } catch (error) {
          scorer.foto = imageSearchService.getDefaultPlayerPhoto();
        }
        
        return scorer;
      })
    );

    return goalScorersWithPhotos;
  }

  // Generar estadísticas de asistencias
  async generateAssists() {
    const matches = await this.fetchMatches();
    const assisters = [];

    // Procesar partidos jugados para extraer asistencias
    matches.filter(match => match.score && match.score.ft).forEach(match => {
      if (match.goals) {
        match.goals.forEach(goal => {
          if (goal.assist) {
            const existingAssister = assisters.find(assister => 
              assister.jugador === goal.assist && assister.equipo === goal.team
            );

            if (existingAssister) {
              existingAssister.asistencias++;
            } else {
              assisters.push({
                jugador: goal.assist,
                equipo: goal.team,
                asistencias: 1,
                partidos: 1,
                minutos: 90, // Estimado
                asistencias_por_partido: 1
              });
            }
          }
        });
      }
    });

    // Ordenar por asistencias descendente
    assisters.sort((a, b) => b.asistencias - a.asistencias);
    
    // Actualizar asistencias por partido y añadir fotos
    const assistersWithPhotos = await Promise.all(
      assisters.map(async (assister) => {
        assister.asistencias_por_partido = parseFloat((assister.asistencias / assister.partidos).toFixed(2));
        
        // Obtener foto del jugador
        try {
          assister.foto = await playersService.getPlayerPhoto(assister.jugador, assister.equipo);
        } catch (error) {
          assister.foto = imageSearchService.getDefaultPlayerPhoto();
        }
        
        return assister;
      })
    );

    return assistersWithPhotos;
  }

  // Obtener próximos partidos
  async getUpcomingMatches(limit = 10) {
    const matches = await this.fetchMatches();
    const today = new Date();
    
    return matches
      .filter(match => new Date(match.date) >= today)
      .slice(0, limit);
  }

  // Obtener partidos de una jornada específica
  async getMatchday(matchday) {
    const matches = await this.fetchMatches();
    return matches.filter(match => match.round === `Matchday ${matchday}`);
  }

  // Combinar datos reales con equipos personalizados
  async getCombinedStandings(customTeams = []) {
    const realStandings = await this.generateStandings();
    
    // Añadir equipos personalizados al final con estadísticas en 0
    const customStandingsData = customTeams.map((team, index) => ({
      posicion: realStandings.length + index + 1,
      equipo: team.nombre,
      partidos_jugados: 0,
      ganados: 0,
      empatados: 0,
      perdidos: 0,
      goles_favor: 0,
      goles_contra: 0,
      diferencia_goles: 0,
      puntos: 0,
      ultimos_5: [],
      racha_actual: '',
      forma: 'neutral',
      custom: true,
      escudo: team.escudo || null
    }));

    return [...realStandings.map(team => ({...team, custom: false})), ...customStandingsData];
  }
}

export default new LaLigaService();
