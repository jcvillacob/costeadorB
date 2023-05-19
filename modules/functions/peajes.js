const axios = require('axios');

exports.peajes = async (req) => {
    try {
        const { ciudades, tipo_vh} = req.body;
        let totalCost = 0, peajes = [];

        // Datos necesarios por tipo de vehículo
        let x, y;
        if (tipo_vh === "TM") {
            x = 10;
            y = 52000;
        } else if (tipo_vh === "DT") {
            x = 7;
            y = 27000;
        } else if (tipo_vh === "SC") {
            x = 6;
            y = 18000;
        }

        // Iniciar sesión en Infotrip con los datos de registro
        const infotripURL = 'https://infotripapi.azurewebsites.net/api/account/Login';
        const auth_data = { "email": "jvillacob@coorditanques.com", "password": "Jucaviza_123" };
        const response = await axios.post(infotripURL, auth_data);
        const token = response.data.data.token;
        let geometry;

        // URL para obtener los datos de las ciudades
        const peajeURL = 'https://nominatim.openstreetmap.org/search/';

        // Ciclo for para evitar la superposición de peajes
        for (let i = 0; i < (ciudades.length - 1); i++) {
            const origen = ciudades[i];
            const destino = ciudades[i+1];
    
            // Sacarme de la función si el origen y el destino es la misma ciudad
            if (origen === destino) {
                totalCost += 0;
            }
    
            // Hacemos las solicitudes tanto para el origen como el destino
            const params = { 'q': origen, 'format': 'json', 'countrycodes': 'co' };
            const Resp = await axios.get(peajeURL, { params: params });
            const Respuesta = Resp.data;
    
            const params2 = { 'q': destino, 'format': 'json', 'countrycodes': 'co' };
            const Resp2 = await axios.get(peajeURL, { params: params2 });
            const Respuesta2 = Resp2.data;
    
            // Hacer la solicitud para obtener el valor de los peajes
            const Resultado = {
                "vehicleId": x,
                "vehicleTypeId": x,
                "totalWeight": y,
                "locations": [
                    {
                        "id": Respuesta[0].place_id,
                        "lat": Respuesta[0].lat,
                        "lng": Respuesta[0].lon,
                        "description": Respuesta[0].display_name
                    },
                    {
                        "id": Respuesta2[0].place_id,
                        "lat": Respuesta2[0].lat,
                        "lng": Respuesta2[0].lon,
                        "description": Respuesta2[0].display_name
                    }
                ]
            };
            const infoApiURL = 'https://infotripapi.azurewebsites.net/api/trip/CalculateTripCosts';
            const headers = { 'Authorization': `Bearer ${token}` };
            const solucion = await axios.post(infoApiURL, Resultado, { headers: headers });
            totalCost += solucion.data.data.tollsCosts.totalCost;
            peajes.push(solucion.data.data.tollsCosts.costBytolls);
            geometry = solucion.data.data.geometry;
        }

        return ({ "peajesTotales": totalCost, "peajes": peajes, "geometry": geometry });
    } catch (error) {
        console.error('Error al obtener los peajes (Functions):', error);
        return ({ error: 'Error al obtener los peajes (Functions)' });
    }
}

