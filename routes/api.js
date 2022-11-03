var express = require('express');
var router = express.Router();
var novedadesModel = require('./../models/novedadesModel'); 
var eventosModel = require('./../models/eventosModel'); 
var lanzamientosModel = require('./../models/lanzamientosModel');
var cloudinary = require('cloudinary').v2;
var nodemailer = require('nodemailer');

cloudinary.config({ 
    cloud_name: 'dex9vr6r8', 
    api_key: '275761172348966', 
    api_secret: 'AhKs7LK0vaSYuM1b9GYvTRDG80M' 
  });
  
  router.get('/novedades',async function(req, res, next){

    var novedades = await novedadesModel.getNovedades();

    novedades = novedades.map(novedades => {
        if (novedades.img_id){
            const imagen = cloudinary.url(novedades.img_id, {
                
                crop: 'fill'
            });
            return {
                ...novedades,
                imagen
            }
        } else {
            return{
                ...novedades,
                imagen: ''
            }
        }
    })

    res.json(novedades);
});

router.get('/lanzamientos',async function(req, res, next){

    var lanzamientos = await lanzamientosModel.getLanzamientos();
    
    lanzamientos = lanzamientos.map(lanzamientos => {
        if (lanzamientos.img_id){
            const imagen = cloudinary.url(lanzamientos.img_id, {
                
                crop: 'fill'
            });
            return {
                ...lanzamientos,
                imagen
            }
        } else {
            return{
                ...lanzamientos,
                imagen: ''
            }
        }
    })

    res.json(lanzamientos)
});
router.get('/eventos',async function(req, res, next){

    var eventos = await eventosModel.getEventos();
    
    eventos = eventos.map(eventos => {
        if (eventos.img_id){
            const imagen = cloudinary.url(eventos.img_id, {
                
                crop: 'fill'
            });
            return {
                ...eventos,
                imagen
            }
        } else {
            return{
                ...eventos,
                imagen: ''
            }
        }
    })

    res.json(eventos)
});


router.post('/contacto', async (req, res) =>{
    const mail = {
        to: 'ezequielgrodas@yahoo.com.ar',
        subject: 'Contacto web',
        html:`${req.body.nombre} se contacto a traves de la web y quiere obtener mas informacion a este correo: ${req.body.email} <br> Su mensaje es: ${req.body.mensaje} <br> Su telefono es ${req.body.telefono} <br> Su pagina web es ${req.body.paginaweb}`
    }
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        
        }
    });
    await transport.sendMail(mail)

    res.status(201).json({
        error: false,
        message: 'Mensaje enviado'
    });
});
module.exports = router;