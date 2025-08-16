import fs from 'fs';

/**
 * Servicio para gestionar los resultados de los 4 equipos personalizados
 * Los resultados se almacenan localmente y actualizan la clasificación
 */
class CustomResultsService {
  constructor() {
    this.resultsFile = 'src/data/custom-results.json';
    this.standingsFile = 'src/data/custom-standings.json';
    this.loadData();

    // Los 4 equipos personalizados
    this.teams = ['Nike FC', 'Adidas FC', 'Puma FC', 'Kappa FC'];
    
    // Inicializar standings si no existen
    this.initializeStandingsIfNeeded();
  }

  /**
   * Cargar datos desde archivos
   */
  loadData() {
    // Cargar resultados
    try {
      if (fs.existsSync(this.resultsFile)) {
        this.results = JSON.parse(fs.readFileSync(this.resultsFile, 'utf8'));
      } else {
        this.results = [];
      }
    } catch (error) {
      this.results = [];
    }

    // Cargar standings
    try {
      if (fs.existsSync(this.standingsFile)) {
        this.standings = JSON.parse(fs.readFileSync(this.standingsFile, 'utf8'));
      } else {
        this.standings = {};
      }
    } catch (error) {
      this.standings = {};
    }
  }

  /**
   * Inicializar standings si no existen
   */
  initializeStandingsIfNeeded() {
    let shouldSave = false;
    
    this.teams.forEach(team => {
      if (!this.standings[team]) {
        this.standings[team] = {
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
          forma: 'neutral',
          custom: true
        };
        shouldSave = true;
      }
    });

    if (shouldSave) {
      this.saveStandings();
    }
  }

  /**
   * Guardar resultados
   */
  saveResults() {
    try {
      fs.writeFileSync(this.resultsFile, JSON.stringify(this.results, null, 2));
    } catch (error) {
      console.error('Error guardando resultados:', error);
    }
  }

  /**
   * Guardar standings
   */
  saveStandings() {
    try {
      fs.writeFileSync(this.standingsFile, JSON.stringify(this.standings, null, 2));
    } catch (error) {
      console.error('Error guardando standings:', error);
    }
  }

  /**
   * Agregar resultado de un partido
   */
  addMatchResult(homeTeam, awayTeam, homeGoals, awayGoals, jornada) {
    // Validar que los equipos existen
    if (!this.teams.includes(homeTeam) || !this.teams.includes(awayTeam)) {
      throw new Error('Uno o ambos equipos no son válidos');
    }

    if (homeTeam === awayTeam) {
      throw new Error('Un equipo no puede jugar contra sí mismo');
    }

    // Verificar si ya existe este partido en esta jornada
    const existingMatch = this.results.find(match => 
      match.jornada === jornada &&
      ((match.equipo_local === homeTeam && match.equipo_visitante === awayTeam) ||
       (match.equipo_local === awayTeam && match.equipo_visitante === homeTeam))
    );

    if (existingMatch) {
      throw new Error(`Ya existe un resultado para ${homeTeam} vs ${awayTeam} en la jornada ${jornada}`);
    }

    const matchResult = {
      id: Date.now().toString(),
      jornada: jornada,
      equipo_local: homeTeam,
      equipo_visitante: awayTeam,
      goles_local: parseInt(homeGoals),
      goles_visitante: parseInt(awayGoals),
      fecha: new Date().toISOString(),
      procesado: false
    };

    this.results.push(matchResult);
    this.saveResults();

    // Actualizar standings
    this.updateStandings(matchResult);

    return matchResult;
  }

