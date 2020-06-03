var express = require('express');
var sql = require("mssql");
var app = express();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken'); /// libreria para crear tokens
var fraCla = require('../config/config').fraseCla; /// asi se obtienen valor variables creadas desde otro archivo
var config = require('../models/DBConfig');
var autenticaToken = require('../middlewares/autenticacion'); /// importa la clase donde esta el metodo que hace la verificacion del token 



////////////////////////////////      obtener todos los hospitales

app.get('/', (req, res) => {

    var configDB = new config();

    var parametro = req.query.id;

    var stringQueryCount;
    var stringQuery;
    var promesa;

    console.log(parametro);
    if (parametro == null) {

        stringQueryCount = "select COUNT(*) as totalRegistros from hospitales";
        stringQuery = "SELECT * FROM hospitales";

        promesa = buscarData(stringQueryCount);
        promesa.then(data => {

            var promesaPag = buscarData(stringQuery);

            promesaPag.then(res1 => {

                return res.status(200).json({
                    ok: true,
                    hospitales: res1,
                    total: data[0].totalRegistros
                });
            });

        }).catch(err => {
            return res.status(500).json({
                ok: false,
                mensaje: err.originalError.info.message
            });
        });;

    }


    /*   var camposUsuario = 'U.idusuario as UsuarioId, U.nombre as UsuarioNombre,U.Email as UsuarioEmail, U.img as UsuarioImg, U.role as UsuarioRole';
       var inner = "inner join usuarios U on U.idusuario = h.Usuario";

       if (parametro == null) {

           stringQuery = `select h.IdHospital, h.Nombre, h.Img,${camposUsuario} from hospitales h ${inner}`;
       } else {
           stringQuery = `select h.IdHospital, h.Nombre, h.Img, ${camposUsuario} from hospitales h ${inner} where idhospital=${parametro}`;
       }

        console.log(stringQuery);

       sql.connect(configDB, function(err) {

           if (err) console.log(err);

           // create Request object
           var request = new sql.Request();

           var data = request.query(stringQuery, function(err, table) {
               if (err) {
                   res.status(500).json({
                       ok: true,
                       mensaje: 'Error conexion DB'
                   });
               } else {

                   if (table == null || table.recordset == 0) {
                       res.status(400).json({
                           ok: true,
                           mensaje: 'No hay hospitales registrados'
                       });

                   } else {
                       res.status(200).json({
                           ok: true,
                           mensaje: table.recordset
                       });
                   }

               }

           });

       }); */


});


////////////////////////////////   buscar hospital por id

app.get('/:id', (req, res) => {

    var id = req.params.id;

    var stringQueryH = 'Select * from hospitales where idhospital=' + id;
    var stringQueryU = 'Select Nombre,Email,Img from usuarios where idusuario=';

    promesa = buscarData(stringQueryH);
    promesa.then(data => {

        console.log(data);
        if (data === 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Hospital no existe en la BD'
            });
        } else {
            stringQueryU += data[0].Usuario;
            var promesa1 = buscarData(stringQueryU);

            promesa1.then(res1 => {

                return res.status(200).json({
                    ok: true,
                    hospital: data,
                    usuario: res1
                });
            });
        }

    }).catch(err => {
        console.log(err);
        /* return res.status(500).json({
            ok: false,
            mensaje: err
        }); */
    });


    /* var stringQuery;
    var camposUsuario = 'U.idusuario as UsuarioId, U.nombre as UsuarioNombre,U.Email as UsuarioEmail, U.img as UsuarioImg, U.role as UsuarioRole';
    var inner = "inner join usuarios U on U.idusuario = h.Usuario";

    if (parametro == null) {

        stringQuery = `select h.IdHospital, h.Nombre, h.Img,${camposUsuario} from hospitales h ${inner}`;
    } else {
        stringQuery = `select h.IdHospital, h.Nombre, h.Img, ${camposUsuario} from hospitales h ${inner} where idhospital=${parametro}`;
    }

    console.log(stringQuery);

    sql.connect(configDB, function(err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        var data = request.query(stringQuery, function(err, table) {
            if (err) {
                res.status(500).json({
                    ok: true,
                    mensaje: 'Error conexion DB'
                });
            } else {

                if (table == null || table.recordset == 0) {
                    res.status(400).json({
                        ok: true,
                        mensaje: 'No hay hospitales registrados'
                    });

                } else {
                    res.status(200).json({
                        ok: true,
                        mensaje: table.recordset
                    });
                }

            }

        });

    }); */


});



////////////////////////////////      actualizar hospital


app.put('/:id', autenticaToken.verificarToken, (req, res) => {

    var configDB = new config();
    var id = req.params.id; /// obtener el parametro que viene en la url del servicio
    var body = req.body;
    sql.connect(configDB, function(err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        var sqlQuery = `update hospitales SET `;

        sqlQuery += `Nombre='${body.Nombre}', `
        sqlQuery += `Usuario='${req.usuario.IdUsuario}' `
        sqlQuery += `where idhospital=${id}`
        console.log(sqlQuery);

        request.query(sqlQuery)
            .then(function(dbData) {

                res.status(200).json({
                    ok: true,
                    hospital: dbData.recordset,
                    usuarioToken: req.usuario /// esa variable se llena al invocar el metodo  autenticaToken.verificarToken
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


////////////////////////////////      crear hospital

app.post('/', autenticaToken.verificarToken, (req, res) => { /// el token se envia como parametro opcional ? en la url se envia como segundo parametro, se envia al metodo de verificacion del token que se importo

    var configDB = new config();
    var body = req.body;

    sql.connect(configDB, function(err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        var sqlQuery = `insert into hospitales (Nombre,Img,Usuario) values ('${body.Nombre}','${body.Img}','${req.usuario.IdUsuario}')`;

        request.query(sqlQuery)
            .then(function(dbData) {

                res.status(200).json({
                    ok: true,
                    hospital: dbData,
                    usuarioToken: req.usuario /// esa variable se llena al invocar el metodo  autenticaToken.verificarToken
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


////////////////////////////////      eliminar hospital


app.delete('/:id', autenticaToken.verificarToken, (req, res) => {

    var id = req.params.id; /// obtener el parametro que viene en la url del servicio
    var configDB = new config();
    sql.connect(configDB, function(err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        var sqlQuery = stringQuery = "delete  from hospitales where idhospital=" + id;

        request.query(sqlQuery)
            .then(function(dbData) {

                res.status(200).json({
                    ok: true,
                    hospital: dbData.recordset
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


function buscarData(stringQuery) {
    var configDB = new config();

    return new Promise((resolve, reject) => {
        sql.connect(configDB, function(err) {
            // create Request object
            var request = new sql.Request();

            request.query(stringQuery, function(err1, table) {

                if (table == null || table.recordset == 0) {
                    resolve(table.rowsAffected[0]);
                } else {
                    resolve(table.recordset);
                }

                if (err1) {
                    reject(err1);
                }

            });
        });
    })
}

module.exports = app; /// con esto se puede utilizar el app fuera de este archivo en el app.js que esta fuera de la carpeta routes