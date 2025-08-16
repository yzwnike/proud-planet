import imageSearchService from './imageSearchService.js';
import fs from 'fs';
import path from 'path';

/**
 * Servicio para gestión de jugadores con búsqueda automática de fotos
 */
class PlayersService {
  constructor() {
    this.playersData = new Map();
    this.playersDataFile = 'src/data/players.json';
    this.loadPlayersData();
    
    // Posiciones comunes en fútbol
    this.positions = {
      'GK': 'Portero',
      'DEF': 'Defensa', 
      'MID': 'Centrocampista',
      'ATT': 'Delantero',
      'RWB': 'Lateral Derecho',
      'LWB': 'Lateral Izquierdo',
      'CB': 'Defensa Central',
      'CDM': 'Mediocentro Defensivo',
      'CAM': 'Mediocentro Ofensivo',
      'RW': 'Extremo Derecho',
      'LW': 'Extremo Izquierdo',
      'ST': 'Delantero Centro'
    };
  }

  /**
   * Cargar datos de jugadores desde archivo
   */
  loadPlayersData() {
    try {
      if (fs.existsSync(this.playersDataFile)) {
        const playersData = JSON.parse(fs.readFileSync(this.playersDataFile, 'utf8'));
        // Convertir array a Map para mejor rendimiento en búsquedas
        if (Array.isArray(playersData)) {
          playersData.forEach(player => {
            const key = `${player.name}_${player.team}`.toLowerCase();
            this.playersData.set(key, player);
          });
        } else if (playersData && typeof playersData === 'object') {
          this.playersData = new Map(Object.entries(playersData));
        }
      }
    } catch (error) {
      console.warn('No se pudieron cargar los datos de jugadores:', error.message);
    }
  }

  /**
   * Guardar datos de jugadores en archivo
   */
  savePlayersData() {
    try {
      const playersArray = Array.from(this.playersData.values());
      fs.writeFileSync(this.playersDataFile, JSON.stringify(playersArray, null, 2));
    } catch (error) {
      console.error('Error al guardar datos de jugadores:', error.message);
    }
  }

  /**
   * Obtener foto de jugador automáticamente
   * @param {string} playerName - Nombre del jugador
   * @param {string} teamName - Nombre del equipo
   * @param {boolean} forceUpdate - Forzar actualización aunque ya exista en cache
   * @returns {Promise<string>} URL de la foto PNG
   */
  async getPlayerPhoto(playerName, teamName = '', forceUpdate = false) {
    const playerKey = `${playerName}_${teamName}`.toLowerCase();
    
    // Verificar si ya tenemos la foto en cache local
    if (!forceUpdate && this.playersData.has(playerKey)) {
      const playerData = this.playersData.get(playerKey);
      if (playerData.photo) {
        return playerData.photo;
      }
    }

    try {
      // Buscar foto automáticamente
      const photoUrl = await imageSearchService.getPlayerPhoto(playerName, teamName);
      
      // Actualizar o crear entrada del jugador
      const existingPlayer = this.playersData.get(playerKey) || {
        name: playerName,
        team: teamName,
        position: 'Unknown',
        age: null,
        nationality: null,
        stats: {}
      };

      existingPlayer.photo = photoUrl;
      existingPlayer.lastPhotoUpdate = new Date().toISOString();
      
      this.playersData.set(playerKey, existingPlayer);
      this.savePlayersData();
      
      return photoUrl;
    } catch (error) {
      console.error(`Error obteniendo foto de ${playerName}:`, error.message);
      const defaultPhoto = imageSearchService.getDefaultPlayerPhoto();
      
      // Guardar foto por defecto
      const existingPlayer = this.playersData.get(playerKey) || {
        name: playerName,
        team: teamName,
        position: 'Unknown'
      };
      
      existingPlayer.photo = defaultPhoto;
      this.playersData.set(playerKey, existingPlayer);
      this.savePlayersData();
      
      return defaultPhoto;
    }
  }

  /**
   * Agregar o actualizar información de un jugador
   */
  async addOrUpdatePlayer(playerData) {
    const { name, team, position, age, nationality, stats } = playerData;
    const playerKey = `${name}_${team}`.toLowerCase();
    
    const existingPlayer = this.playersData.get(playerKey) || {};
    
    const updatedPlayer = {
      ...existingPlayer,
      name: name,
      team: team,
      position: position || existingPlayer.position || 'Unknown',
      age: age || existingPlayer.age,
      nationality: nationality || existingPlayer.nationality,
      stats: { ...existingPlayer.stats, ...stats },
      lastUpdate: new Date().toISOString()
    };
    
    // Si no tiene foto, obtenerla automáticamente
    if (!updatedPlayer.photo) {
      try {
        updatedPlayer.photo = await this.getPlayerPhoto(name, team);
      } catch (error) {
        updatedPlayer.photo = imageSearchService.getDefaultPlayerPhoto();
      }
    }
    
    this.playersData.set(playerKey, updatedPlayer);
    this.savePlayersData();
    
    return updatedPlayer;
  }

  /**
   * Obtener información completa de un jugador
   */
  getPlayer(playerName, teamName = '') {
    const playerKey = `${playerName}_${teamName}`.toLowerCase();
    return this.playersData.get(playerKey) || null;
  }

