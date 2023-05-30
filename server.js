const express = require("express");
const mysql = require("mysql");
const multer = require("multer");
const path = require('path');

const app = express();
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))

var con = mysql.createConnection({
    host : 'localhost',
    user : 'uriel',
    password : '123456789',
    database : 'yearbook',
})

const upload = multer({
    dest : 'public/imagenes',
    fileFilter : function(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg)$/)){
            return cb(new Error('solo se permiten archivos JPG'));
        }
        cb(null, true);
    }
})

app.post("/registrar", upload.single('file'),(req, res)=>{
    //var code = req.body.fcodigo;
    var correo = req.body.R_correo;
    var nombre = req.body.R_nombre;
    var contraseña = req.body.R_contraseña;
    var tipo_usuario = req.body.R_tipo;
    console.log('Conectado!!');
    var sql = 'INSERT INTO usuarios (correo, contraseña, nombre, tipo_usuario) VALUES (?,?,?,?)';
    console.log("si entro");
    con.query(sql, [correo, contraseña, nombre, tipo_usuario], function(err, result){
        if (err) {
            throw err;
        } else {
            console.log('Numero de registros insertados: ' + result.affectedRows);
            console.log(correo, nombre, contraseña, tipo_usuario);
        }
    })
   
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.post('/iniciar', (req, res) => {
    const correo = req.body.IS_correo;
    const contraseña = req.body.IS_contraseña;
    const query = 'SELECT * FROM usuarios WHERE correo = ? AND contraseña = ?';
    con.query(query, [correo, contraseña], (error, results) => {
      if (error) {
        console.error('Error al consultar la base de datos: ', error);
        res.status(500).send('Error al procesar la solicitud');
        return;
      }
      if (results.length > 0) {
        res.redirect('/inicio');
      } else {
        res.send('Credenciales incorrectas');
      }
    });
  });

  app.get('/inicio', (req, res)=>{
    con.query('SELECT * FROM proyectos', (error, rows)=>{
        if(error) throw error;
        if(!error){
            console.log(rows);
            res.render('inicio', {rows} );
        }
    })
});

app.get('/alumnos', (req, res)=>{
    con.query('SELECT * FROM alumnos', (error, rows)=>{
        if(error) throw error;
        if(!error){
            console.log(rows);
            res.render('alumnos', {rows} );
        }
    })
});

app.get('/perfil', (req, res)=>{
    con.query('SELECT * FROM alumnos WHERE id_alumno = ?', (error, rows)=>{
        if(error) throw error;
        if(!error){
            console.log(rows);
            res.render('alumnos', {rows} );
        }
    })
});


app.get("/", (req, res)=>{
    return res.redirect('index.html')
}).listen(5000);
console.log('Escuchando el puerto 5000')