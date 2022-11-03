var express = require('express');
var router = express.Router();
var lanzamientosModel = require('../../models/lanzamientosModel');

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

    var lanzamientos = await lanzamientosModel.getLanzamientos();
    
    lanzamientos = lanzamientos.map(lanzamiento => {
        if (lanzamiento.img_id){
            const imagen = cloudinary.image(lanzamiento.img_id, {
                width: 100,
                height: 100,
                crop: 'fill'
            });
            return {
                ...lanzamiento,
                imagen
            }
        } else {
            return{
                ...lanzamiento,
                imagen: ''
            }
        }
    })

    res.render('admin/lanzamientos', {
        layout: 'admin/layout',
        usuario: req.session.nombre,
        lanzamientos
    });
});
router.get('/agregarlanzamiento',async function(req, res, next){

    

    res.render('admin/agregarlanzamiento', {
        layout: 'admin/layout',
        usuario: req.session.nombre
        
    });
});

router.post('/agregarlanzamiento', async (req, res, next) =>{
    try{
        var img_id = '';
        if(req.files && Object.keys(req.files).length > 0){
            imagen = req.files.imagen;
            img_id = (await uploader(imagen.tempFilePath)).public_id;
        }


        if (req.body.titulo != "" && req.body.descripcion != "" && req.body.info != ""){
            await lanzamientosModel.insertLanzamiento({
                ...req.body,
                img_id
            });
            res.redirect('/admin/lanzamientos')
        }else{
            res.render('admin/agregarlanzamiento', {
                layout: 'admin/layout',
                error: true,
                message: 'Todos los campos son requeridos'
            })
        }
    }catch(error){
        console.log(error)
        res.render('admin/agregarlanzamiento',{
            layout: 'admin/layout',
            error: true,
            message: 'No se cargo el lanzamiento'
        })
    }
    })    
router.get('/eliminarlanzamiento/:id', async (req, res, next) => {
    var id = req.params.id;
    let lanzamiento = await lanzamientosModel.getLanzamientoById(id);
    if (lanzamiento.img_id){
        await (destroy(lanzamiento.img_id));
    }
    await lanzamientosModel.deleteLanzamientosById(id);
    res.redirect('/admin/lanzamientos');
})
router.get('/modificarlanzamiento/:id', async (req, res, next) =>{
    var id = req.params.id;
    console.log(req.params.id);
    var lanzamiento = await lanzamientosModel.getLanzamientoById(id);

    console.log(req.params.id);
    res.render('admin/modificarlanzamiento', {
        layout: 'admin/layout',
        lanzamiento
    })
})
router.post('/modificarlanzamiento', async (req, res, next) => {
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
            artista: req.body.artista,
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            img_id
        }
        console.log(obj)
        await lanzamientosModel.modificarLanzamientoById(obj, req.body.id);
        res.redirect('/admin/lanzamientos')
    }catch(error){
        res.render('admin/modificarlanzamiento', {
            layout: 'admin/layout',
            error: true,
            message: 'No se modifico el lanzamiento'
        })
    }
})
module.exports = router

