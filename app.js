// Requeries   --- importacion de librerias de terceros o personalizadas

var express = require('express');
var sql = require("mssql");
var bodyParser = require('body-parser');

// Inicializar variable --- aqui se utilizan las librerias



// defino mi servidor express
var app = express();

// HABILITAR CORS -- recibir peticiones de dominios externos
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", ""); // url frontend
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST,GET,PUT,DELETE,OPTIONS"); // opciones para esten habilitados y se puedan ejecutar los metodos 
  next();
});
/// body parser 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())


/// Importar rutas

var busquedaRoutes = require('./routes/busqueda');
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

// Rutas
app.use('/imagenes', imagenesRoutes);
app.use('/upload', uploadRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/medico', medicoRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);



// Escuchar peticiones

app.listen(3000, () => {
    console.log('Express server puerto 3000 \x1b[32m%s\x1b[0m', 'online');
});