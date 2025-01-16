const express= require('express')
const session= require ('express-session')
const crypto = require('crypto')
const moment= require('moment-timezone');
const { read } = require('fs');

const app=express();

app.use(session({
    secret: 'p3-ECV#tres-sesionespersistentes',
    resave: false,
    saveUninitialized: true, 
    cookie: {secure:false, maxAge: 24*60*60*1000} //Usar secure: true solo si usas https, maxAge permite definir la duración de la sesión 24 horas
}));


app.get('/login/:nombre', (req ,res) =>{
    const userName = req.params.nombre;
    if(!req.session.createAt){
        req.session.userName = userName;
        req.session.createAt= new Date();
        req.session.lastAcess= new Date ();
        res.send(`
            <h1>Bienvenido, tu sesión ha sido iniciada</h1>
            <h1><strong>Nombre de usuario: </strong> ${userName}</h1>
            `)
    }else{
        res.send('<h1>Ya existe una sesión</h1>')
    }
})

app.get('/update', (req, res) =>{
    if(req.session.createAt){
        req.session.lastAcess = new Date();
        res.send('La fecha de último acceso ha sido actualizada')
    }else{
        res.send('No hay una sesión activa');
    }
})

app.get('/status', (req, res) =>{
    if(req.session.createAt){
        const now = new Date();
        const started= new Date(req.session.createAt);
        const lastUpdate= new Date(req.session.lastAcess);

        //Calcula la antiguedad de la sesión
        const sessionAgeMs= now- started;
        const hours= Math.floor(sessionAgeMs/ (1000*60*60))
        const minutes = Math.floor((sessionAgeMs % (1000*60*60))/(1000*60));
        const seconds= Math.floor((sessionAgeMs % (1000*60))/1000)

        const createdAt_CDMX = moment(started).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss')
        const lastAcces_CDMX = moment(lastUpdate).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss')
        

        res.json({
            message: 'Estado de la sesión',
            sessionId: req.sessionID,
            inicio: createdAt_CDMX,
            ultimoAcceso: lastAcces_CDMX,
            antiguedad: `${hours} horas, ${minutes} minutos y ${seconds} segundos`
            
        });

    }else{
        res.send('No hay sesión activa');
    }
});

app.get('/session', (req, res)=>{
    if(req.session && req.session.userName){
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
            `);
        }
    });



app.get('/logout', (req, res) => {
    if(req.session){
        req.session.destroy((err) => {
            if(err){
                return res.status(500).send('Error al cerrar sesión');
            }
            res.send('<h1>Sesión cerrada exitosamente.</h1>')
        })
    }else{
        res.send('No hay una sesión activca para cerrar')
    }

})

//app.get('/register')

app.listen(3001, () => {
    console.log('Servidor corriendo en el puerto 3001');
})