// Obtener referencias a los elementos del DOM
const editarBtn = document.getElementById('editar-btn');
const editarDescripcionBtn = document.getElementById('editar-descripcion-btn');
const crearProyectoBtn = document.getElementById('crear-proyecto-btn');

// Habilitar la edición de la información personal al hacer clic en el botón "Editar"
editarBtn.addEventListener('click', () => {
  const camposPersonales = document.querySelectorAll('.datos-personales input');
  camposPersonales.forEach((campo) => campo.removeAttribute('disabled'));
});

// Habilitar la edición de la descripción al hacer clic en el botón "Editar Descripción"
editarDescripcionBtn.addEventListener('click', () => {
  const camposDescripcion = document.querySelectorAll('.descripcion textarea');
  camposDescripcion.forEach((campo) => campo.removeAttribute('disabled'));
});

// Lógica para crear un proyecto al hacer clic en el botón "Crear Proyecto"
crearProyectoBtn.addEventListener('click', () => {
  // Obtener los valores de los campos del proyecto
  const tituloProyecto = document.getElementById('titulo-proyecto').value;
  const descripcionProyecto = document.getElementById('descripcion-proyecto').value;
  // Aquí puedes implementar la lógica para guardar el proyecto en la base de datos
  // y realizar otras acciones necesarias
  console.log('Proyecto creado:');
  console.log('Título:', tituloProyecto);
  console.log('Descripción:', descripcionProyecto);
});
