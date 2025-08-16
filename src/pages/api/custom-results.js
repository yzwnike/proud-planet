import customResultsService from '../../services/customResultsService.js';

export async function GET({ url }) {
  try {
    const action = url.searchParams.get('action');
    
    switch (action) {
      case 'standings':
        return new Response(JSON.stringify({
          success: true,
          data: customResultsService.getCurrentStandings()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'results':
        const jornada = url.searchParams.get('jornada');
        const results = jornada 
          ? customResultsService.getResultsByJornada(parseInt(jornada))
          : customResultsService.getAllResults();
          
        return new Response(JSON.stringify({
          success: true,
          data: results
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'stats':
        return new Response(JSON.stringify({
          success: true,
          data: customResultsService.getStats()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'next-jornada':
        return new Response(JSON.stringify({
          success: true,
          data: { proxima_jornada: customResultsService.getNextJornada() }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Acción no válida'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error en API custom-results:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'add-result':
        const { homeTeam, awayTeam, homeGoals, awayGoals, jornada } = body;
        
        if (!homeTeam || !awayTeam || homeGoals == null || awayGoals == null || !jornada) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Faltan datos requeridos'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const result = customResultsService.addMatchResult(
          homeTeam, 
          awayTeam, 
          homeGoals, 
          awayGoals, 
          parseInt(jornada)
        );
        
        return new Response(JSON.stringify({
          success: true,
          data: result,
          standings: customResultsService.getCurrentStandings()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'reset-season':
        const resetResult = customResultsService.resetSeason();
        
        return new Response(JSON.stringify({
          success: true,
          data: resetResult
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Acción no válida'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error en POST custom-results:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
