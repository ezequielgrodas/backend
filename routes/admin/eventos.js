var express = require('express');
var router = express.Router();
var eventosModel = require('../../models/eventosModel')

var util = require('util');
var cloudinary = require('cloudinary').v2;
const uploader = util.promisify(cloudinary.uploader.upload);
const destroy = util.promisify(cloudinary.uploader.destroy);

cloudinary.config({ 
    cloud_name: 'dex9vr6r8', 
    api_key: '275761172348966', 
    api_secret: 'AhKs7LK0vaSYuM1b9GYvTRDG80M' 
  });
  
router.get('/',async function(req, res, next){

    var eventos = await eventosModel.getEventos();
    
    eventos = eventos.map(evento => {
        if (evento.img_id){
            const imagen = cloudinary.image(evento.img_id, {
                width: 100,
                height: 100,
                crop: 'fill'
            });
            return {
                ...evento,
                imagen
            }
        } else {
            return{
                ...evento,
                imagen: ''
            }
        }
    })

    res.render('admin/eventos', {
        layout: 'admin/layout',
        usuario: req.session.nombre,
        eventos
    });
});
router.get('/agregarevento',async function(req, res, next){

    

    res.render('admin/agregarevento', {
        layout: 'admin/layout',
        usuario: req.session.nombre
        
    });
});

router.post('/agregarevento', async (req, res, next) =>{
    try{
        var img_id = '';
        if(req.files && Object.keys(req.files).length > 0){
            imagen = req.files.imagen;
            img_id = (await uploader(imagen.tempFilePath)).public_id;
        }

        if (req.body.titulo != "" && req.body.descripcion != "" && req.body.info != ""){
            await eventosModel.insertEvento({
                ...req.body,
                img_id
            });
            res.redirect('/admin/eventos')
        }else{
            res.render('admin/agregarevento', {
                layout: 'admin/layout',
                error: true,
                message: 'Todos los campos son requeridos'
            })
        }
    }catch(error){
        console.log(error)
        res.render('admin/agregarevento',{
            layout: 'admin/layout',
            error: true,
            message: 'No se cargo el evento'
        })
    }
    })    


router.get('/eliminarevento/:id', async (req, res, next) => {
    var id = req.params.id;
    let evento = await eventosModel.getEventoById(id);
    if (evento.img_id){
        await (destroy(evento.img_id));
    }
    await eventosModel.deleteEventosById(id);
    res.redirect('/admin/eventos');
})


router.get('/modificarevento/:id', async (req, res, next) =>{
    var id = req.params.id;
    console.log(req.params.id);
    var evento = await eventosModel.getEventoById(id);

    console.log(req.params.id);
    res.render('admin/modificarevento', {
        layout: 'admin/layout',
        evento
    })
})


router.post('/modificarevento', async (req, res, next) => {
    try {
        let img_id = req.body.img_original;
        let borrar_img_vieja = false;
        if(req.body.img_delete === "1"){
            img_id = null;
            borrar_img_vieja = true;
        }else{
            if(req.files && Object.keys(req.files).length > 0){
                imagen = req.files.imagen;
                img_id = (await uploader(imagen.tempFilePath)).public_id;
                borrar_img_vieja = true;
            }
        }
        if (borrar_img_vieja && req.body.img_original){
            await (destroy(req.body.img_original));
        }

        let obj = {
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            info: req.body.info,
            img_id
        }
        console.log(obj)
        await eventosModel.modificarEventoById(obj, req.body.id);
        res.redirect('/admin/eventos')
    }catch(error){
        res.render('admin/modificarevento', {
            layout: 'admin/layout',
            error: true,
            message: 'No se modifico el evento'
        })
    }
})


module.exports = router

