const axios = require('axios');

exports.ecuador = async (req) => {
  try {
    let { ciudad_ecuador, ciudades, loraver } = req.body;
    let ecuador = 0;

    // Solicitar los datos del precio del dolar
    const response = await axios.get('https://v6.exchangerate-api.com/v6/dc1e0b069ce65a525dc6811b/latest/USD');
    const resp = response.data;
    const dolar = resp["conversion_rates"]["COP"] * 1.03;

    // Comprobar que el destino es San Miguel o Ipiales y asignarle el valor
    const destino_lower = ciudades[ciudades.length - 1].toLowerCase();
    if (ciudad_ecuador) {
      ciudad_ecuador = ciudad_ecuador.toLowerCase();
    } else {
      ciudad_ecuador = '';
    }
    if (!loraver){
      if (destino_lower.includes("san miguel")) {
        if (ciudad_ecuador.includes("guayaquil")) {
          ecuador = 2725 * dolar;
        } else if (ciudad_ecuador.includes("quito")) {
          ecuador = 1950 * dolar;
        }
      } else if (destino_lower.includes("ipiales")) {
        if (ciudad_ecuador.includes("guayaquil")) {
          ecuador = 2120 * dolar;
        } else if (ciudad_ecuador.includes("quito")) {
          ecuador = 1478 * dolar;
        }
      }
    } else {
      if (destino_lower.includes("san miguel") || destino_lower.includes("ipiales")) {
        ecuador = loraver * dolar;
      }
    }

    // Función de redondeo
    function round(value, precision) {
      let multiplier = Math.pow(10, precision || 0);
      return Math.round(value * multiplier) / multiplier;
    }

    return ({ "precioLoraver": round(ecuador, -3), "precioDolar": round(dolar, -1) });
  } catch (error) {
    console.error('Error al obtener el costo de ir a Ecuador (Functions):', error);
    return ({ error: 'Error al obtener el costo de ir a Ecuador (Functions)' });
  }
}