  /**
   * Buscar jugadores por equipo
   */
  getPlayersByTeam(teamName) {
    const players = [];
    
    for (const [key, player] of this.playersData) {
      if (player.team.toLowerCase() === teamName.toLowerCase()) {
        players.push(player);
      }
    }
    
    return players.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Buscar jugadores por posición
   */
  getPlayersByPosition(position) {
    const players = [];
    
    for (const [key, player] of this.playersData) {
      if (player.position === position) {
        players.push(player);
      }
    }
    
    return players.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtener todos los jugadores
   */
  getAllPlayers() {
    return Array.from(this.playersData.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Generar jugadores ficticios para un equipo
   */
  async generatePlayersForTeam(teamName, count = 25) {
    console.log(`Generando ${count} jugadores para ${teamName}...`);
    
    const positions = ['GK', 'GK', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'MID', 'MID', 'ATT', 'ATT', 'ATT', 'ATT'];
    const firstNames = [
      'David', 'Carlos', 'Miguel', 'Antonio', 'José', 'Manuel', 'Francisco', 'Juan', 'Pedro', 'Diego',
      'Sergio', 'Pablo', 'Alejandro', 'Fernando', 'Ricardo', 'Alberto', 'Roberto', 'Eduardo', 'Rafael', 'Andrés',
      'Daniel', 'Gabriel', 'Javier', 'Adrián', 'Mario', 'Iván', 'Lucas', 'Hugo', 'Rubén', 'Álvaro'
    ];
    const lastNames = [
      'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
      'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez',
      'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Molina'
    ];

    const players = [];
    
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const playerName = `${firstName} ${lastName}`;
      const position = positions[Math.floor(Math.random() * positions.length)];
      const age = Math.floor(Math.random() * 15) + 18; // Entre 18 y 32 años
      
      const playerData = {
        name: playerName,
        team: teamName,
        position: position,
        age: age,
        nationality: 'España',
        stats: {
          goals: Math.floor(Math.random() * 20),
          assists: Math.floor(Math.random() * 15),
          matches: Math.floor(Math.random() * 30) + 5,
          minutes: Math.floor(Math.random() * 2500) + 500
        }
      };
      
      try {
        const player = await this.addOrUpdatePlayer(playerData);
        players.push(player);
        console.log(`✓ ${playerName} (${position}) - Foto: ${player.photo ? 'OK' : 'Default'}`);
      } catch (error) {
        console.error(`✗ Error creando jugador ${playerName}:`, error.message);
      }
      
      // Pequeña pausa para no saturar las APIs
      if (i % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return players;
  }

  /**
   * Precargar fotos para todos los jugadores sin foto
   */
  async preloadMissingPhotos() {
    console.log('Precargando fotos faltantes de jugadores...');
    
    const playersWithoutPhotos = [];
    for (const [key, player] of this.playersData) {
      if (!player.photo || player.photo.includes('ui-avatars.com')) {
        playersWithoutPhotos.push(player);
      }
    }
    
    console.log(`Encontrados ${playersWithoutPhotos.length} jugadores sin foto personalizada`);
    
    const results = [];
    for (const player of playersWithoutPhotos) {
      try {
        const photoUrl = await this.getPlayerPhoto(player.name, player.team, true);
        results.push({ 
          player: player.name, 
          team: player.team, 
          photo: photoUrl, 
          success: !photoUrl.includes('ui-avatars.com') 
        });
        console.log(`✓ ${player.name} (${player.team}): ${photoUrl.includes('ui-avatars.com') ? 'Default' : 'Encontrada'}`);
      } catch (error) {
        results.push({ 
          player: player.name, 
          team: player.team, 
          error: error.message, 
          success: false 
        });
        console.error(`✗ ${player.name}: ${error.message}`);
      }
      
      // Pausa para no saturar APIs
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`Fotos actualizadas: ${successful}/${results.length}`);
    
    return results;
  }

  /**
   * Obtener estadísticas de jugadores
   */
  getPlayersStats() {
    const totalPlayers = this.playersData.size;
    let playersWithPhotos = 0;
    let playersWithCustomPhotos = 0;
    const teamCount = new Set();
    const positionCount = {};

    for (const [key, player] of this.playersData) {
      if (player.photo) playersWithPhotos++;
      if (player.photo && !player.photo.includes('ui-avatars.com')) playersWithCustomPhotos++;
      teamCount.add(player.team);
      positionCount[player.position] = (positionCount[player.position] || 0) + 1;
    }

    return {
      totalPlayers,
      playersWithPhotos,
      playersWithCustomPhotos,
      uniqueTeams: teamCount.size,
      positionDistribution: positionCount,
      photoPercentage: totalPlayers > 0 ? (playersWithPhotos / totalPlayers * 100).toFixed(1) : 0,
      customPhotoPercentage: totalPlayers > 0 ? (playersWithCustomPhotos / totalPlayers * 100).toFixed(1) : 0
    };
  }

  /**
   * Limpiar datos de jugadores (útil para desarrollo)
   */
  clearPlayersData() {
    this.playersData.clear();
    try {
      if (fs.existsSync(this.playersDataFile)) {
        fs.unlinkSync(this.playersDataFile);
      }
    } catch (error) {
      console.error('Error al limpiar datos de jugadores:', error.message);
    }
  }
}

export default new PlayersService();
