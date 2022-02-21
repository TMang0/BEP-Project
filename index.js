var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var app = express();
var _ = require('lodash');
const morgan = require('morgan');
const cors = require('cors');
const fileUpload = require('express-fileupload');
var uniqid = require('uniqid');
const jwt = require('jsonwebtoken')
require('dotenv').config();


//CONEXION BD

mongoose.connect("Database").then(function (db) {
    console.log("Estamos Conectados");
}).catch(function (err) {
    console.log("Error", err);
})

//CONFIGURACIONES
app.use(bodyParser.urlencoded({ extended: true }));
let path = __dirname + "/Frontend/views";
app.set('views', path);
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/Frontend'));
app.use(express.json())

app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 5 * 1024 * 1024 * 1024 //2MB max file(s) size
    }
}));

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

//tabla
let Entrada = require('./src/model/ingresar');
const { uniqueId } = require("lodash");
const { token } = require("morgan");
const trabajos = require("./src/model/trabajos");

// HTML GET // 
app.get('/sobre_nosotros', async function (req, res) {
    res.render('about')
})
app.get('/', async function (req, res) {
    res.render('indexpage')
}
)
app.get('/contacto', async function (req, res) {
    res.render('contact')
}
)
app.get('/blog', async function (req, res) {
    res.render('single')
}
)

app.get('/inicio_sesion', async function (req, res) {
    res.render('login');
});
app.get('/registro', async function (req, res) {
    res.render('registro');
});
app.get('/empresas', validateToken, async function (req, res) {

    const listado = await trabajos.find();
    res.render('empresas',{
        empleo:listado
    });

});
app.get('/redirect', async function (req, res) {
    res.render('redirect');
});
app.get('/trabajos', validateToken, async function (req, res) {
    const listado = await trabajos.find();
    res.render('user',{
        empleo:listado
    });
});
app.get('/agregar_trabajos', validateToken, async function (req, res) {
    res.render('agregar_trabajo',{
        nuevo: true
    });
});
app.get('/eliminar/:id', validateToken, async function(req, res){
    var id = req.params.id;
    
   await trabajos.findByIdAndRemove(id);

   res.redirect("/empresas");

});
app.get('/modificar/:id', validateToken, async function(req, res){
    var id = req.params.id;

    var reserva = await trabajos.findById(id);

    res.render('modificar', {
        nuevo: false,
        res: reserva
    });

});
// POST 

// JWT 


// app.post('/auth',(req, res) => {
//     const = 
// })

app.post('/registro', async function (req, res) {
    await Entrada.insertMany({ correo: req.body.correo, contrasena: req.body.contrasena, rol: req.body.rol, fecha: new Date(), tipoDocumento: req.body.tipoDocumento, documento: req.body.documento });
    res.redirect('/inicio_sesion')
});
var authToken;
app.post('/trabajos', async function (req, res) {


    var info = await Entrada.findOne({ correo: req.body.correo, contrasena: req.body.contrasena });
    console.log(info)

    if(info == null){
        return res.redirect('/')
    }
    else{
    const user = { username: info.correo }

    authToken = jwt.sign(user, process.env.SECRET, {expiresIn:'1h'})

    if (info != null) {
        console.log("sirve");

    }
    if (info.rol == "1") {

        return res.status(200).redirect('admin')

    } else if (info.rol == "2") {
        if(info.nuevo){
            return res.render('finalreg_emp',{
                id:info._id
            })
        }
        else{
        return res.redirect('/empresas');
    }
    }

    else if (info.rol == "3") {
        if(info.nuevo){
            return res.render('finalreg_usu',{
                id: info._id
            });
        }
        else{
        return res.redirect('/trabajos');
    }

    } else {
        console.log("NOOOOO");
        return res.render('index');
    }
    }

});

// JWT 
// function generateAccessToken(user) {
//     return jwt.sign(user, process.env.SECRET, { expiresIn: "10m" });

// }

function validateToken(req, res, next) {
    if(authToken == 'undefined' || authToken == null){
        res.send("Acceso Denegado");
    }
    const accessToken = authToken
    if (!accessToken) res.send("Acceso Denegado");

    jwt.verify(accessToken, process.env.SECRET, (err, user) => {
        if (err) {
            res.send("Token expirado o incorrecto, acceso denegado")
        }
        else {
            req.user = user;
            next()
        }
    })
}
app.post('/terminarRegistro', async function (req, res) {
    let datos = req.body;
    await Entrada.updateOne({ _id: req.body._id }, datos);
    res.redirect('/redirect')



});
app.post('/terminarRegistro2', async function (req, res) {
    let datos = req.body;
    console.log({ datos })
    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            let avatar = req.files.avatar;
            await Entrada.updateOne({ _id: req.body._id }, { ...datos, avatar: uniqid('-', avatar.name) });

            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file


            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            avatar.mv('./uploads/' + uniqid('-', avatar.name));

            //send response

            res.redirect('/redirect')
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
app.post('/agregar_trabajos', async function (req, res) {
    await trabajos.insertMany({ trabajoNombre: req.body.trabajoNombre, duracion: req.body.duracion, categoria: req.body.categoria, descripcion: req.body.descripcion});
    res.redirect('/empresas')
});
app.post('/modificar', async function(req, res){
    var datos = req.body;
    console.log(datos)
    await trabajos.updateOne({_id: req.body.id}, datos);

    res.redirect("/empresas");

});
app.listen(3000);
