const comprobar = require('../functions/comprobar')

exports.comprobacion = async (req, res) => {
  try {
    const comprobacion = await comprobar.comprobar(req);
    res.json(comprobacion); 
  } catch (error) {
    console.error('Error al obtener la comprobacion (controller):', error);
    res.status(500).json({ error: 'Error al obtener la comprobacion (controller)' });
  }
}