  /**
   * Actualizar standings basado en un resultado
   */
  updateStandings(matchResult) {
    const homeTeam = matchResult.equipo_local;
    const awayTeam = matchResult.equipo_visitante;
    const homeGoals = matchResult.goles_local;
    const awayGoals = matchResult.goles_visitante;

    // Actualizar estadísticas del equipo local
    this.standings[homeTeam].partidos_jugados++;
    this.standings[homeTeam].goles_favor += homeGoals;
    this.standings[homeTeam].goles_contra += awayGoals;
    this.standings[homeTeam].diferencia_goles = this.standings[homeTeam].goles_favor - this.standings[homeTeam].goles_contra;

    // Actualizar estadísticas del equipo visitante
    this.standings[awayTeam].partidos_jugados++;
    this.standings[awayTeam].goles_favor += awayGoals;
    this.standings[awayTeam].goles_contra += homeGoals;
    this.standings[awayTeam].diferencia_goles = this.standings[awayTeam].goles_favor - this.standings[awayTeam].goles_contra;

    // Determinar resultado y actualizar puntos
    if (homeGoals > awayGoals) {
      // Victoria local
      this.standings[homeTeam].ganados++;
      this.standings[homeTeam].puntos += 3;
      this.standings[homeTeam].ultimos_5.push('V');
      this.standings[homeTeam].racha_actual = 'V';

      this.standings[awayTeam].perdidos++;
      this.standings[awayTeam].ultimos_5.push('D');
      this.standings[awayTeam].racha_actual = 'D';
    } else if (homeGoals < awayGoals) {
      // Victoria visitante
      this.standings[awayTeam].ganados++;
      this.standings[awayTeam].puntos += 3;
      this.standings[awayTeam].ultimos_5.push('V');
      this.standings[awayTeam].racha_actual = 'V';

      this.standings[homeTeam].perdidos++;
      this.standings[homeTeam].ultimos_5.push('D');
      this.standings[homeTeam].racha_actual = 'D';
    } else {
      // Empate
      this.standings[homeTeam].empatados++;
      this.standings[homeTeam].puntos++;
      this.standings[homeTeam].ultimos_5.push('E');
      this.standings[homeTeam].racha_actual = 'E';

      this.standings[awayTeam].empatados++;
      this.standings[awayTeam].puntos++;
      this.standings[awayTeam].ultimos_5.push('E');
      this.standings[awayTeam].racha_actual = 'E';
    }

    // Mantener solo los últimos 5 resultados
    this.standings[homeTeam].ultimos_5 = this.standings[homeTeam].ultimos_5.slice(-5);
    this.standings[awayTeam].ultimos_5 = this.standings[awayTeam].ultimos_5.slice(-5);

    // Marcar resultado como procesado
    matchResult.procesado = true;

    this.saveStandings();
    this.saveResults();
  }

