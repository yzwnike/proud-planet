import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * Servicio para búsqueda automática de imágenes de equipos y jugadores
 * Utiliza múltiples fuentes y APIs para encontrar imágenes PNG
 */
class ImageSearchService {
  constructor() {
    this.cache = new Map();
    this.cacheFile = 'src/data/image-cache.json';
    this.loadCache();
    
    // URLs base para diferentes fuentes de imágenes
    this.imageSources = {
      // API de Wikipedia (gratuita y confiable para logos de equipos)
      wikipedia: 'https://en.wikipedia.org/api/rest_v1/page/summary/',
      // Unsplash para imágenes de calidad (requiere API key)
      unsplash: 'https://api.unsplash.com/search/photos',
      // Logo.dev para logos de marcas y equipos
      logodev: 'https://img.logo.dev/',
      // ESPN para logos de equipos deportivos
      espn: 'https://a.espncdn.com/i/teamlogos/soccer/500/',
    };

    // Patrones de búsqueda para diferentes tipos de imágenes
    this.searchPatterns = {
      teamLogo: [
        '{team} logo png',
        '{team} escudo png',
        '{team} football club logo',
        '{team} fc logo'
      ],
      playerPhoto: [
        '{player} {team} png',
        '{player} football player png',
        '{player} soccer player',
        '{player} {team} portrait'
      ]
    };
  }

