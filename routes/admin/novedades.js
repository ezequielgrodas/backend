var express = require('express');
var router = express.Router();
var novedadesModel = require('../../models/novedadesModel')

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

    var novedades = await novedadesModel.getNovedades();

    novedades = novedades.map(novedad => {
        if (novedad.img_id){
            const imagen = cloudinary.image(novedad.img_id, {
                width: 100,
                height: 100,
                crop: 'fill'
            });
            return {
                ...novedad,
                imagen
            }
        } else {
            return{
                ...novedad,
                imagen: ''
            }
        }
    })

    res.render('admin/novedades', {
        layout: 'admin/layout',
        usuario: req.session.nombre,
        novedades
    });
});
router.get('/agregarnovedad',async function(req, res, next){

    

    res.render('admin/agregarnovedad', {
        layout: 'admin/layout',
        usuario: req.session.nombre
        
    });
});

router.post('/agregarnovedad', async (req, res, next) =>{
    try{

        var img_id = '';
        if(req.files && Object.keys(req.files).length > 0){
            imagen = req.files.imagen;
            img_id = (await uploader(imagen.tempFilePath)).public_id;
        }

        if (req.body.titulo != "" && req.body.descripcion != "" ){
            await novedadesModel.insertNovedad({
                ...req.body,
                img_id
            });
            res.redirect('/admin/novedades')
        }else{
            res.render('admin/agregarnovedad', {
                layout: 'admin/layout',
                error: true,
                message: 'Todos los campos son requeridos'
            })
        }
    }catch(error){
        console.log(error)
        res.render('admin/agregarnovedad',{
            layout: 'admin/layout',
            error: true,
            message: 'No se cargo la novedad'
        })
    }
    })    
router.get('/eliminarnovedad/:id', async (req, res, next) => {
    var id = req.params.id;

    let novedad = await novedadesModel.getNovedadById(id);
    if (novedad.img_id){
        await (destroy(novedad.img_id));
    }
    await novedadesModel.deleteNovedadesById(id);
    res.redirect('/admin/novedades');
})
router.get('/modificarnovedad/:id', async (req, res, next) =>{
    var id = req.params.id;
    console.log(req.params.id);
    var novedad = await novedadesModel.getNovedadById(id);

    console.log(req.params.id);
    res.render('admin/modificarnovedad', {
        layout: 'admin/layout',
        novedad
    })
})
router.post('/modificarnovedad', async (req, res, next) => {
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
            img_id
        }
        console.log(obj)
        await novedadesModel.modificarNovedadById(obj, req.body.id);
        res.redirect('/admin/novedades')
    }catch(error){
        res.render('admin/modificarnovedad', {
            layout: 'admin/layout',
            error: true,
            message: 'No se modifico la novedad'
        })
    }
})
module.exports = router

