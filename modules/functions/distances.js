const axios = require('axios');

exports.distances = async (req) => {
    try {
        const ciudades = req.body.ciudades;
        const peajesDist = req.body.peajesDist;
        const coordenadas = {};
        const ciudades_api = [];

        // Verificar si no se ingresa alguna ciudad
        if (ciudades.length === 2 && (!ciudades[0] || !ciudades[1])) {
            return {"Origen": ciudades[0], "Destino": ciudades[1], "Distancia": 0};
        }

        // Si es la misma ciudad es un Urbano
        if (ciudades.length === 2 && ciudades[0] === ciudades[1]) {
            return {"Origen": ciudades[0], "Destino": ciudades[1], "Distancia": 50};
        }

        // Define la URL del servicio de Distancia
        let distanceAPI = 'https://api.distance.to/api/v2/directions/get/route/v1/driving/';

        for (let i = 0; i < ciudades.length; i++) {
            // Define la URL del servicio de Sugerencias de ArcGIS y de geocodificación de ArcGIS
            const arcgisSuggestionUrl = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest';
            const arcgisGeocodingUrl = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';
            // Define los parámetros y los encabezados de la solicitud
            const params = { "text": ciudades[i] + ", COL", "outFields": "*", "maxSuggestions": 5, "f": "json" };
            const headers = {};
            // Envía la solicitud y guarda la respuesta
            const res1 = await axios.get(arcgisSuggestionUrl, { params, headers });
            const suggestion = res1.data;

            // Define la clave de API de ArcGIS
            const arcgis_api_key = suggestion["suggestions"][0]["magicKey"];
            // Guarda el nombre completo de la Ciudad
            const ciudad_api = String(suggestion["suggestions"][0]["text"]);
            ciudades_api.push(ciudad_api);

            // Envía la solicitud y guarda la respuesta
            const params2 = { 'f': 'json', 'magicKey': arcgis_api_key };
            const res2 = await axios.get(arcgisGeocodingUrl, { params: params2 });
            const data = res2.data;

            // Obtenemos las Coordenadas
            const lng = `${data['candidates'][0]['location']["x"]}`;
            const lat = `${data['candidates'][0]['location']["y"]}`;
            coordenadas[ciudad_api] = { 'lat': parseFloat(lat), 'lng': parseFloat(lng) };
            distanceAPI += lng+','+lat;
            if (i !== ciudades.length - 1) {
                for(let peaje of peajesDist[i]) {
                    distanceAPI += ';' + peaje.location.lng+','+peaje.location.lat;
                }
                distanceAPI += ';';
            }
        }

        let distancia = 0;
        let geometry;
        try {
            distanceAPI += '?apiKey=MbdqfjdNhMPkDS57Q&midpoint=true';
            // Envía la solicitud y guarda la respuesta
            const headers = { "distance-token": "0C7aw48QlR#6!N#2GnEB8kSJAa2!3br2" };
            const res3 = await axios.post(distanceAPI, {}, { headers });
            const dat = res3.data;

            distancia = Math.round((((dat.routes[0].distance) / 1000) - 5) / 0.99);

            // Urbanos a 50 km
            if (distancia < 50) {
                distancia = 50;
            }

            // Guardamos la geometria de la ruta
            geometry = dat.routes[0].geometry;
        } catch (error) {
            distancia = -1;
        }

        return {"Origen": ciudades_api[0], "Destino": ciudades_api[ciudades.length - 1], "Distancia": distancia, "Coordenadas": coordenadas, "Geometry": geometry};
    } catch (error) {
        console.error('Error al obtener la distancia (Functions):', error);
        return { error: 'Error al obtener la distancia (Functions)' };
    }
}
