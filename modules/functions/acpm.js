const axios = require('axios');
const cheerio = require('cheerio');

exports.acpm = async (req) => {
  try {
    // Scraping de la pagina web donde está el precio del Diesel
    const response = await axios.get('https://es.globalpetrolprices.com/Colombia/diesel_prices/');
    const $ = cheerio.load(response.data);
    const priceElement = $('#graphPageLeft table tbody tr:nth-child(1) td:nth-child(3)');
    const priceText = priceElement.text().trim();
    const x = parseInt(priceText.substring(0, 1)) * 1000;
    const y = parseInt(priceText.substring(2, 5));

    // Cálculo del valor del combustible por kilómetro
    const kpg = req.query.kpg;
    const diesel = (x + y) * 1.05;
    const pColombia = diesel / kpg;
    
    // Función de redondeo
    function round(value, precision) {
      let multiplier = Math.pow(10, precision || 0);
      return Math.round(value * multiplier) / multiplier;
    }

    return ({ "price": round(pColombia, -1), "precio_diesel": round(diesel, -1) });
  } catch (error) {
    console.error('Error al obtener el precio del diésel (functions):', error);
    return ({ error: 'Error al obtener el precio del diésel (functions)' });
  }
}
