const ecuador = require('../functions/ecuador')

exports.ecu = async (req, res) => {
  try {
    const ecu = await ecuador.ecuador(req)
    res.json(ecu); 
  } catch (error) {
    console.error('Error al obtener el costo de Ecuador (controller):', error);
    res.status(500).json({ error: 'Error al obtener el costo de Ecuador (controller):' });
  }
}
