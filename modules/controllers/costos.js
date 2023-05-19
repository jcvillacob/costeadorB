const costos = require('../functions/costos')

exports.costoss = async (req, res) => {
  try {
    const costoss = await costos.costos(req)
    res.json(costoss); 
  } catch (error) {
    console.error('Error al obtener los costos (Controller):', error);
    res.status(500).json({ error: 'Error al obtener los costos (Controller)' });
  }
}
