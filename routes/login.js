var express = require('express');
var sql = require("mssql");
var app = express();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken'); /// libreria para crear tokens
var { fraseCla } = require('../config/config'); /// asi se obtienen valor variables creadas desde otro archivo
var config = require('../models/DBConfig');
var usuarioInfo = require('../models/usuario');
//// google
var { CLIENT_ID } = require('../config/config'); /// asi se obtienen valor variables creadas desde otro archivo
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


/// autenticacion google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });


    const payload = ticket.getPayload();
    /*  const userid = payload['sub']; */
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


app.post('/google', async(req, res) => {

    var token = req.body.token;
    var promesa;

    var googleUsr = await verify(token)
        .catch(err => {
            res.status(403).json({
                ok: false,
                mensaje: 'token no valido',

            });
        });

    var usuarioCreado = new usuarioInfo();
    usuarioCreado.nombre = googleUsr.nombre,
        usuarioCreado.email = googleUsr.email,
        usuarioCreado.password = '...',
        usuarioCreado.img = googleUsr.img,
        usuarioCreado.role = 'USU',
        usuarioCreado.google = true

    var stringQueryU = `select * from usuarios where email='${usuarioCreado.email}'`;

    promesa = buscarUsuarios(stringQueryU);

    promesa.then(data => {

        console.log(data);
        if (data == '') {


            var sqlQuery = `insert into usuarios (Nombre,Email,Password,Img,Role,Google) values ('${usuarioCreado.nombre}','${usuarioCreado.email}','${bcrypt.hashSync(usuarioCreado.password, 10)}','${usuarioCreado.img}','ADMIN','true')`;

            var promesaU = insertarUsuarios(sqlQuery);
            promesaU.then(res1 => {
                var token = jwt.sign({ usuario: usuarioCreado.nombre }, fraseCla, { expiresIn: 14400 }) /// 4 horas

                return res.status(200).json({
                    ok: true,
                    token: token /////[tabla] si se coloca asi va a salir el valor que contenga la variable tabla en el json
                });
            });
        } else {

            if (data.google == 0) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'debe usar su autenticacion normal'
                });
            } else {
                var token = jwt.sign({ usuario: googleUsr.nombre }, fraseCla, { expiresIn: 14400 }) /// 4 horas

                res.status(200).json({
                    ok: true,
                    mensaje: 'inicio de sesion correcto',
					datos: data,
                    Token: token
                });

            }

        }

    });

});


/// autenticacion normal
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
                            var token = jwt.sign({ usuario: table.recordset[0] }, fraseCla, { expiresIn: 14400 }) /// 4 horas

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


function insertarUsuarios(stringQuery) {
    var configDB = new config();

    return new Promise((resolve, reject) => {
        sql.connect(configDB, function(err) {
            // create Request object
            var request = new sql.Request();

            request.query(stringQuery, function(err, table) {
                if (table == null || table.recordset == 0) {
                    resolve('ok');
                } else {
                    resolve(table.recordset);
                }

            });
        });
    })
}


module.exports = app; /// con esto se puede utilizar el app fuera de este archivo en el app.js que esta fuera de la carpeta routes