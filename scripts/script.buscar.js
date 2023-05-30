// Obtener los elementos HTML relevantes
const inputBuscador = document.getElementById('buscador');
const btnBuscar = document.getElementById('btnBuscar');
const cards = document.getElementsByClassName('card');

// Función para filtrar las tarjetas según el nombre buscado
const filtrarTarjetas = () => {
  const nombreBuscado = inputBuscador.value.toLowerCase();

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const nombreTarjeta = card.querySelector('h3').textContent.toLowerCase();

    if (nombreTarjeta.includes(nombreBuscado)) {
      card.style.display = 'block'; // Mostrar tarjeta si coincide con el nombre buscado
    } else {
      card.style.display = 'none'; // Ocultar tarjeta si no coincide con el nombre buscado
    }
  }
};

// Agregar evento click al botón de búsqueda
btnBuscar.addEventListener('click', filtrarTarjetas);
