var express = require('express');
var sql = require("mssql");
var app = express();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken'); /// libreria para crear tokens
var fraCla = require('../config/config').fraseCla; /// asi se obtienen valor variables creadas desde otro archivo
var config = require('../models/DBConfig');

app.post('/', (req, res) => {

    var body = req.body;
    var configDB = new config();
    sql.connect(configDB, function(err) {

        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();

        var data = request.query("select * from usuarios where email='" + body.Email + "'", function(err, table) {
            if (err) {
                res.status(500).json({
                    ok: true,
                    mensaje: 'Error conexion DB'
                });
            } else {

                if (table == null || table.recordset == 0) {
                    res.status(400).json({
                        ok: true,
                        mensaje: 'Crendenciales incorrectas'
                    });

                } else {
                    bcrypt.compare(body.Password, table.recordset[0].Password, function(err, isMatch) {
                        if (err) {} else if (!isMatch) {
                            res.status(400).json({
                                ok: true,
                                mensaje: 'Password Incorrecto'
                            });
                        } else {
                            table.recordset[0].Password = "";
                            var token = jwt.sign({ usuario: table.recordset[0] }, fraCla, { expiresIn: 14400 }) /// 4 horas

                            res.status(200).json({
                                ok: true,
                                mensaje: table.recordset[0],
                                Token: token,

                            });
                        }
                    });
                }

            }

        });

    });

});


module.exports = app; /// con esto se puede utilizar el app fuera de este archivo en el app.js que esta fuera de la carpeta routes