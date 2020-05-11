var express = require('express');
var sql = require("mssql");
var app = express();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken'); /// libreria para crear tokens
var fraCla = require('../config/config').fraseCla; /// asi se obtienen valor variables creadas desde otro archivo
var config = require('../models/DBConfig');
var autenticaToken = require('../middlewares/autenticacion'); /// importa la clase donde esta el metodo que hace la verificacion del token 



////////////////////////////////      obtener todos los medicos

app.get('/', (req, res) => {


    var configDB = new config();

    var parametro = req.query.id;

    var pag = req.query.desde || 0; // si el parametro viene vacio coloca 0
    var limite = 3;

    var stringQuery;

    var camposUsuario = 'U.idusuario as UsuarioId, U.nombre as UsuarioNombre,U.Email as UsuarioEmail, U.img as UsuarioImg, U.role as UsuarioRole';
    var camposHospital = 'h.IdHospital as HospitalId, h.Nombre as HospitalNombre, h.Img as HospitalImg';
    var inner = "inner join hospitales h  on m.Hospital = h.IdHospital  inner join usuarios u on m.Usuario= u.IdUsuario";
    var paginado2 = `ORDER BY m.IdMedicos  OFFSET ( ${pag}-1 ) * ${limite} ROWS  FETCH NEXT ${limite} ROWS ONLY `;


    if (parametro == null) {

        stringQuery = `select COUNT(*) OVER () as TotalRegistros, m.IdMedicos, m.Nombre ,m.Img, ${camposUsuario}, ${camposHospital} from medicos m ${inner} ${paginado2}`;
    } else {
        stringQuery = `select COUNT(*) OVER () as TotalRegistros, m.IdMedicos, m.Nombre ,m.Img, ${camposUsuario}, ${camposHospital} from medico ${inner} where IdMedicos= + ${parametro} ${paginado2}`;
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
                        mensaje: 'No hay medicos registrados'
                    });

                } else {

                    var totalRegistros;
                    for (var i = 0; i < table.recordset.length; i++) {

                        if (i == 0) {
                            totalRegistros = table.recordset[i].TotalRegistros
                        }
                        delete table.recordset[i].TotalRegistros /// elimina la propiedad TotalRegistros de cada objecto en el arreglo de recordset
                    }


                    res.status(200).json({
                        ok: true,
                        mensaje: table.recordset,
                        total: totalRegistros
                    });
                }

            }

        });

    });


});


////////////////////////////////      actualizar medico


app.put('/:id', autenticaToken.verificarToken, (req, res) => {

    var configDB = new config();
    var id = req.params.id; /// obtener el parametro que viene en la url del servicio
    var body = req.body;


    sql.connect(configDB, function(err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        var sqlQuery = `update medicos SET `;

        sqlQuery += `Nombre='${body.Nombre}', `
        sqlQuery += `Usuario='${req.usuario.IdUsuario}', `
        sqlQuery += `Hospital='${body.Hospital}' `
        sqlQuery += `where IdMedicos=${id}`
        console.log(sqlQuery);

        request.query(sqlQuery)
            .then(function(dbData) {

                res.status(200).json({
                    ok: true,
                    medico: dbData.recordset,
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


////////////////////////////////      crear medico

app.post('/', autenticaToken.verificarToken, (req, res) => { /// el token se envia como parametro opcional ? en la url se envia como segundo parametro, se envia al metodo de verificacion del token que se importo

    var configDB = new config();
    var body = req.body;

    sql.connect(configDB, function(err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        var sqlQuery = `insert into medicos (Img, Usuario, Hospital, Nombre) values ('${body.Img}','${req.usuario.IdUsuario}','${body.Hospital}','${body.Nombre}')`;

        request.query(sqlQuery)
            .then(function(dbData) {

                res.status(200).json({
                    ok: true,
                    medico: dbData,
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


////////////////////////////////      eliminar medico


app.delete('/:id', autenticaToken.verificarToken, (req, res) => {

    var id = req.params.id; /// obtener el parametro que viene en la url del servicio
    var configDB = new config();
    sql.connect(configDB, function(err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        var sqlQuery = stringQuery = "delete  from medicos where IdMedicos=" + id;

        request.query(sqlQuery)
            .then(function(dbData) {

                res.status(200).json({
                    ok: true,
                    medico: dbData.recordset
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







module.exports = app; /// con esto se puede utilizar el app fuera de este archivo en el app.js que esta fuera de la carpeta routes