var express = require('express');
var sql = require("mssql");
var app = express();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken'); /// libreria para crear tokens
var fraCla = require('../config/config').fraseCla; /// asi se obtienen valor variables creadas desde otro archivo
var autenticaToken = require('../middlewares/autenticacion'); /// importa la clase donde esta el metodo que hace la verificacion del token 
var usuarioInfo = require('../models/usuario');
var config = require('../models/DBConfig');


////////////////////////////////      obtener todos los usuarios
app.get('/', (req, res, next) => {

    var parametropag = req.query.desde || 0; // si el parametro viene vacio coloca 0
    /* console.log(req.query.id); */
    parametropag: Number(parametropag);

    var promesa;



    var configDB = new config();

    var parametro = req.query.id;

    var stringQuery;
    var stringQueryPag;
    if (parametro == null) {

        stringQuery = "select COUNT(*) as totalRegistros from usuarios";
        stringQueryPag = "SELECT * FROM usuarios ORDER BY IdUsuario OFFSET " + parametropag + " ROWS FETCH NEXT " + 5 + " ROWS ONLY";

        promesa = buscarUsuarios(stringQuery);
        promesa.then(data => {

            var promesaPag = buscarUsuariosPag(stringQueryPag);

            promesaPag.then(res1 => {

                return res.status(200).json({
                    ok: true,
                    usuarios: res1,
                    total: data[0].totalRegistros
                });
            });

        });

    } else {
        stringQuery = "select * from usuarios where idusuario=" + parametro;
        promesa = buscarUsuarios(stringQuery);
        promesa.then(data => {

            return res.status(200).json({
                ok: true,
                usuarios: data
            });
        });

    }

    /*     sql.connect(configDB, function(err) {

            if (err) console.log(err);

            // create Request object
            var request = new sql.Request();
            request.query(stringQuery)
                .then(function(dbData) {
                    if (dbData == null || dbData.length === 0) {
                        return;
                    } else {
                        res.status(200).json({
                            ok: true,
                            usuarios: dbData.recordset,
                            total: dbData.rowsAffected[0]
                        });
                    }

                })
                .catch(function(error) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error al consultar DB' + err
                    });
                });
        }); */

});




////////////////////////////////      actualizar usuario


app.put('/:id', autenticaToken.verificarToken, (req, res) => {

    var configDB = new config();
    var id = req.params.id; /// obtener el parametro que viene en la url del servicio
    var body = req.body;

    sql.connect(configDB, function(err) {

        console.log(body);
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        var sqlQuery = `update usuarios SET `;

        sqlQuery += `Nombre='${body.Nombre}', `
        sqlQuery += `Email='${body.Email}', `
        sqlQuery += `Role='${body.Role}'`
        sqlQuery += `where idusuario=${id}`
        console.log(sqlQuery);

        request.query(sqlQuery)
            .then(function(dbData) {

                res.status(200).json({
                    ok: true,
                    usuarios: dbData.recordset
                });


            })
            .catch(function(error) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar DB',
                    Error: error
                });
            });
    });

    /*  */

});


////////////////////////////////      crear usuario

//app.post('/', autenticaToken.verificarToken, (req, res) => { /// el token se envia como parametro opcional ? en la url se envia como segundo parametro, se envia al metodo de verificacion del token que se importo
app.post('/', (req, res) => {
    var configDB = new config();
    var body = req.body;
    console.log(req.usuario);

    var usuarioCreado = new usuarioInfo();
    usuarioCreado.nombre = body.Nombre,
        usuarioCreado.email = body.Email,
        usuarioCreado.password = body.Password,
        usuarioCreado.img = body.Img,
        usuarioCreado.role = body.Role,
        usuarioCreado.google = body.Google


    console.log(usuarioCreado);

    sql.connect(configDB, function(err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        var sqlQuery = `insert into usuarios (Nombre,Email,Password,Img,Role,Google) values ('${body.Nombre}','${body.Email}','${bcrypt.hashSync(body.Password, 10)}','${body.Img}','${body.Role}','${body.Google}')`;

        request.query(sqlQuery)
            .then(function(dbData) {

                res.status(200).json({
                    ok: true,
                    usuarios: 'usuario registrado en DB'
                        //usuarioToken: req.usuario /// esa variable se llena al invocar el metodo  autenticaToken.verificarToken
                });


            })
            .catch(function(error) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar DB',
                    Error: error
                });
            });
    });

});



////////////////////////////////      eliimnar usuario


app.delete('/:id', autenticaToken.verificarToken, (req, res) => {

    var id = req.params.id; /// obtener el parametro que viene en la url del servicio
    var configDB = new config();
    sql.connect(configDB, function(err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        var sqlQuery = stringQuery = "delete  from usuarios where idusuario=" + id;

        request.query(sqlQuery)
            .then(function(dbData) {

                res.status(200).json({
                    ok: true,
                    usuarios: dbData.recordset
                });


            })
            .catch(function(error) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar DB',
                    Error: error
                });
            });
    });

});



function buscarUsuarios(stringQuery) {
    var configDB = new config();

    return new Promise((resolve, reject) => {
        sql.connect(configDB, function(err) {
            // create Request object
            var request = new sql.Request();

            request.query(stringQuery, function(err, table) {
                if (table == null || table.recordset == 0) {
                    resolve(table.recordset);
                } else {
                    resolve(table.recordset);
                }

            });
        });
    })
}


function buscarUsuariosPag(stringQuery) {
    var configDB = new config();

    return new Promise((resolve, reject) => {
        sql.connect(configDB, function(err) {
            // create Request object
            var request = new sql.Request();

            request.query(stringQuery, function(err, table) {
                if (table == null || table.recordset == 0) {
                    resolve(table.recordset);
                } else {
                    resolve(table.recordset);
                }

            });
        });
    })
}



module.exports = app; /// con esto se puede utilizar el app fuera de este archivo en el app.js que esta fuera de la carpeta routes