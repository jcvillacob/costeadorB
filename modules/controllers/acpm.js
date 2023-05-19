const acpm = require('../functions/acpm')

exports.acpms = async (req, res) => {
  try {
    const acpms = await acpm.acpm(req)
    res.json(acpms); 
  } catch (error) {
    console.error('Error al obtener el precio del diésel (controller):', error);
    res.status(500).json({ error: 'Error al obtener el precio del diésel (controller)' });
  }
}
