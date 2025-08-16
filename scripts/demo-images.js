import imageSearchService from '../src/services/imageSearchService.js';
import customTeamsService from '../src/services/customTeamsService.js';
import playersService from '../src/services/playersService.js';
import laLigaService from '../src/services/laLigaService.js';

/**
 * Script de demostración para el sistema de imágenes automáticas
 * Muestra cómo obtener automáticamente imágenes PNG de equipos y jugadores desde internet
 */

async function demoTeamLogos() {
  console.log('\n🏆 === DEMO: LOGOS DE EQUIPOS AUTOMÁTICOS ===\n');
  
  const teams = ['Real Madrid', 'FC Barcelona', 'Atlético Madrid', 'Athletic Club', 'Valencia'];
  
  console.log('Buscando logos automáticamente...\n');
  
  for (const team of teams) {
    try {
      const logoUrl = await imageSearchService.getTeamLogo(team);
      console.log(`✅ ${team}:`);
      console.log(`   🔗 ${logoUrl}`);
      console.log(`   📊 Estado: ${logoUrl.includes('ui-avatars.com') ? 'Por defecto' : 'Encontrado automáticamente'}\n`);
    } catch (error) {
      console.log(`❌ ${team}: ${error.message}\n`);
    }
  }
}

async function demoPlayerPhotos() {
  console.log('\n👤 === DEMO: FOTOS DE JUGADORES AUTOMÁTICAS ===\n');
  
  const players = [
    { name: 'Karim Benzema', team: 'Real Madrid' },
    { name: 'Robert Lewandowski', team: 'FC Barcelona' },
    { name: 'Antoine Griezmann', team: 'Atlético Madrid' },
    { name: 'Iñaki Williams', team: 'Athletic Club' },
    { name: 'Carlos Soler', team: 'Valencia' }
  ];
  
  console.log('Buscando fotos de jugadores automáticamente...\n');
  
  for (const player of players) {
    try {
      const photoUrl = await playersService.getPlayerPhoto(player.name, player.team);
      console.log(`✅ ${player.name} (${player.team}):`);
      console.log(`   🔗 ${photoUrl}`);
      console.log(`   📊 Estado: ${photoUrl.includes('ui-avatars.com') ? 'Por defecto' : 'Encontrada automáticamente'}\n`);
    } catch (error) {
      console.log(`❌ ${player.name}: ${error.message}\n`);
    }
  }
}

