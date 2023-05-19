const distances = require('../functions/distances')

exports.distances = async (req, res) => {
    try {
        const distancias = await distances.distances(req);
        return res.json(distancias);
    } catch (error) {
        console.error('Error al obtener la distancia (controller):', error);
        res.status(500).json({ error: 'Error al obtener la distancia  (controller)' });
    }
}