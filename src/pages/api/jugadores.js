import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Ruta al archivo de jugadores
    const filePath = path.join(process.cwd(), 'src', 'data', 'players.json');
    
    // Leer archivo actual de jugadores
    const jugadoresData = fs.readFileSync(filePath, 'utf8');
    const jugadores = JSON.parse(jugadoresData);
    
    console.log(`📊 Sirviendo datos de ${jugadores.length} jugadores`);
    
    return new Response(JSON.stringify(jugadores), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('❌ Error al leer archivo de jugadores:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Error al cargar datos de jugadores',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