async function demoGeneratePlayersForTeam() {
  console.log('\n⚽ === DEMO: GENERAR JUGADORES CON FOTOS PARA UN EQUIPO ===\n');
  
  const teamName = 'Real Madrid';
  console.log(`Generando 5 jugadores para ${teamName}...\n`);
  
  try {
    const players = await playersService.generatePlayersForTeam(teamName, 5);
    
    console.log(`\n✅ Jugadores generados para ${teamName}:\n`);
    players.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name}`);
      console.log(`   🏃 Posición: ${player.position}`);
      console.log(`   👥 Edad: ${player.age} años`);
      console.log(`   📸 Foto: ${player.photo ? 'Sí' : 'No'}`);
      console.log(`   🔗 ${player.photo || 'N/A'}\n`);
    });
  } catch (error) {
    console.error(`❌ Error generando jugadores: ${error.message}`);
  }
}

async function demoLaLigaWithLogos() {
  console.log('\n🏆 === DEMO: CLASIFICACIÓN DE LA LIGA CON LOGOS AUTOMÁTICOS ===\n');
  
  console.log('Obteniendo clasificación con logos automáticos...\n');
  
  try {
    const standings = await laLigaService.generateStandings();
    
    console.log('🥇 TOP 5 - Clasificación La Liga:\n');
    standings.slice(0, 5).forEach((team, index) => {
      console.log(`${index + 1}. ${team.equipo}`);
      console.log(`   📊 Puntos: ${team.puntos} | Partidos: ${team.partidos_jugados}`);
      console.log(`   🛡️ Escudo: ${team.escudo}`);
      console.log(`   📊 Logo: ${team.escudo.includes('ui-avatars.com') ? 'Generado' : 'Automático'}\n`);
    });
  } catch (error) {
    console.error(`❌ Error obteniendo clasificación: ${error.message}`);
  }
}

async function demoCacheStats() {
  console.log('\n📊 === DEMO: ESTADÍSTICAS DE CACHE ===\n');
  
  // Estadísticas del servicio de imágenes
  const imageStats = imageSearchService.getCacheStats();
  console.log('🖼️ Cache de imágenes:');
  console.log(`   📁 Total entradas: ${imageStats.totalEntries}`);
  console.log(`   💾 Archivo cache: ${imageStats.cacheFile}`);
  
  // Estadísticas del servicio de jugadores
  const playerStats = playersService.getPlayersStats();
  console.log('\n👤 Base de datos de jugadores:');
  console.log(`   👥 Total jugadores: ${playerStats.totalPlayers}`);
  console.log(`   📸 Con fotos: ${playerStats.playersWithPhotos} (${playerStats.photoPercentage}%)`);
  console.log(`   🎯 Fotos personalizadas: ${playerStats.playersWithCustomPhotos} (${playerStats.customPhotoPercentage}%)`);
  console.log(`   🏟️ Equipos únicos: ${playerStats.uniqueTeams}`);
  
  if (Object.keys(playerStats.positionDistribution).length > 0) {
    console.log('\n📍 Distribución por posiciones:');
    Object.entries(playerStats.positionDistribution).forEach(([pos, count]) => {
      console.log(`   ${pos}: ${count} jugadores`);
    });
  }
}

async function demoCustomTeamsLogos() {
  console.log('\n🎨 === DEMO: LOGOS DE EQUIPOS PERSONALIZADOS ===\n');
  
  console.log('Obteniendo logos de todos los equipos (reales + personalizados)...\n');
  
  try {
    const logos = await customTeamsService.getAllTeamLogosWithAuto();
    
    // Mostrar primeros 10
    const teamNames = Object.keys(logos).slice(0, 10);
    
    for (const teamName of teamNames) {
      const logoUrl = logos[teamName];
      const isCustom = customTeamsService.getCustomTeam(teamName) !== null;
      
      console.log(`${isCustom ? '🎨' : '⚽'} ${teamName}:`);
      console.log(`   🔗 ${logoUrl}`);
      console.log(`   📊 Tipo: ${isCustom ? 'Equipo personalizado' : 'Equipo real'}\n`);
    }
    
    console.log(`... y ${Object.keys(logos).length - 10} equipos más.`);
  } catch (error) {
    console.error(`❌ Error obteniendo logos: ${error.message}`);
  }
}

async function runAllDemos() {
  console.log('🚀 INICIANDO DEMOS DEL SISTEMA DE IMÁGENES AUTOMÁTICAS');
  console.log('==================================================');
  
  try {
    await demoTeamLogos();
    await demoPlayerPhotos();
    await demoGeneratePlayersForTeam();
    await demoLaLigaWithLogos();
    await demoCustomTeamsLogos();
    await demoCacheStats();
    
    console.log('\n🎉 === DEMOS COMPLETADOS ===');
    console.log('\n💡 Características implementadas:');
    console.log('   ✅ Búsqueda automática de logos de equipos en PNG');
    console.log('   ✅ Búsqueda automática de fotos de jugadores');
    console.log('   ✅ Sistema de cache para evitar búsquedas repetitivas');
    console.log('   ✅ Integración con servicios existentes');
    console.log('   ✅ Imágenes por defecto cuando no se encuentran');
    console.log('   ✅ Múltiples fuentes: ESPN, Wikipedia, generadores de avatares');
    console.log('   ✅ Priorización de formatos PNG');
    
    console.log('\n📝 Próximos pasos sugeridos:');
    console.log('   🔄 Ejecutar precarga masiva con: npm run demo:preload');
    console.log('   🎮 Integrar en componentes de frontend');
    console.log('   📊 Monitorear estadísticas de cache');
    
  } catch (error) {
    console.error('\n❌ Error en demo:', error);
  }
}

// Función para precargar imágenes masivamente
async function preloadAllImages() {
  console.log('\n🔄 === PRECARGA MASIVA DE IMÁGENES ===\n');
  
  // Precargar logos de equipos
  console.log('1️⃣ Precargando logos de equipos de La Liga...');
  await customTeamsService.preloadAllTeamLogos();
  
  // Precargar fotos de jugadores existentes
  console.log('\n2️⃣ Precargando fotos de jugadores...');
  await playersService.preloadMissingPhotos();
  
  console.log('\n✅ Precarga completada');
}

// Ejecutar demos según argumento
const command = process.argv[2];

switch (command) {
  case 'preload':
    await preloadAllImages();
    break;
  case 'teams':
    await demoTeamLogos();
    break;
  case 'players':
    await demoPlayerPhotos();
    break;
  case 'stats':
    await demoCacheStats();
    break;
  default:
    await runAllDemos();
}

process.exit(0);
