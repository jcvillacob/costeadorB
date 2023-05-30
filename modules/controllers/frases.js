const frases = require('../functions/frases')

exports.obtenerFrase = async (req, res) => {
  try {
    const frase = await frases.obtenerFrase(req)
    res.json(frase); 
  } catch (error) {
    console.error('Error al obtener la frase (controller):', error);
    res.status(500).json({ error: 'Error al obtener la frase (controller)' });
  }
}
