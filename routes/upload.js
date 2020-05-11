var express = require('express');
var config = require('../models/DBConfig');
var sql = require("mssql");
var app = express();
var fileUpload = require('express-fileupload');
var fs = require('fs'); /////// esta paquete permite eliminar archivos  
var path = require('path');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo; /// es el la tabla donde se va a cargar el archivo 
    var id = req.params.id;

    var tiposValidos = ['hospital', 'medico', 'usuario'];

    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'tipo no valido',
            Error: { message: 'extensiones validas son hospital ,medico, usuario' }
        });
    }


    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            Error: { message: 'debe seleccionar algo' }
        });
    }

    /// obtener nombre archivo
    var archivo = req.files.Imagen; /// imagen es el parametro que se envia en la peticion
    var nombrecortado = archivo.name.split('.');

    var extensionArchivo = nombrecortado[nombrecortado.length - 1];
    /// validacion para aceptar ciertos tipos de archivos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            Error: { message: 'extensiones validas son png ,jpg, gif, jpeg' }
        });
    }

    ////////////////// nombre archivo personalizado que se va a subir

    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    ////////////////// mover el archivo del temporal a un path dentro del proyecto carpeta uploads

    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => { //// mueve el archivo a ese path
        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'error cargar archivo',
                Error: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });

});

function updateTabla(query, res) {
    var configDB = new config();

    return new Promise((resolve, reject) => {
        sql.connect(configDB, function(err) {
            // create Request object
            var request = new sql.Request();

            request.query(query, function(err, table) {
                if (table == null || table.recordset == 0) {
                    //reject('No hay hospitales registrados', err);
                    resolve(table);
                } else {
                    resolve(table);
                }

            });
        });
    })
}

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuario') {
        var stringQueryU = `select img from usuarios where idusuario ='${id}'`;
        var stringUpdateU = `update usuarios set img='${nombreArchivo}' where idusuario ='${id}'`;
        buscarUsuarios(stringQueryU)
            .then(resp => {

                if (resp.rowsAffected[0] === 0) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'el usuario no existe en bd',

                    });
                } else {
                    console.log(resp.recordset[0].img)

                    var imagenViejaBorrar = 'uploads/usuario/' + resp.recordset[0].img;

                    // elimina imagen vieja usuario

                    if (resp.recordset[0].img != null) {

                        fs.exists(path.join("./", imagenViejaBorrar), function(res, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                fs.unlink(path.join("./", imagenViejaBorrar), function(err) {
                                    if (err) {
                                        console.log(err);
                                    }

                                    console.log('File deleted!', path.join("../public", imagenViejaBorrar));
                                });
                            }
                        });

                    }

                    // subir la nueva imagen de usuario

                    updateTabla(stringUpdateU, res).then(respU => {
                        res.status(200).json({
                            ok: true,
                            mensaje: respU
                        });

                    });


                }


            });
    }
    if (tipo === 'hospital') {
        var stringQueryH = `select img from hospitales where idhospital='${id}'`;
        var stringUpdateH = `update hospitales set img='${nombreArchivo}' where idhospital ='${id}'`;
        buscarHospitales(stringQueryH)
            .then(resp => {
                if (resp.rowsAffected[0] === 0) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'el hospital no existe en bd',

                    });
                } else {
                    console.log(resp.recordset[0].img)

                    var imagenViejaBorrar = 'uploads/hospital/' + resp.recordset[0].img;

                    // elimina imagen vieja usuario

                    if (resp.recordset[0].img != null) {

                        fs.exists(path.join("./", imagenViejaBorrar), function(res, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                fs.unlink(path.join("./", imagenViejaBorrar), function(err) {
                                    if (err) {
                                        console.log(err);
                                    }

                                    console.log('File deleted!', path.join("../public", imagenViejaBorrar));
                                });
                            }
                        });

                    }

                    // subir la nueva imagen de hospital

                    updateTabla(stringUpdateH, res).then(respU => {
                        res.status(200).json({
                            ok: true,
                            mensaje: respU
                        });

                    });


                }
            });
    }
    if (tipo === 'medico') {
        var stringQueryM = `select img from medicos where idmedicos='${id}'`;
        var stringUpdateM = `update medicos set img='${nombreArchivo}' where idmedicos ='${id}'`;

        buscarMedicos(stringQueryM)
            .then(resp => {
                if (resp.rowsAffected[0] === 0) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'el medico no existe en bd',

                    });
                } else {
                    console.log(resp.recordset[0].img)

                    var imagenViejaBorrar = 'uploads/medico/' + resp.recordset[0].img;

                    // elimina imagen vieja usuario

                    if (resp.recordset[0].img != null) {

                        fs.exists(path.join("./", imagenViejaBorrar), function(res, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                fs.unlink(path.join("./", imagenViejaBorrar), function(err) {
                                    if (err) {
                                        console.log(err);
                                    }

                                    console.log('File deleted!', path.join("../public", imagenViejaBorrar));
                                });
                            }
                        });

                    }

                    // subir la nueva imagen de medico

                    updateTabla(stringUpdateM, res).then(respU => {
                        res.status(200).json({
                            ok: true,
                            mensaje: respU
                        });

                    });


                }
            });

    }
}


function buscarHospitales(stringQuery) {
    var configDB = new config();

    return new Promise((resolve, reject) => {
        sql.connect(configDB, function(err) {
            // create Request object
            var request = new sql.Request();

            request.query(stringQuery, function(err, table) {
                if (table == null || table.recordset == 0) {
                    //reject('No hay hospitales registrados', err);
                    resolve(table);
                } else {
                    resolve(table);
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
                    resolve(table);
                } else {
                    resolve(table);
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
                    resolve(table);
                } else {
                    resolve(table);
                }

            });
        });
    })
}


module.exports = app; /// con esto se puede utilizar el app fuera de este archivo en el app.js que esta fuera de la carpeta routes