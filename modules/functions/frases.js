const axios = require('axios');

exports.obtenerFrase = async (req, res) => {
    try {
        const respuesta = await axios.get('https://zenquotes.io/api/random');
        const datos = respuesta.data;
        const frase = datos[0].q;
        const autor = datos[0].a;
        return {frase: frase, autor: autor};
    } catch (error) {
        console.error('Error al obtener la frase (functions):', error);
    return ({ error: 'Error al obtener la frase (functions)' });
    }
}

