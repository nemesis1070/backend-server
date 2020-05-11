var express = require('express');

var app = express();

app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'peticion finaliza correctamente'
    });

});

module.exports = app; /// con esto se puede utilizar el app fuera de este archivo