import BiWengerScraper from './biwenger-scraper.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pregunta(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🚀 BiWenger Scraper v1.0');
  console.log('============================\n');
  
  const scraper = new BiWengerScraper();
  const args = process.argv.slice(2);
  
  try {
    // Si se especifica 'demo' como argumento, usar modo demo directamente
    if (args.includes('demo')) {
      console.log('🎮 Modo Demo - Generando datos de ejemplo...\n');
      await scraper.ejecutar(true);
      rl.close();
      return;
    }
    
    // Si se especifica 'test' como argumento, modo test con navegador visible
    if (args.includes('test')) {
      console.log('🧪 Modo Test - Navegador visible para debugging...\n');
      // Cambiar temporalmente a headless false
      scraper.browser = null;
      await scraper.init(false); // headless false para testing
      
      const email = await pregunta('Email de Biwenger (para testing): ');
      const password = await pregunta('Contraseña: ');
      
      console.log('\n🚀 Iniciando test real con navegador visible...\n');
      await scraper.ejecutar(false, email, password);
      rl.close();
      return;
    }
    
    const opcion = await pregunta('¿Qué modo quieres usar?\n1. Demo (datos de ejemplo)\n2. Real (scraping de Biwenger)\n\nOpción (1-2): ');
    
    if (opcion === '2') {
      console.log('\n🔐 Modo Real - Necesitas credenciales de Biwenger');
      console.log('⚠️  IMPORTANTE: Solo usa TUS propias credenciales. Respetamos términos de uso.\n');
      
      const email = await pregunta('Email: ');
      const password = await pregunta('Contraseña: ');
      
      console.log('\n🚀 Iniciando scraper real...\n');
      await scraper.ejecutar(false, email, password);
      
    } else {
      console.log('\n🎮 Modo Demo - Generando datos de ejemplo...\n');
      await scraper.ejecutar(true);
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    rl.close();
    console.log('\n✨ ¡Proceso completado!');
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
