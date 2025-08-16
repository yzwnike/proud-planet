import customResultsService from '../../services/customResultsService.js';

export async function GET() {
  try {
    const standings = customResultsService.getCurrentStandings();
    
    return new Response(JSON.stringify({
      success: true,
      data: standings,
      lastUpdated: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300' // 5 minutos de cache
      }
    });
  } catch (error) {
    console.error('Error en API custom-standings:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error al obtener la clasificación',
      data: []
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