  /**
   * Obtener standings actuales ordenados
   */
  getCurrentStandings() {
    const standingsArray = Object.values(this.standings);
    
    // Ordenar por puntos, diferencia de goles, goles a favor
    standingsArray.sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      if (b.diferencia_goles !== a.diferencia_goles) return b.diferencia_goles - a.diferencia_goles;
      return b.goles_favor - a.goles_favor;
    });

    // Asignar posiciones
    standingsArray.forEach((team, index) => {
      team.posicion = index + 1;
    });

    return standingsArray;
  }

  /**
   * Obtener todos los resultados
   */
  getAllResults() {
    return this.results.sort((a, b) => b.jornada - a.jornada || new Date(b.fecha) - new Date(a.fecha));
  }

  /**
   * Obtener resultados por jornada
   */
  getResultsByJornada(jornada) {
    return this.results.filter(result => result.jornada === jornada);
  }

  /**
   * Obtener próxima jornada disponible
   */
  getNextJornada() {
    if (this.results.length === 0) return 1;
    
    const maxJornada = Math.max(...this.results.map(r => r.jornada));
    
    // Contar cuántos partidos hay en la jornada actual
    const currentJornadaMatches = this.results.filter(r => r.jornada === maxJornada).length;
    
    // Si la jornada actual tiene menos de 2 partidos (máximo posible con 4 equipos), devolver la misma jornada
    if (currentJornadaMatches < 2) {
      return maxJornada;
    }
    
    return maxJornada + 1;
  }

  /**
   * Obtener estadísticas generales
   */
  getStats() {
    return {
      total_partidos: this.results.length,
      jornadas_jugadas: this.results.length > 0 ? Math.max(...this.results.map(r => r.jornada)) : 0,
      proxima_jornada: this.getNextJornada(),
      total_goles: this.results.reduce((sum, match) => sum + match.goles_local + match.goles_visitante, 0),
      equipos: this.teams,
      standings: this.getCurrentStandings()
    };
  }

  /**
   * Añadir puntos directamente a un equipo (versión simplificada)
   */
  addPointsDirectly(team, points, homeGoals, awayGoals, jornada) {
    // Validar que el equipo existe
    if (!this.teams.includes(team)) {
      throw new Error('Equipo no válido');
    }

    // Validar puntos
    if (![0, 1, 3].includes(points)) {
      throw new Error('Los puntos deben ser 0, 1 o 3');
    }
    
    // Validar coherencia entre puntos y goles
    const validResult = 
      (points === 3 && homeGoals > awayGoals) || 
      (points === 1 && homeGoals === awayGoals) || 
      (points === 0 && homeGoals < awayGoals);
      
    if (!validResult) {
      throw new Error('Los puntos no coinciden con el resultado');
    }

    // Crear entrada en el historial
    const pointEntry = {
      id: Date.now().toString(),
      jornada: jornada,
      equipo: team,
      puntos_obtenidos: points,
      goles_favor: homeGoals,
      goles_contra: awayGoals,
      tipo: points === 3 ? 'victoria' : points === 1 ? 'empate' : 'derrota',
      fecha: new Date().toISOString(),
      procesado: false
    };

    this.results.push(pointEntry);
    this.saveResults();

    // Actualizar standings
    this.updateStandingsDirectly(pointEntry);

    return pointEntry;
  }

  /**
   * Actualizar standings basado en puntos directos
   */
  updateStandingsDirectly(pointEntry) {
    const team = pointEntry.equipo;
    const points = pointEntry.puntos_obtenidos;
    const homeGoals = pointEntry.goles_favor || 0;
    const awayGoals = pointEntry.goles_contra || 0;

    // Actualizar estadísticas básicas
    this.standings[team].partidos_jugados++;
    this.standings[team].puntos += points;

    // Actualizar estadísticas según el tipo de resultado
    if (points === 3) {
      // Victoria
      this.standings[team].ganados++;
      this.standings[team].goles_favor += homeGoals;
      this.standings[team].goles_contra += awayGoals;
      this.standings[team].ultimos_5.push('V');
      this.standings[team].racha_actual = 'V';
    } else if (points === 1) {
      // Empate
      this.standings[team].empatados++;
      this.standings[team].goles_favor += homeGoals;
      this.standings[team].goles_contra += awayGoals;
      this.standings[team].ultimos_5.push('E');
      this.standings[team].racha_actual = 'E';
    } else {
      // Derrota
      this.standings[team].perdidos++;
      this.standings[team].goles_favor += homeGoals;
      this.standings[team].goles_contra += awayGoals;
      this.standings[team].ultimos_5.push('D');
      this.standings[team].racha_actual = 'D';
    }

    // Actualizar diferencia de goles
    this.standings[team].diferencia_goles = this.standings[team].goles_favor - this.standings[team].goles_contra;

    // Mantener solo los últimos 5 resultados
    this.standings[team].ultimos_5 = this.standings[team].ultimos_5.slice(-5);

    // Marcar como procesado
    pointEntry.procesado = true;

    this.saveStandings();
    this.saveResults();
  }

  /**
   * Reiniciar toda la temporada
   */
  resetSeason() {
    this.results = [];
    this.standings = {};
    
    try {
      if (fs.existsSync(this.resultsFile)) {
        fs.unlinkSync(this.resultsFile);
      }
      if (fs.existsSync(this.standingsFile)) {
        fs.unlinkSync(this.standingsFile);
      }
    } catch (error) {
      console.error('Error eliminando archivos:', error);
    }

    this.initializeStandingsIfNeeded();
    
    return { success: true, message: 'Temporada reiniciada correctamente' };
  }
}

export default new CustomResultsService();
