import fs from 'fs';
import path from 'path';

/**
 * Script para normalizar la estructura de jugadores
 * Convierte todas las variantes de estructura a un formato unificado
 */

function normalizePlayersData() {
  console.log('🔄 Iniciando normalización de jugadores...');
  
  const playersFile = './src/data/players.json';
  const backupFile = './src/data/players-backup.json';
  
  // Crear backup si no existe
  if (fs.existsSync(playersFile) && !fs.existsSync(backupFile)) {
    fs.copyFileSync(playersFile, backupFile);
    console.log('📁 Backup creado en players-backup.json');
  }
  
  // Leer datos actuales
  const rawData = JSON.parse(fs.readFileSync(playersFile, 'utf8'));
  console.log(`📊 Leyendo ${rawData.length} jugadores...`);
  
  // Función para mapear posiciones
  function normalizePosition(pos) {
    const positionMap = {
      'ATT': 'DC',
      'DEF': 'DFC', 
      'MID': 'MC',
      'Unknown': 'MC',
      '': 'MC'
    };
    return positionMap[pos] || pos || 'MC';
  }
  
  // Función para asignar equipos por defecto
  function normalizeTeam(team) {
    const teamMap = {
      'Real Madrid': 'Nike FC',
      'FC Barcelona': 'Adidas FC',
      'Atlético Madrid': 'Puma FC',
      'Athletic Club': 'Kappa FC',
      'Valencia': 'Nike FC',
      '': 'Nike FC'
    };
    return teamMap[team] || team || 'Nike FC';
  }
  
  // Función para calcular puntos basado en stats
  function calculatePoints(stats) {
    if (!stats || typeof stats !== 'object') return Math.floor(Math.random() * 50) + 20;
    
    const goals = stats.goals || stats.goles || 0;
    const assists = stats.assists || stats.asistencias || 0;
    const matches = stats.matches || stats.partidos_jugados || 0;
    
    // Fórmula simple: goles * 4 + asistencias * 2 + partidos
    return Math.max(0, goals * 4 + assists * 2 + matches);
  }
  
  // Función para calcular valor de mercado
  function calculateMarketValue(age, position, points) {
    const baseValue = points * 50000;
    const ageMultiplier = age ? Math.max(0.5, 2 - (age - 20) * 0.05) : 1;
    const positionMultiplier = {
      'DC': 1.2,
      'MC': 1.1,
      'DFC': 0.9,
      'POR': 0.8
    };
    
    return Math.floor(baseValue * ageMultiplier * (positionMultiplier[position] || 1));
  }
  
  // Normalizar cada jugador
  const normalizedPlayers = rawData
    .filter(player => {
      // Filtrar jugadores vacíos o inválidos
      const hasName = player.nombre || player.name;
      const hasTeam = player.equipo || player.team;
      return hasName && hasTeam;
    })
    .map((player, index) => {
      // Estructura unificada
      const nombre = player.nombre || player.name || `Jugador ${index + 1}`;
      const edad = player.edad || player.age || Math.floor(Math.random() * 15) + 18;
      const posicion = normalizePosition(player.posicion || player.position);
      const equipo = normalizeTeam(player.equipo || player.team);
      const stats = player.stats || {};
      const puntos = player.puntos !== undefined ? player.puntos : calculatePoints(stats);
      const valor_mercado = player.valor_mercado || calculateMarketValue(edad, posicion, puntos);
      const variacion = player.variacion || (Math.random() > 0.5 ? Math.floor(Math.random() * 200000) - 100000 : 0);
      const ovr = player.ovr || Math.floor(Math.random() * 25) + 65;
      
      // Foto: priorizar fotos locales
      let foto = player.foto || player.photo || '/jugadores/fan.svg';
      if (foto.startsWith('http') && !foto.includes('upload.wikimedia.org')) {
        // Usar foto por defecto para URLs genéricas
        foto = '/jugadores/fan.svg';
      }
      
      return {
        nombre,
        posicion,
        puntos,
        valor_mercado,
        variacion,
        edad,
        equipo,
        foto,
        ovr,
        goles: stats.goals || stats.goles || 0,
        asistencias: stats.assists || stats.asistencias || 0,
        tarjetas_amarillas: player.tarjetas_amarillas || 0,
        tarjetas_rojas: player.tarjetas_rojas || 0,
        partidos_jugados: stats.matches || stats.partidos_jugados || player.partidos_jugados || 0,
        ultima_actualizacion: new Date().toISOString()
      };
    });
  
  // Escribir datos normalizados
  fs.writeFileSync(playersFile, JSON.stringify(normalizedPlayers, null, 2));
  
  // Estadísticas de la normalización
  const equipos = [...new Set(normalizedPlayers.map(p => p.equipo))];
  const posiciones = [...new Set(normalizedPlayers.map(p => p.posicion))];
  
  console.log('✅ Normalización completada!');
  console.log(`📋 Total jugadores: ${normalizedPlayers.length}`);
  console.log(`🏢 Equipos: ${equipos.join(', ')}`);
  console.log(`⚽ Posiciones: ${posiciones.join(', ')}`);
  console.log(`💰 Valor total mercado: €${(normalizedPlayers.reduce((sum, p) => sum + p.valor_mercado, 0) / 1000000).toFixed(1)}M`);
  console.log(`⭐ Puntos promedio: ${(normalizedPlayers.reduce((sum, p) => sum + p.puntos, 0) / normalizedPlayers.length).toFixed(1)}`);
  
  return normalizedPlayers;
}

// Ejecutar normalización
try {
  const normalizedData = normalizePlayersData();
  console.log('\n🎉 ¡Normalización exitosa! Los jugadores ya tienen estructura consistente.');
  console.log('💡 Ahora puedes usar el sitio web sin errores de propiedades undefined.');
} catch (error) {
  console.error('❌ Error durante la normalización:', error);
  process.exit(1);
}
