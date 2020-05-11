var jwt = require('jsonwebtoken'); /// libreria para crear tokens
var fraCla = require('../config/config').fraseCla; /// asi se obtienen valor variables creadas desde otro archivo


///////////////////////////////// verificar token

exports.verificarToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, fraCla, (err, decoded) => {
        if (err) {
            res.status(401).json({
                ok: false,
                mensaje: 'Token no valido',
                error: err
            });
        }

        req.usuario = decoded.usuario; /// la informacion del usuario este disponible en cualquier peticion


        next(); /// se  llama la funcion next si todo esta correcto puede continuar el resto del proceso

        /* 
                res.status(200).json({
                    ok: true,
                    Decode: decoded.usuario
                }); */
    });
}

/* app.use('/', (req, res, next) => {

    var token = req.query.token;

    jwt.verify(token, fraCla, (err, decoded) => {
        if (err) {
            res.status(401).json({
                ok: true,
                mensaje: 'Token no valido',
                error: err
            });
        }

        next(); /// se  llama la funcion next si todo esta correcto puede continuar el resto del proceso
    });
});
 */