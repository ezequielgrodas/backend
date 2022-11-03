var pool = require('./bd');

async function getLanzamientos() {
    var query = 'select * from lanzamientos';
    var rows = await pool.query(query);
    return rows;
}
async function insertLanzamiento(obj){
    try{
        var query = 'insert into lanzamientos set ?';
        var rows = await pool.query(query, [obj]);
        return rows;
    }catch (error){
        console.log(error);
        throw error;
    }
}
async function deleteLanzamientosById(id){
    var query = 'delete from lanzamientos where id = ?';
    var rows = await pool.query(query, [id]);
    return rows;
}

async function getLanzamientoById(id){
    var query = 'select * from lanzamientos where id = ?';
    var rows = await pool.query(query, [id]);
    return rows[0];
}
async function modificarLanzamientoById(obj, id){
    try {
        var query = 'update lanzamientos set ? where id= ?';
        var rows = await pool.query(query, [obj, id]);
        return rows;
    }catch (error){
        throw error;
    }
}

module.exports = { getLanzamientos, insertLanzamiento, deleteLanzamientosById, getLanzamientoById, modificarLanzamientoById }