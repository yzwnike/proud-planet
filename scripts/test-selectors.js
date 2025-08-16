import puppeteer from 'puppeteer';

async function testSelectors() {
  console.log('🔍 Inspeccionando la estructura de /players...');
  
  const browser = await puppeteer.launch({
    headless: false, // Mostrar navegador para inspección
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📝 Navegando a la página de players...');
    await page.goto('https://biwenger.as.com/players', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('⏳ Esperando 5 segundos para que cargue completamente...');
    await page.waitForTimeout(5000);
    
    // Intentar encontrar diferentes selectores posibles
    const selectors = [
      '.player',
      '.player-item', 
      '.player-row',
      '.player-card',
      '[class*="player"]',
      '.list-item',
      '.table-row',
      'tr',
      '[data-player]'
    ];
    
    console.log('🔎 Buscando selectores de jugadores...');
    for (const selector of selectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`✅ Encontrado ${elements.length} elementos con selector: ${selector}`);
      }
    }
    
    // Extraer información de la página
    const pageInfo = await page.evaluate(() => {
      const body = document.body.innerHTML;
      return {
        title: document.title,
        hasPlayerElements: body.includes('player'),
        hasTableElements: body.includes('table'),
        hasListElements: body.includes('list'),
        bodyLength: body.length,
        scripts: Array.from(document.scripts).map(s => s.src).filter(s => s)
      };
    });
    
    console.log('📄 Información de la página:');
    console.log(pageInfo);
    
    console.log('⏸️  Pausa para inspección manual. Presiona Enter para continuar...');
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testSelectors();
