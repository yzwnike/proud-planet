import axios from 'axios';

/**
 * Script para verificar que las APIs de tu servidor de desarrollo 
 * estén devolviendo las imágenes automáticas correctamente
 */

const DEV_SERVER_URL = 'http://localhost:4321';

async function testClassificationAPI() {
  console.log('\n📊 === PROBANDO API DE CLASIFICACIÓN ===\n');
  
  try {
    const response = await axios.get(`${DEV_SERVER_URL}/api/laliga/clasificacion?includeCustom=true`);
    
    if (response.data.success) {
      console.log('✅ API de clasificación funciona correctamente');
      
      const teams = response.data.data.clasificacion.slice(0, 5);
      console.log('\n🏆 Primeros 5 equipos con sus escudos:');
      
      teams.forEach((team, index) => {
        const hasLogo = team.escudo && !team.escudo.includes('/escudos/loading-');
        const logoType = team.escudo?.includes('ui-avatars.com') ? 'Generado' : 
                        team.escudo?.includes('wikipedia.org') ? 'Wikipedia' :
                        team.escudo?.includes('espncdn.com') ? 'ESPN' : 'Otro';
        
        console.log(`${index + 1}. ${team.equipo}`);
        console.log(`   🛡️ Logo: ${hasLogo ? '✅' : '❌'} (${logoType})`);
        console.log(`   🔗 URL: ${team.escudo}`);
        console.log(`   📊 Custom: ${team.custom ? 'Sí' : 'No'}\n`);
      });
      
      const teamsWithLogos = teams.filter(t => t.escudo && !t.escudo.includes('/escudos/loading-'));
      console.log(`📈 Equipos con logos automáticos: ${teamsWithLogos.length}/${teams.length}`);
      
    } else {
      console.log('❌ API de clasificación devolvió error:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Error al probar API de clasificación:', error.message);
  }
}

async function testPichichiAPI() {
  console.log('\n⚽ === PROBANDO API DE GOLEADORES ===\n');
  
  try {
    const response = await axios.get(`${DEV_SERVER_URL}/api/laliga/pichichi?limit=5`);
    
    if (response.data.success) {
      console.log('✅ API de goleadores funciona correctamente');
      
      const scorers = response.data.data.goleadores;
      console.log('\n⭐ Goleadores con sus fotos:');
      
      scorers.forEach((scorer, index) => {
        const hasPhoto = scorer.foto && scorer.foto.length > 0;
        const photoType = scorer.foto?.includes('ui-avatars.com') ? 'Generada' : 
                         scorer.foto?.includes('wikipedia.org') ? 'Wikipedia' :
                         scorer.foto?.includes('imgur.com') ? 'Imgur' : 'Otro';
        
        console.log(`${index + 1}. ${scorer.jugador} (${scorer.equipo})`);
        console.log(`   📸 Foto: ${hasPhoto ? '✅' : '❌'} (${photoType})`);
        console.log(`   🔗 URL: ${scorer.foto || 'N/A'}`);
        console.log(`   ⚽ Goles: ${scorer.goles}\n`);
      });
      
      const playersWithPhotos = scorers.filter(s => s.foto && s.foto.length > 0);
      console.log(`📈 Jugadores con fotos: ${playersWithPhotos.length}/${scorers.length}`);
      
    } else {
      console.log('❌ API de goleadores devolvió error:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Error al probar API de goleadores:', error.message);
  }
}

async function testImageUrls() {
  console.log('\n🔗 === VERIFICANDO URLs DE IMÁGENES ===\n');
  
  try {
    // Probar algunas URLs de imágenes directamente
    const testUrls = [
      'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/500px-Real_Madrid_CF.svg.png',
      'https://ui-avatars.com/api/?name=Test&size=512&background=FF6B35&color=fff&format=png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/I%C3%B1aki_Williams.png/500px-I%C3%B1aki_Williams.png'
    ];
    
    console.log('Probando accesibilidad de URLs de imágenes...\n');
    
    for (const url of testUrls) {
      try {
        const response = await axios.head(url, { timeout: 5000 });
        const urlType = url.includes('ui-avatars') ? 'Avatar generado' :
                       url.includes('wikipedia') ? 'Wikipedia' : 'Otro';
        
        console.log(`✅ ${urlType}`);
        console.log(`   🔗 ${url}`);
        console.log(`   📊 Status: ${response.status}\n`);
      } catch (error) {
        console.log(`❌ Error accediendo a imagen`);
        console.log(`   🔗 ${url}`);
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.error('❌ Error general al probar URLs:', error.message);
  }
}

async function runAllTests() {
  console.log('🧪 INICIANDO TESTS DE IMÁGENES EN FRONTEND');
  console.log('===========================================');
  console.log(`🌐 Servidor: ${DEV_SERVER_URL}`);
  
  await testClassificationAPI();
  await testPichichiAPI();
  await testImageUrls();
  
  console.log('\n🎉 === TESTS COMPLETADOS ===');
  console.log('\n💡 Si ves este mensaje y las APIs funcionan:');
  console.log('   ✅ El sistema de imágenes automáticas está funcionando');
  console.log('   🌐 Ve a http://localhost:4321/laliga/ para verlas en acción');
  console.log('   🔄 Las imágenes pueden tardar unos segundos en cargar la primera vez');
  console.log('   📊 Revisa la consola del navegador para logs adicionales');
}

// Ejecutar tests
runAllTests().catch(console.error);
