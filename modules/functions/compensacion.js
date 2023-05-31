const distances = require('./distances');

exports.comp = async (req) => {
    try {
        const { comp, vacio_desde, ciudades, carga_nuevo } = req.body;
        let compensacion, distanciaVacio = 0, distanciaNuevo = 0, distanciaNormal;

        // Si detecta un valor de compensación devuelve ese mismo
        if (comp || comp === 0) {
            return { "compensacion": comp};
        }

        // Si no carga ni descarga en lugares diferentes se toma como Spot
        if (!vacio_desde && !carga_nuevo) {
            compensacion = 0.2;
        } else {
            const distanciaNormal1 = await distances.distances(req);
            distanciaNormal = distanciaNormal1.Distancia;

            // Cálculo de la distancia del Vacío Inicial
            if (vacio_desde) {
                req.body.ciudades = [vacio_desde, ciudades[0]];
                const distanciaVacio1 = await distances.distances(req);
                distanciaVacio = distanciaVacio1.Distancia;
            }

            // Cálculo de la distancia del Cargar de Nuevo
            if (carga_nuevo) {
                req.body.ciudades = [ciudades[ciudades.length - 1], carga_nuevo];
                const distanciaNuevo1 = await distances.distances(req);
                distanciaNuevo = distanciaNuevo1.Distancia;
            }

            req.body.ciudades = ciudades;

            // Cálculo del porcentaje de compensación
            compensacion = ((distanciaVacio + distanciaNuevo) / distanciaNormal) / 2;
            compensacion = compensacion.toFixed(2);

            // Si se pasa de 0.5 (que el vacío es mas largo que el cargado) lo baja
            if (compensacion > 0.5) {
                compensacion = 0.51;
            }

            // Si está por debajo de un Spot lo sube a un Spot normal
            if (compensacion < 0.2) {
                compensacion = 0.2;
            }
        }

        return { "compensacion": compensacion, "distancias": { "distanciaNormal": distanciaNormal, "distanciaVacio": distanciaVacio, "distanciaNuevo": distanciaNuevo } };
    } catch (error) {
        console.error('Error al obtener la compensación (Functions):', error);
        return { error: 'Error al obtener la compensación (Functions)' };
    }
};
