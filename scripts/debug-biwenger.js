import puppeteer from 'puppeteer';

async function debugBiwenger() {
  console.log('🔍 DEBUG BIWENGER SCRAPER');
  console.log('=========================');
  
  let browser = null;
  let page = null;
  
  try {
    const email = 'karutacard1@gmail.com';
    const password = 'Biwenger123';
    
    console.log('🌐 Iniciando navegador visible...');
    browser = await puppeteer.launch({
      headless: false, // Visible para debugging
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    console.log('🔐 Navegando a login...');
    await page.goto('https://biwenger.as.com/login', { waitUntil: 'domcontentloaded' });
    console.log('📍 URL:', page.url());
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mostrar contenido inicial
    const initialContent = await page.evaluate(() => document.body.textContent.substring(0, 500));
    console.log('📄 Contenido inicial:', initialContent);
    
    // Buscar botón "Ya tengo una cuenta"
    console.log('👆 Buscando botón "Ya tengo una cuenta"...');
    
    const buttonFound = await page.evaluate(() => {
      const allElements = document.querySelectorAll('button, a, div, span');
      for (const element of allElements) {
        const text = element.textContent?.toLowerCase() || '';
        if (text.includes('ya tengo') || text.includes('iniciar') || text.includes('acceder') || text.includes('entrar')) {
          console.log('Encontrado elemento con texto:', text);
          element.click();
          return text;
        }
      }
      return false;
    });
    
    if (buttonFound) {
      console.log('✅ Click realizado en:', buttonFound);
      await new Promise(resolve => setTimeout(resolve, 4000));
    } else {
      console.log('❌ Botón no encontrado');
    }
    
    // Verificar URL después del click
    console.log('📍 URL después del click:', page.url());
    
    // Mostrar contenido después del click
    const afterClickContent = await page.evaluate(() => document.body.textContent.substring(0, 500));
    console.log('📄 Contenido después del click:', afterClickContent);
    
    // Buscar inputs
    console.log('🔍 Buscando inputs...');
    const inputsFound = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      const inputInfo = [];
      inputs.forEach((input, i) => {
        inputInfo.push({
          index: i,
          type: input.type,
          name: input.name,
          id: input.id,
          placeholder: input.placeholder,
          className: input.className
        });
      });
      return inputInfo;
    });
    
    console.log('📋 Inputs encontrados:', inputsFound);
    
    // Intentar login si hay inputs
    if (inputsFound.length >= 2) {
      console.log('✅ Inputs encontrados, intentando login...');
      
      try {
        // Intentar con los primeros dos inputs
        await page.focus('input:nth-of-type(1)');
        await page.type('input:nth-of-type(1)', email);
        console.log('📧 Email introducido');
        
        await page.focus('input:nth-of-type(2)');
        await page.type('input:nth-of-type(2)', password);
        console.log('🔐 Password introducido');
        
        console.log('🚀 Enviando formulario...');
        await page.keyboard.press('Enter');
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const finalUrl = page.url();
        console.log('📍 URL final:', finalUrl);
        
        if (!finalUrl.includes('/login')) {
          console.log('✅ ¡LOGIN EXITOSO!');
          
          // Ir a players
          console.log('👥 Navegando a players...');
          await page.goto('https://biwenger.as.com/players', { waitUntil: 'domcontentloaded' });
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const playersContent = await page.evaluate(() => document.body.textContent.substring(0, 800));
          console.log('⚽ Contenido de players:', playersContent);
          
        } else {
          console.log('❌ Login falló - aún en página de login');
        }
        
      } catch (loginError) {
        console.error('❌ Error en login:', loginError.message);
      }
    }
    
    console.log('⏸️  Pausa de 15 segundos para inspección...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔚 Navegador cerrado');
    }
  }
}

debugBiwenger();
