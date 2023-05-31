const express = require("express");
const session = require('express-session');
const mysql = require("mysql");
const multer = require("multer");
const path = require('path');

const app = express();
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))

app.use(session({
    secret: 'secreto', // Cambia esto por una clave secreta más segura
    resave: false,
    saveUninitialized: false
  }));


var con = mysql.createConnection({
    host : 'bang4lqimmpucrznawyy-mysql.services.clever-cloud.com',
    user : 'utfa96gwfr4cgjc4',
    password : 'hpppbuLqHk0IgrHbFSs2',
    database : 'bang4lqimmpucrznawyy',
   /* host:'localhost',
    user:'uriel',
    password:'123456789',
    database:'anuario',*/
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
    console.log('Conectado!!');
    var sql = 'INSERT INTO alumnos (nombre, correo, contraseña) VALUES (?,?,?)';
    console.log("si entro");
    con.query(sql, [nombre, correo, contraseña], function(err, result){
        if (err) {
            throw err;
        } else {
            console.log('Numero de registros insertados: ' + result.affectedRows);
            console.log(nombre, correo, contraseña);
        }
    })
   
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.post('/iniciar', (req, res) => {
    const correo = req.body.IS_correo;
    const contraseña = req.body.IS_contraseña;
    const query = 'SELECT * FROM alumnos WHERE correo = ? AND contraseña = ?';
    con.query(query, [correo, contraseña], (error, results) => {
      if (error) {
        console.error('Error al consultar la base de datos: ', error);
        res.status(500).send('Error al procesar la solicitud');
        return;
      }
      if (results.length > 0) {
        const alumnoId = results[0].id_alumno;
        req.session.userId = alumnoId;
        res.redirect('/inicio');
      } else {
        res.send('Credenciales incorrectas');
      }
    });
  });

  app.post('/admins-login', (req, res) => {
    const correo = req.body.IS_correo;
    const contraseña = req.body.IS_contraseña;
    const query = 'SELECT * FROM admin WHERE correo = ? AND contraseña = ?';
    con.query(query, [correo, contraseña], (error, results) => {
      if (error) {
        console.error('Error al consultar la base de datos: ', error);
        res.status(500).send('Error al procesar la solicitud');
        return;
      }
      if (results.length > 0) {
        const adminId = results[0].id_admin;
        req.session.userId = adminId;
        res.redirect('/inicio-admin');
      } else {
        res.send('Credenciales incorrectas');
      }
    });
  });


 /* app.get('/inicio', (req, res)=>{
    con.query('SELECT * FROM proyectos', (error, rows)=>{
        if(error) throw error;
        if(!error){
            console.log(rows);
            res.render('inicio', {rows} );
        }
    })
});*/


app.get('/inicio-admin', (req, res) => {
  // Realizar la consulta a la base de datos para obtener los datos de los alumnos
  // Aquí tienes un ejemplo utilizando MySQL con el paquete 'mysql2'
  const query = 'SELECT * FROM alumnos';
  con.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener los datos de los alumnos: ', error);
      res.status(500).send('Error al obtener los datos de los alumnos');
      return;
    }
    
    // Renderizar la plantilla 'alumnos.ejs' con los datos de los alumnos
    res.render('inicio-admin', { alumnos: results });
  });
});

app.get('/proyectos-admin', (req, res) => {
  con.query('SELECT * FROM proyectos', (error, proyectos) => {
    if (error) throw error;
    if (!error) {
      con.query('SELECT * FROM alumnos', (error, alumnos) => {
        if (error) throw error;
        if (!error) {
          const proyectosConAutor = proyectos.map(proyecto => {
            const alumno = alumnos.find(alumno => alumno.id_alumno === proyecto.id_alumno);
            return { ...proyecto, autor: alumno ? `${alumno.nombre} ${alumno.apellido}` : 'Autor desconocido' };
          });
          console.log(proyectosConAutor);
          res.render('proyectos-admin', { proyectos: proyectosConAutor });
        }
      });
    }
  });
}); 

