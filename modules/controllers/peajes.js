const peajes = require('../functions/peajes')

exports.peajes = async (req, res) => {
    try {
        const peaje = await peajes.peajes(req);
        return res.json(peaje);
    } catch (error) {
        console.error('Error al obtener los peajes (Controller):', error);
        res.status(500).json({ error: 'Error al obtener los peajes (Controller)' });
    }
}