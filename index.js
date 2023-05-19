const express = require('express');
const app = express();
require('dotenv').config({path : 'variables.env'});
const bodyParser = require('body-parser');
const cors = require('cors');

// Modules
const acpm = require('./modules/controllers/acpm');
const ecuador = require('./modules/controllers/ecuador');
const distances = require('./modules/controllers/distances');
const compensacion = require('./modules/controllers/compensacion');
const peajes = require('./modules/controllers/peajes');
const costos = require('./modules/controllers/costos');
const costeo = require('./modules/controllers/costeo');
const comprobacion = require('./modules/controllers/comprobar');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.use(cors());

// Routes
app.get('/acpm', acpm.acpms);
app.post('/ecuador', ecuador.ecu);
app.post('/distancia', distances.distances);
app.post('/compensacion', compensacion.comps);
app.post('/peaje', peajes.peajes);
app.get('/costo', costos.costoss);
app.post('/costeo', costeo.costeos);
app.post('/comprobar', comprobacion.comprobacion);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});