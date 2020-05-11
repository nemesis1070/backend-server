var express = require('express');
var config = require('../models/DBConfig');
var sql = require("mssql");
var app = express();



app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;

    var promesa;

    switch (tabla) {
        case 'medicos':
            var stringQueryM = `select * from medicos where nombre COLLATE Latin1_General_CI_AI LIKE '%${busqueda}%' COLLATE Latin1_General_CI_AI`;
            promesa = buscarMedicos(stringQueryM);
            break
        case 'hospitales':
            var stringQueryH = `select * from hospitales where nombre COLLATE Latin1_General_CI_AI LIKE '%${busqueda}%' COLLATE Latin1_General_CI_AI`;
            promesa = buscarHospitales(stringQueryH);
            break
        case 'usuarios':
            var stringQueryU = `select idusuario, nombre,Email, img, role from usuarios where nombre COLLATE Latin1_General_CI_AI LIKE '%${busqueda}%' COLLATE Latin1_General_CI_AI UNION `;
            stringQueryU += `select idusuario, nombre,Email, img, role from usuarios where email COLLATE Latin1_General_CI_AI LIKE '%${busqueda}%' COLLATE Latin1_General_CI_AI`;

            promesa = buscarUsuarios(stringQueryU);
            break
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'La busqueda es solo por hospitales, medicos, usuarios'
            });
    }

    promesa.then(data => {
        return res.status(200).json({
            ok: true,
            [tabla]: data /////[tabla] si se coloca asi va a salir el valor que contenga la variable tabla en el json
        });
    });
});

///////////busqueda en todas las tablas 



app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;

    var stringQueryH = `select * from hospitales where nombre COLLATE Latin1_General_CI_AI LIKE '%${busqueda}%' COLLATE Latin1_General_CI_AI`;
    var stringQueryM = `select * from medicos where nombre COLLATE Latin1_General_CI_AI LIKE '%${busqueda}%' COLLATE Latin1_General_CI_AI`;
    var stringQueryU = `select idusuario, nombre,Email, img, role from usuarios where nombre COLLATE Latin1_General_CI_AI LIKE '%${busqueda}%' COLLATE Latin1_General_CI_AI UNION `;
    stringQueryU += `select idusuario, nombre,Email, img, role from usuarios where email COLLATE Latin1_General_CI_AI LIKE '%${busqueda}%' COLLATE Latin1_General_CI_AI`;

    Promise.all([
            buscarHospitales(stringQueryH),
            buscarMedicos(stringQueryM),
            buscarUsuarios(stringQueryU)
        ]) /// permite enviar un arreglo de promesas y si todas responden ok si dispara un then y si una falla se maneja el catch
        .then(respuesta => {
            res.status(200).json({
                ok: true,
                hospitales: respuesta[0],
                medicos: respuesta[1],
                usuario: respuesta[2]
            });

        }); // va a recibir un arreglo con las respuestas de las promesas en el mismo orden en que se enviaron las promesas



    /*  buscarHospitales(stringQueryH)
         .then(resp => {
             res.status(200).json({
                 ok: true,
                 mensaje: resp
             });
         }); */
});

function buscarHospitales(stringQuery) {
    var configDB = new config();

    return new Promise((resolve, reject) => {
        sql.connect(configDB, function(err) {
            // create Request object
            var request = new sql.Request();

            request.query(stringQuery, function(err, table) {
                if (table == null || table.recordset == 0) {
                    //reject('No hay hospitales registrados', err);
                    resolve(table.recordset);
                } else {
                    resolve(table.recordset);
                }

            });
        });
    })
}


function buscarMedicos(stringQuery) {
    var configDB = new config();

    return new Promise((resolve, reject) => {
        sql.connect(configDB, function(err) {
            // create Request object
            var request = new sql.Request();

            request.query(stringQuery, function(err, table) {
                if (table == null || table.recordset == 0) {
                    //reject('No hay medicos registrados', err);
                    resolve(table.recordset);
                } else {
                    resolve(table.recordset);
                }

            });
        });
    })
}

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

module.exports = app; /// con esto se puede utilizar el app fuera de este archivo