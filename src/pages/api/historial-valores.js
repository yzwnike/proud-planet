import fs from 'fs';
import path from 'path';

const HISTORIAL_FILE = path.join(process.cwd(), 'src', 'data', 'historial-valores.json');

// Función helper para leer historial
function leerHistorial() {
  try {
    if (!fs.existsSync(HISTORIAL_FILE)) {
      fs.writeFileSync(HISTORIAL_FILE, '{}');
    }
    const data = fs.readFileSync(HISTORIAL_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo historial de valores:', error);
    return {};
  }
}

// Función helper para guardar historial
function guardarHistorial(historial) {
  try {
    fs.writeFileSync(HISTORIAL_FILE, JSON.stringify(historial, null, 2));
    return true;
  } catch (error) {
    console.error('Error guardando historial de valores:', error);
    return false;
  }
}

export async function GET() {
  try {
    const historial = leerHistorial();
    console.log(`📊 Sirviendo historial de valores para ${Object.keys(historial).length} jugadores`);
    
    return new Response(JSON.stringify(historial), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener historial de valores:', error);
    return new Response(JSON.stringify({ 
      error: 'Error al cargar historial de valores',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    const { nombre, valor } = await request.json();
    
    if (!nombre || valor === undefined) {
      return new Response(JSON.stringify({ 
        error: 'Faltan datos requeridos: nombre y valor' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const historial = leerHistorial();
    
    // Inicializar array para el jugador si no existe
    if (!historial[nombre]) {
      historial[nombre] = [];
    }
    
    // Agregar nuevo valor con timestamp
    historial[nombre].push({
      fecha: new Date().toISOString(),
      valor: valor
    });
    
    // Mantener solo los últimos 50 registros por jugador
    if (historial[nombre].length > 50) {
      historial[nombre] = historial[nombre].slice(-50);
    }
    
    // Guardar cambios
    const guardado = guardarHistorial(historial);
    
    if (guardado) {
      console.log(`✅ Valor agregado al historial de ${nombre}: €${valor.toLocaleString('es-ES')}`);
      
      return new Response(JSON.stringify({
        success: true,
        message: `Valor agregado al historial de ${nombre}`,
        total_registros: historial[nombre].length,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Error al guardar archivo');
    }
    
  } catch (error) {
    console.error('❌ Error al guardar historial de valores:', error);
    return new Response(JSON.stringify({ 
      error: 'Error al guardar historial de valores',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT({ request }) {
  try {
    const { historialCompleto } = await request.json();
    
    if (!historialCompleto || typeof historialCompleto !== 'object') {
      return new Response(JSON.stringify({ 
        error: 'Datos de historial inválidos' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const guardado = guardarHistorial(historialCompleto);
    
    if (guardado) {
      const totalJugadores = Object.keys(historialCompleto).length;
      console.log(`✅ Historial completo actualizado para ${totalJugadores} jugadores`);
      
      return new Response(JSON.stringify({
        success: true,
        message: `Historial actualizado para ${totalJugadores} jugadores`,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Error al guardar archivo');
    }
    
  } catch (error) {
    console.error('❌ Error al actualizar historial completo:', error);
    return new Response(JSON.stringify({ 
      error: 'Error al actualizar historial completo',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
