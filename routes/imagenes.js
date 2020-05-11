var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`); /// __dirname  obtiene la ruta donde se corre la aplicacion
    var imagenV = `uploads/${tipo}/${img}`;
    var pathNoImage = path.resolve(__dirname, `../assests/no-img.jpg`);;

    console.log(imagenV);
    console.log(pathNoImage);




    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        res.sendFile(pathNoImage);
    }
    /*  if(fs.exists(path.join("./", imagenV), function(ok, err){
         
     }));


     var respuesta = fs.exists(path.join("./", imagenV), function(ok, err): {
         if (err) {
             return false;
         } else {
             return true;
         }
     }); */



    /* if (respuesta) {
        
    } else {
        
    } */
    /*    if (!fs.exists(pathImagen, function(res, err) {})) {


       } else {
           res.SendFile(pathImagen);
       }

    */
});

module.exports = app; /// con esto se puede utilizar el app fuera de este archivo