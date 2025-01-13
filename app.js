const express=require('express')
const session=require ('express-session')
const crypto = require('crypto')

const app=express();

app.use(session({
    secret: 'mi-clave-secreta',
    resave: false,
    saveUninitialized: true, 
    cookie: {secure: false}
}));

app.use((req, res, next) => {
    if(req.session){
        if(!req.session.createAt){
            req.session.createAt = new Date();
            req.session.id = crypto.randomUUID();
        }
        req.session.lastAcess = new Date();
    }
    next();
});

app.get('/login/:name/:pass', (req ,res) =>{
    const userName = req.params.name;
    const password= req.params.pass;

    if(req.session){
        req.session.userName = userName;
        req.session.password = password;
        res.send(`
            <h1>Bienvenido al sistema</h1>
            <p><strong>Nombre de usuario: </strong> ${userName}</p>
            <p><a href="/session">Ir a detalles de la sesión</a></p>
            `)
    }else{
        res.send('<h1>No se pudo iniciar sesión.</h1>')
    }
})

app.get('/session', (req, res)=>{
    if(req.session && req.session.userName && req.session.password){
        const userName = req.session.userName;
        const sessionId= req.session.id;
        const createAt= new Date(req.session.createAt);
        const lastAcess= new Date(req.session.lastAcess);
        const sessionDuration= ((new Date()-createAt)/1000).toFixed(2);

        res.send(`
        <h1>Detalles de la sesión.</h1>
        <p><strong>ID de la sesión:</strong> ${sessionId}</p>
        <p><strong>Nombre de usuario:</strong> ${userName}</p>
        <p><strong>Fecha de creación de la sesión:</strong> ${createAt}</p>
        <p><strong>Último acceso:</strong> ${lastAcess}</p>
        <p><strong>Duración de la sesión (en segundos): </strong> ${sessionDuration}</p>
        `)
    }else{
        res.send(`
            <h1>No hay sesión activa.</h1>
            <p><a href="/login/Invitado">Iniciar sesión como Invitado</a></p>
            `);
        }
    });



app.get('/logout', (req, res) => {
    req.session.destroy((err)=>{
        if(err){
            return res.send('Error al cerrar la sesión.');
        }
        res.send('<h1>Sesión cerrada exitosamente.</h1>')
    })

})

//app.get('/register')

app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
})