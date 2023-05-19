const costeo = require('../functions/costeo')

exports.costeos = async (req, res) => {
  try {
    const costeos = await costeo.costeo(req);
    res.json(costeos); 
  } catch (error) {
    console.error('Error al obtener el costeo (controller):', error);
    res.status(500).json({ error: 'Error al obtener el costeo (controller)' });
  }
}
