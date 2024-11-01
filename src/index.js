const express = require('express');
const path = require('path');
const conectarBD = require('../config/db');
const loginCollection = require('../models/loginCollection')
const cors = require('cors');


//creamos nuestro servidor
const app = express();
const port =  process.env.PORT || 7000;

//conexion bases de datos
conectarBD();
app.use(cors());
app.use(express.json());
app.set('view-engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
//ruta para consumir la api cliente
app.use('/api/clientes', require('../routes/rutasCliente'));
app.use('/api/productos', require('../routes/rutasProducto'));
app.use('/api/usuarios', require('../routes/rutasUsuario'));
//const ejs = require("ejs");



//ruta para verificar el servidor


//servidor modulosEl
//const viewspath = path.join(__dirname,"../views")
//app.set("views", viewspath);

//app.use(express.static('views'));
//app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req,res) => {
    res.render('init');
})

app.get('/logout', (req,res) => {
    res.redirect('/login')
})

app.get('/login', (req,res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register', { error: '', data: {} });
})

app.post('/register', async (req, res) => {
    const { nombres, apellidos, documento, email, telefono, direccion, password, confirmPassword } = req.body;

    // Verificar si las contraseñas coinciden
    if (password !== confirmPassword) {
        return res.status(400).render('register', { error: 'Passwords do not match', data: {nombres, apellidos, documento, telefono, direccion, email} });
    }

    try {
        // Verificar si el email ya está registrado
        const existingUser = await loginCollection.findOne({ email });

        if (existingUser) {
            return res.status(400).render('register', { error: 'Email already registered', data: { nombres, apellidos, documento, telefono, direccion } });
        }

        // Crear y guardar el nuevo usuario
        const newUser = new loginCollection({ nombres, apellidos, documento, email, telefono, direccion, password });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        res.status(500).render('register', { error: 'Server error, Try again.', data: { nombres, apellidos, documento, telefono, direccion } });
    }
})



app.post('/login', async (req,res) => {
    try {
        const path = require('path');
        app.use(express.static(path.join(__dirname, '../../frontend')));
        const {email, password} = req.body;

        const user = await loginCollection.findOne({email: email})

        if(!user) {
            return res.status(400).render('login',{error: 'Incorrect email or password', data: { email } })
        }

        if (user.password !== password) {
            return res.status(400).render('login',{error: 'Incorrect password'})
        }

        
        res.render('init', { nombres: user.nombres });
    } catch (error) {
        res.status(500).render('login',{error: 'An error occurred. Please try again.'})
    }
})




//ruta de nuestro servidor local
app.listen(port,() =>{
    console.log(`El servidor está conectado en http://localhost:${port}`);
})