  /**
   * Cargar cache desde archivo
   */
  loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const cacheData = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
        this.cache = new Map(Object.entries(cacheData));
      }
    } catch (error) {
      console.warn('No se pudo cargar el cache de imágenes:', error.message);
    }
  }

  /**
   * Guardar cache en archivo
   */
  saveCache() {
    try {
      const cacheData = Object.fromEntries(this.cache);
      fs.writeFileSync(this.cacheFile, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      console.error('Error al guardar cache de imágenes:', error.message);
    }
  }

  /**
   * Buscar imagen de equipo automáticamente
   * @param {string} teamName - Nombre del equipo
   * @param {string} league - Liga del equipo (opcional)
   * @returns {Promise<string>} URL de la imagen PNG
   */
  async getTeamLogo(teamName, league = 'laliga') {
    const cacheKey = `team_${teamName.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Verificar cache primero
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let imageUrl = null;

      // 1. Intentar con ESPN (más rápido para equipos conocidos)
      imageUrl = await this.tryESPNLogo(teamName);
      if (imageUrl) {
        this.cache.set(cacheKey, imageUrl);
        this.saveCache();
        return imageUrl;
      }

      // 2. Intentar con Wikipedia
      imageUrl = await this.tryWikipediaImage(teamName, 'team');
      if (imageUrl) {
        this.cache.set(cacheKey, imageUrl);
        this.saveCache();
        return imageUrl;
      }

      // 3. Buscar en fuentes alternativas
      imageUrl = await this.searchGenericImage(teamName, 'teamLogo');
      if (imageUrl) {
        this.cache.set(cacheKey, imageUrl);
        this.saveCache();
        return imageUrl;
      }

      // 4. Si no encuentra nada, usar imagen por defecto
      const defaultUrl = this.getDefaultTeamLogo(teamName);
      this.cache.set(cacheKey, defaultUrl);
      this.saveCache();
      return defaultUrl;

    } catch (error) {
      console.error(`Error buscando logo de ${teamName}:`, error.message);
      const defaultUrl = this.getDefaultTeamLogo(teamName);
      this.cache.set(cacheKey, defaultUrl);
      this.saveCache();
      return defaultUrl;
    }
  }

  /**
   * Buscar imagen de jugador automáticamente
   * @param {string} playerName - Nombre del jugador
   * @param {string} teamName - Nombre del equipo (opcional)
   * @returns {Promise<string>} URL de la imagen PNG
   */
  async getPlayerPhoto(playerName, teamName = '') {
    const cacheKey = `player_${playerName.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Verificar cache primero
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let imageUrl = null;

      // 1. Intentar con Wikipedia
      imageUrl = await this.tryWikipediaImage(playerName, 'player');
      if (imageUrl) {
        this.cache.set(cacheKey, imageUrl);
        this.saveCache();
        return imageUrl;
      }

      // 2. Buscar en fuentes alternativas
      imageUrl = await this.searchGenericImage(`${playerName} ${teamName}`.trim(), 'playerPhoto');
      if (imageUrl) {
        this.cache.set(cacheKey, imageUrl);
        this.saveCache();
        return imageUrl;
      }

      // 3. Si no encuentra nada, usar imagen por defecto
      const defaultUrl = this.getDefaultPlayerPhoto();
      this.cache.set(cacheKey, defaultUrl);
      this.saveCache();
      return defaultUrl;

    } catch (error) {
      console.error(`Error buscando foto de ${playerName}:`, error.message);
      const defaultUrl = this.getDefaultPlayerPhoto();
      this.cache.set(cacheKey, defaultUrl);
      this.saveCache();
      return defaultUrl;
    }
  }

  /**
   * Intentar obtener logo desde ESPN
   */
  async tryESPNLogo(teamName) {
    const teamMappings = {
      'Real Madrid': 'realmadrid',
      'FC Barcelona': 'barcelona', 
      'Barcelona': 'barcelona',
      'Atlético Madrid': 'atleticomadrid',
      'Athletic Club': 'athletic',
      'Real Sociedad': 'realsociedad',
      'Villarreal': 'villarreal',
      'Real Betis': 'realbetis',
      'Sevilla': 'sevilla',
      'Valencia': 'valencia',
      'Espanyol': 'espanyol',
      'Osasuna': 'osasuna',
      'Celta de Vigo': 'celta',
      'Rayo Vallecano': 'rayo',
      'Mallorca': 'mallorca',
      'Levante': 'levante',
      'Alavés': 'alaves',
      'Getafe': 'getafe',
      'Girona': 'girona',
      'Elche': 'elche'
    };

    const mappedName = teamMappings[teamName];
    if (!mappedName) return null;

    try {
      const url = `${this.imageSources.espn}${mappedName}.png`;
      const response = await axios.head(url, { timeout: 5000 });
      if (response.status === 200) {
        return url;
      }
    } catch (error) {
      // Si no existe en ESPN, continuar con otros métodos
    }
    
    return null;
  }

  /**
   * Intentar obtener imagen desde Wikipedia
   */
  async tryWikipediaImage(searchTerm, type) {
    try {
      const searchQueries = type === 'team' 
        ? [`${searchTerm} football club`, `${searchTerm} FC`, searchTerm]
        : [`${searchTerm} footballer`, searchTerm];

      for (const query of searchQueries) {
        try {
          const url = `${this.imageSources.wikipedia}${encodeURIComponent(query)}`;
          const response = await axios.get(url, { timeout: 5000 });
          
          if (response.data && response.data.thumbnail && response.data.thumbnail.source) {
            let imageUrl = response.data.thumbnail.source;
            
            // Intentar obtener versión PNG de mayor resolución
            if (imageUrl.includes('wikipedia')) {
              // Modificar URL para obtener PNG de mayor resolución
              imageUrl = imageUrl.replace(/\/\d+px-/, '/500px-');
              if (!imageUrl.includes('.png')) {
                imageUrl = imageUrl.replace(/\.(jpg|jpeg|webp)/, '.png');
              }
            }
            
            // Verificar que la imagen existe
            const imageCheck = await axios.head(imageUrl, { timeout: 3000 });
            if (imageCheck.status === 200) {
              return imageUrl;
            }
          }
        } catch (error) {
          // Continuar con el siguiente query
          continue;
        }
      }
    } catch (error) {
      console.warn(`Error buscando en Wikipedia: ${error.message}`);
    }
    
    return null;
  }

  /**
   * Búsqueda genérica de imágenes usando múltiples fuentes
   */
  async searchGenericImage(searchTerm, type) {
    const patterns = this.searchPatterns[type] || ['{term}'];
    
    for (const pattern of patterns) {
      const query = pattern.replace(/{(\w+)}/g, (match, key) => {
        if (key === 'term') return searchTerm;
        if (key === 'team' || key === 'player') return searchTerm.split(' ')[0];
        return searchTerm;
      });

      try {
        // Generar URLs potenciales basadas en patrones comunes
        const potentialUrls = this.generatePotentialUrls(searchTerm, type);
        
        for (const url of potentialUrls) {
          try {
            const response = await axios.head(url, { timeout: 3000 });
            if (response.status === 200 && response.headers['content-type']?.includes('image')) {
              return url;
            }
          } catch (error) {
            // Continuar con la siguiente URL
            continue;
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  /**
   * Generar URLs potenciales basadas en patrones comunes
   */
  generatePotentialUrls(searchTerm, type) {
    const cleanTerm = searchTerm.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const urls = [];
    
    if (type === 'teamLogo') {
      // URLs comunes para logos de equipos
      urls.push(
        `https://logos-world.net/wp-content/uploads/2020/06/${cleanTerm}-Logo.png`,
        `https://logoeps.com/wp-content/uploads/2013/03/vector-${cleanTerm}-logo.png`,
        `https://i.imgur.com/${this.generateImgurId(cleanTerm)}.png`,
        `https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/${cleanTerm}_logo.svg/500px-${cleanTerm}_logo.svg.png`,
        `https://cdn.worldvectorlogo.com/logos/${cleanTerm}.png`
      );
    } else if (type === 'playerPhoto') {
      // URLs comunes para fotos de jugadores
      urls.push(
        `https://i.imgur.com/${this.generateImgurId(cleanTerm)}.png`,
        `https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/${cleanTerm}.jpg/500px-${cleanTerm}.jpg`,
        `https://www.thefamouspeople.com/profiles/images/${cleanTerm}.jpg`
      );
    }
    
    return urls;
  }

  /**
   * Generar ID pseudo-aleatorio para Imgur basado en el término de búsqueda
   */
  generateImgurId(term) {
    // Generar un hash simple basado en el término
    let hash = 0;
    for (let i = 0; i < term.length; i++) {
      const char = term.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convertir a ID de Imgur (7 caracteres alfanuméricos)
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    let num = Math.abs(hash);
    
    for (let i = 0; i < 7; i++) {
      result += chars[num % chars.length];
      num = Math.floor(num / chars.length);
    }
    
    return result;
  }

  /**
   * Obtener imagen por defecto para equipos
   */
  getDefaultTeamLogo(teamName) {
    // Generar URL de imagen por defecto usando el nombre del equipo
    const colors = ['FF6B35', '4ECDC4', '45B7D1', 'F9CA24', 'F0932B', 'EB4D4B', '6C5CE7'];
    const hash = teamName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const color = colors[hash % colors.length];
    
    // Usar un servicio de generación de avatares/logos
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&size=512&background=${color}&color=fff&format=png&rounded=true&bold=true`;
  }

  /**
   * Obtener imagen por defecto para jugadores
   */
  getDefaultPlayerPhoto() {
    // Imagen por defecto genérica para jugadores
    return 'https://ui-avatars.com/api/?name=Player&size=512&background=2C3E50&color=fff&format=png';
  }

  /**
   * Limpiar cache (útil para desarrollo)
   */
  clearCache() {
    this.cache.clear();
    try {
      if (fs.existsSync(this.cacheFile)) {
        fs.unlinkSync(this.cacheFile);
      }
    } catch (error) {
      console.error('Error al limpiar cache:', error.message);
    }
  }

  /**
   * Obtener estadísticas del cache
   */
  getCacheStats() {
    return {
      totalEntries: this.cache.size,
      cacheFile: this.cacheFile,
      entries: Array.from(this.cache.entries())
    };
  }

  /**
   * Precargar imágenes para una lista de equipos
   */
  async preloadTeamLogos(teamNames) {
    console.log(`Precargando logos para ${teamNames.length} equipos...`);
    const results = [];
    
    for (const teamName of teamNames) {
      try {
        const logoUrl = await this.getTeamLogo(teamName);
        results.push({ team: teamName, logo: logoUrl, success: true });
        console.log(`✓ ${teamName}: ${logoUrl}`);
      } catch (error) {
        results.push({ team: teamName, error: error.message, success: false });
        console.error(`✗ ${teamName}: ${error.message}`);
      }
      
      // Pequeña pausa para no saturar las APIs
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  /**
   * Precargar imágenes para una lista de jugadores
   */
  async preloadPlayerPhotos(players) {
    console.log(`Precargando fotos para ${players.length} jugadores...`);
    const results = [];
    
    for (const player of players) {
      try {
        const photoUrl = await this.getPlayerPhoto(player.name, player.team);
        results.push({ player: player.name, team: player.team, photo: photoUrl, success: true });
        console.log(`✓ ${player.name} (${player.team}): ${photoUrl}`);
      } catch (error) {
        results.push({ player: player.name, team: player.team, error: error.message, success: false });
        console.error(`✗ ${player.name}: ${error.message}`);
      }
      
      // Pequeña pausa para no saturar las APIs
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    return results;
  }
}

export default new ImageSearchService();
