const comp = require('../functions/compensacion')

exports.comps = async (req, res) => {
  try {
    const comps = await comp.comp(req)
    res.json(comps); 
  } catch (error) {
    console.error('Error al obtener la compensación (Controller):', error);
    res.status(500).json({ error: 'Error al obtener la compensación (Controller)' });
  }
}