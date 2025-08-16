import customResultsService from '../../services/customResultsService.js';

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'add-points':
        const { team, points, homeGoals, awayGoals, jornada } = body;
        
        if (!team || points == null || homeGoals == null || awayGoals == null || !jornada) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Faltan datos requeridos (team, points, homeGoals, awayGoals, jornada)'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Validar equipos válidos
        const validTeams = ['Nike FC', 'Adidas FC', 'Puma FC', 'Kappa FC'];
        if (!validTeams.includes(team)) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Equipo no válido'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Validar puntos (0, 1 o 3)
        const validPoints = [0, 1, 3];
        if (!validPoints.includes(parseInt(points))) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Los puntos deben ser 0 (derrota), 1 (empate) o 3 (victoria)'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Añadir puntos directamente al equipo
        const result = customResultsService.addPointsDirectly(team, parseInt(points), parseInt(homeGoals), parseInt(awayGoals), parseInt(jornada));
        
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
    console.error('Error en POST custom-points:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