app.get('/inicio', (req, res) => {
  con.query('SELECT * FROM proyectos', (error, proyectos) => {
    if (error) throw error;
    if (!error) {
      con.query('SELECT * FROM alumnos', (error, alumnos) => {
        if (error) throw error;
        if (!error) {
          const proyectosConAutor = proyectos.map(proyecto => {
            const alumno = alumnos.find(alumno => alumno.id_alumno === proyecto.id_alumno);
            return { ...proyecto, autor: alumno ? `${alumno.nombre} ${alumno.apellido}` : 'Autor desconocido' };
          });
          console.log(proyectosConAutor);
          res.render('inicio', { proyectos: proyectosConAutor });
        }
      });
    }
  });
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



app.get('/perfil', (req, res) => {
    const alumnoId = req.session.userId; // Obtener el ID del alumno de la sesión
    if (!alumnoId) {
        res.send('No has iniciado sesión');
        return;
    }

    const query = `
        SELECT alumnos.*, habilidades.*
        FROM alumnos
        LEFT JOIN habilidades ON alumnos.id_alumno = habilidades.id_alumno
        WHERE alumnos.id_alumno = ?`;
    con.query(query, [alumnoId], (error, results) => {
        if (error) {
            console.error('Error al consultar la base de datos: ', error);
            res.status(500).send('Error al procesar la solicitud');
            return;
        }

        if (results.length > 0) {
            const alumno = results[0];
            const habilidades = results[0];
            // Renderizar la vista del perfil y pasar los datos del alumno y las habilidades
            res.render('perfil', { alumno, habilidades });
        } else {
            res.send('No se encontraron datos del alumno');
        }
    });
});

app.post('/actPersonal', upload.single('file'), (req, res) => {
  console.log('Valor de contraseña:', req.body.f_contraseña);
  const alumnoId = req.session.userId; // Obtener el ID del alumno de la sesión
  if (!alumnoId) {
    res.send('No has iniciado sesión');
    return;
  }
  const foto = req.file ? req.file.filename : null;
  const nombre = req.body.F_nombre;
  const apellido = req.body.F_apellido;
  const contrasena = req.body.f_contraseña;
  const carrera = req.body.F_carrera;
  const semestre = req.body.F_semestre;
  const correo = req.body.F_correo;

  const query = 'UPDATE alumnos SET foto = ?, nombre = ?, apellido = ?, carrera = ?, semestre = ?, correo = ? WHERE id_alumno = ?';
  con.query(query, [foto, nombre, apellido, carrera, semestre, correo, alumnoId], (error, results) => {
    if (error) {
      console.error('Error al actualizar los datos en la base de datos: ', error);
      res.status(500).send('Error al procesar la solicitud');
      return;
    }
    res.redirect('/perfil');
  });
});


/*app.post('/actPersonal', upload.single('file'), (req, res) => {
    const alumnoId = req.session.userId; // Obtener el ID del alumno de la sesión
    if (!alumnoId) {
      res.send('No has iniciado sesión');
      return;
    }
    const foto = req.file.filename ? req.file.filename : null;
    const nombre = req.body.F_nombre;
    const apellido = req.body.F_apellido;
    const contraseña = req.body.F_contraseña;
    const carrera = req.body.F_carrera;
    const semestre = req.body.F_semestre;
    const correo = req.body.F_correo;
  
    const query = 'UPDATE alumnos SET foto = ?, nombre = ?, apellido = ?, contraseña = ?, carrera = ?, semestre = ?, correo = ? WHERE id_alumno = ?';
    con.query(query, [foto, nombre, apellido, contraseña, carrera, semestre, correo, alumnoId], (error, results) => {
      if (error) {
        console.error('Error al actualizar los datos en la base de datos: ', error);
        res.status(500).send('Error al procesar la solicitud');
        return;
      }
      res.redirect('/perfil');
    });
  });*/

  /*app.post('/actPersonal', upload.single('file'), (req, res) => {
    const alumnoId = req.session.userId; // Obtener el ID del alumno de la sesión
    if (!alumnoId) {
      res.send('No has iniciado sesión');
      return;
    }
    const foto = req.file ? req.file.filename : null;
    const nombre = req.body.F_nombre;
    const apellido = req.body.F_apellido;
    const contraseña = req.body.F_contraseña;
    const carrera = req.body.F_carrera;
    const semestre = req.body.F_semestre;
    const correo = req.body.F_correo;
  
    const query = 'UPDATE alumnos SET foto = ?, nombre = ?, apellido = ?, contraseña = ?, carrera = ?, semestre = ?, correo = ? WHERE id_alumno = ?';
    con.query(query, [foto, nombre, apellido, contraseña, carrera, semestre, correo, alumnoId], (error, results) => {
      if (error) {
        console.error('Error al actualizar los datos en la base de datos: ', error);
        res.status(500).send('Error al procesar la solicitud');
        return;
      }
      res.redirect('/perfil');
    });
  });*/

  app.post('/actHabilidades', (req, res) => {
    const alumnoId = req.session.userId; // Obtener el ID del alumno de la sesión
    if (!alumnoId) {
      res.send('No has iniciado sesión');
      return;
    }
    
    const obj_corto = req.body.f_obj_corto;
    const obj_largo = req.body.f_obj_largo;
    const habilidades = req.body.f_habilidades;
    const fortalezas = req.body.f_fortalezas;
    const intereses = req.body.f_intereses;
    
    const selectQuery = 'SELECT * FROM habilidades WHERE id_alumno = ?';
    con.query(selectQuery, [alumnoId], (selectError, selectResults) => {
      if (selectError) {
        console.error('Error al consultar la base de datos: ', selectError);
        res.status(500).send('Error al procesar la solicitud');
        return;
      }
      
      if (selectResults.length > 0) {
        // Actualizar el registro existente
        const updateQuery = 'UPDATE habilidades SET obj_corto = ?, obj_largo = ?, habilidades = ?, fortalezas = ?, intereses = ? WHERE id_alumno = ?';
        con.query(updateQuery, [obj_corto, obj_largo, habilidades, fortalezas, intereses, alumnoId], (updateError, updateResults) => {
          if (updateError) {
            console.error('Error al actualizar los datos en la base de datos: ', updateError);
            res.status(500).send('Error al procesar la solicitud');
            return;
          }
          res.redirect('/perfil');
        });
      } else {
        // Insertar un nuevo registro
        const insertQuery = 'INSERT INTO habilidades (id_alumno, obj_corto, obj_largo, habilidades, fortalezas, intereses) VALUES (?, ?, ?, ?, ?, ?)';
        con.query(insertQuery, [alumnoId, obj_corto, obj_largo, habilidades, fortalezas, intereses], (insertError, insertResults) => {
          if (insertError) {
            console.error('Error al insertar los datos en la base de datos: ', insertError);
            res.status(500).send('Error al procesar la solicitud');
            return;
          }
          res.redirect('/perfil');
        });
      }
    });
  });

  app.post('/actProyecto', upload.single('file'), (req, res) => {
    const alumnoId = req.session.userId; // Obtener el ID del alumno de la sesión
    if (!alumnoId) {
      res.send('No has iniciado sesión');
      return;
    }
    const foto = req.file.filename;
    const titulo = req.body.f_titulo;
    const descripcion = req.body.f_descripcion;
    
  
    const query = 'INSERT INTO proyectos (titulo, descripcion, foto, id_alumno) VALUES (?, ?, ?, ?)';
    con.query(query, [titulo, descripcion, foto, alumnoId], (error, results) => {
      if (error) {
        console.error('Error al actualizar los datos en la base de datos: ', error);
        res.status(500).send('Error al procesar la solicitud');
        return;
      }
      res.redirect('/perfil');
    });
  });

  app.get('/alumnos/:id', (req, res) => {
    const alumnoId = req.params.id; // Obtener el ID del alumno de los parámetros de la URL
  
    const query = 'SELECT * FROM alumnos WHERE id_alumno = ?';
    con.query(query, [alumnoId], (error, results) => {
      if (error) {
        console.error('Error al consultar la base de datos: ', error);
        res.status(500).send('Error al procesar la solicitud');
        return;
      }
      if (results.length > 0) {
        const alumno = results[0];
        // Obtener las habilidades y proyectos asociados al alumno
        const habilidadesQuery = 'SELECT * FROM habilidades WHERE id_alumno = ?';
        const proyectosQuery = 'SELECT * FROM proyectos WHERE id_alumno = ?';
  
        con.query(habilidadesQuery, [alumnoId], (habilidadesError, habilidadesResults) => {
          if (habilidadesError) {
            console.error('Error al consultar las habilidades en la base de datos: ', habilidadesError);
            res.status(500).send('Error al procesar la solicitud');
            return;
          }
  
          con.query(proyectosQuery, [alumnoId], (proyectosError, proyectosResults) => {
            if (proyectosError) {
              console.error('Error al consultar los proyectos en la base de datos: ', proyectosError);
              res.status(500).send('Error al procesar la solicitud');
              return;
            }
  
            // Renderizar la vista detallada del alumno y pasar los datos del alumno, habilidades y proyectos
            res.render('alumno-detalles', {
              alumno,
              habilidades: habilidadesResults[0],
              proyectos: proyectosResults
            });
          });
        });
      } else {
        res.send('No se encontraron datos del alumno');
      }
    });
  });

  app.post('/agregarAlumno', (req, res) => {
    const datos = req.body;

    const query = 'INSERT INTO alumnos (id_alumno, nombre, apellido, correo, contraseña, carrera, semestre) VALUES (?, ?, ?, ?, ?, ?, ?)';
    con.query(query, [datos.idalumno, datos.nombre, datos.apellido, datos.correo, datos.contraseña, datos.carrera, datos.semestre], (error, results) => {
      if (error) {
        console.error('Error al actualizar los datos en la base de datos:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el alumno en la base de datos' });
        return;
      }
      res.json({ mensaje: 'Alumno actualizado correctamente' });
    });
  });

  app.put('/editarAlumno/:alumnoId', (req, res) => {
    const alumnoId = req.params.alumnoId;
    const datos = req.body;
  
    const query = 'UPDATE alumnos SET nombre = ?, apellido = ?, contraseña = ?, correo = ?, carrera = ?, semestre = ? WHERE id_alumno = ?';
    con.query(query, [datos.nombre, datos.apellido, datos.contraseña, datos.correo, datos.carrera, datos.semestre, alumnoId], (error, results) => {
      if (error) {
        console.error('Error al actualizar los datos en la base de datos:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el alumno en la base de datos' });
        return;
      }
      res.json({ mensaje: 'Alumno actualizado correctamente' });
    });
  });
  

  app.delete('/borrarAlumno/:alumnoId', (req, res) => {
    const alumnoId = req.params.alumnoId; 
  
    const query = 'DELETE FROM alumnos WHERE id_alumno = ?';
    con.query(query, [alumnoId], (error, results) => {
      if (error) {
        console.error('Error al borrar los datos en la base de datos:', error);
        res.status(500).json({ mensaje: 'Error al borrar el alumno' });
        return;
      }
      res.redirect('/inicio-admin');
    });
  });


  app.post('/agregarProyecto', (req, res) => {
    const datos = req.body;

    const query = 'INSERT INTO proyectos (id_proyectos, titulo, descripcion, id_alumno) VALUES (?, ?, ?, ?)';
    con.query(query, [datos.idproyecto, datos.titulo, datos.descripcion, datos.idalumno], (error, results) => {
      if (error) {
        console.error('Error al actualizar los datos en la base de datos:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el proyecto en la base de datos' });
        return;
      }
      res.json({ mensaje: 'Proyecto actualizado correctamente' });
    });
  });

  app.put('/editarAlumno/:alumnoId', (req, res) => {
    const alumnoId = req.params.alumnoId;
    const datos = req.body;
  
    const query = 'UPDATE alumnos SET nombre = ?, apellido = ?, contraseña = ?, correo = ?, carrera = ?, semestre = ? WHERE id_alumno = ?';
    con.query(query, [datos.nombre, datos.apellido, datos.contraseña, datos.correo, datos.carrera, datos.semestre, alumnoId], (error, results) => {
      if (error) {
        console.error('Error al actualizar los datos en la base de datos:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el alumno en la base de datos' });
        return;
      }
      res.json({ mensaje: 'Alumno actualizado correctamente' });
    });
  });

  app.put('/editarProyecto/:proyectoId', (req, res) => {
    const proyectoId = req.params.proyectoId;
    const datos = req.body;
  
    const query = 'UPDATE proyectos SET titulo = ?, descripcion = ? WHERE id_proyectos = ?';
    con.query(query, [datos.titulo, datos.descripcion, proyectoId], (error, results) => {
      if (error) {
        console.error('Error al actualizar los datos en la base de datos:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el proyecto en la base de datos' });
        return;
      }
      res.json({ mensaje: 'Proyecto actualizado correctamente' });
    });
  });


  app.delete('/borrarProyecto/:proyectoId', (req, res) => {
    const proyectoId = req.params.proyectoId; 
  
    const query = 'DELETE FROM proyectos WHERE id_proyectos = ?';
    con.query(query, [proyectoId], (error, results) => {
      if (error) {
        console.error('Error al borrar los datos en la base de datos:', error);
        res.status(500).json({ mensaje: 'Error al borrar el proyecto' });
        return;
      }
      res.redirect('/proyectos-admin');
    });
  });

  
app.get("/admins", (req,res)=>{
  return res.render('admins');
})
app.get("/", (req, res)=>{
    return res.redirect('index.html')

}).listen(5000);
console.log('Escuchando el puerto 5000')