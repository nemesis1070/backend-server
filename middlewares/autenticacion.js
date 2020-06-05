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
    });
}


///////////////////////////////// verificar ADMIN

exports.verificarAdmin_Role = function(req, res, next) {


    var usuario = req.usuario;
    console.log(usuario);
    if (usuario.Role === 'ADMIN_ROLE') {
        next();
    } else {
        res.status(401).json({
            ok: false,
            mensaje: 'Token no valido- No es administrador',
            error: { message: 'no es administrador, no puede ejecutar esa accion' }
        });
    }
}


///////////////////////////////// verificar ADMIN o mismo usuario

exports.verificarAdmin_o_MismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id; /// se obtiene informacion que venga como parametro en la peticion actualizar usuario

    console.log(usuario);
    if (usuario.Role === 'ADMIN_ROLE' || usuario.Id === id) {
        next();
    } else {
        res.status(401).json({
            ok: false,
            mensaje: 'Token no valido- No es administrador, ni es el mismo usuario',
            error: { message: 'no es administrador o ni es el mismo usuario, no puede ejecutar esa accion' }
        });
    }
}