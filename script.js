// Cargar la malla desde malla.json al iniciar
fetch('malla.json')
  .then(res => res.json())
  .then(data => {
    window.mallaData = data;
    renderMalla(); // Dibuja la malla con el progreso guardado
  });

const mallaContainer = document.getElementById('malla');
const resetButton = document.getElementById('reset-btn');

// Cargar ramos aprobados del localStorage o iniciar un set vacío
let aprobadas = new Set(JSON.parse(localStorage.getItem('ramosAprobadosUNAB')) || []);

// Lógica del botón para limpiar el progreso
resetButton.addEventListener('click', () => {
  if (confirm('¿Estás seguro de que quieres limpiar todo tu progreso? Esta acción no se puede deshacer.')) {
    aprobadas.clear(); // Limpia el set de ramos aprobados
    localStorage.removeItem('ramosAprobadosUNAB'); // Borra el progreso guardado del navegador
    renderMalla(); // Vuelve a dibujar la malla desde cero
  }
});

// Función para guardar el progreso en el navegadort
function guardarProgreso() {
  localStorage.setItem('ramosAprobadosUNAB', JSON.stringify([...aprobadas]));
}

// Función principal que dibuja toda la malla
function renderMalla() {
  mallaContainer.innerHTML = '';
  window.mallaData.forEach(trimestre => {
    const divTrim = document.createElement('div');
    divTrim.classList.add('trimestre');
    
    const h2 = document.createElement('h2');
    h2.textContent = trimestre.trimestre;
    divTrim.appendChild(h2);

    trimestre.asignaturas.forEach(asig => {
      const divAsig = document.createElement('div');
      divAsig.classList.add('asignatura');
      
      const nombreAsignatura = document.createElement('span');
      nombreAsignatura.textContent = `${asig.nombre} (${asig.codigo})`;
      divAsig.appendChild(nombreAsignatura);

      const estaAprobada = aprobadas.has(asig.codigo);
      const puedeCursar = puedeDesbloquear(asig);

      if (estaAprobada) {
        divAsig.classList.add('aprobada');
      } else if (!puedeCursar) {
        divAsig.classList.add('bloqueado');
      }

      // Evento de clic en una asignatura
      divAsig.onclick = (event) => { // Recibe el 'event' del clic
        if (!puedeCursar && !estaAprobada) return; // No hacer nada si está bloqueado

        if (estaAprobada) {
          aprobadas.delete(asig.codigo); // Si ya estaba aprobada, la des-aprueba
        } else {
          aprobadas.add(asig.codigo); // Si no, la aprueba
          crearChispas(event.clientX, event.clientY); // Llama a la función de chispas
        }
        guardarProgreso(); // Guarda el cambio
        renderMalla(); // Vuelve a dibujar toda la malla para reflejar el nuevo estado
      };

      // Añadir tooltip de requisitos si existen
      if (asig.req && asig.req.length > 0) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = 'Req: ' + asig.req.join(', ');
        divAsig.appendChild(tooltip);
      }

      divTrim.appendChild(divAsig);
    });

    mallaContainer.appendChild(divTrim);
  });
}

// Función que revisa si los requisitos de un ramo están cumplidos
function puedeDesbloquear(asig) {
  if (!asig.req || asig.req.length === 0) {
    return true; // Si no tiene requisitos, siempre está desbloqueado
  }
  // Revisa si TODOS los códigos de requisito están en el set de 'aprobadas'
  return asig.req.every(r => aprobadas.has(r));
}

// Función para crear las chispas mágicas
function crearChispas(x, y) {
  const cantidadDeChispas = 15; // Puedes cambiar este número

  for (let i = 0; i < cantidadDeChispas; i++) {
    const chispa = document.createElement('div');
    chispa.classList.add('chispa');
    
    // Posiciona la chispa donde el usuario hizo clic
    chispa.style.left = `${x}px`;
    chispa.style.top = `${y}px`;

    // Calcula una posición final aleatoria para cada chispa
    const randomX = (Math.random() - 0.5) * 200; // Moverá entre -100px y 100px en horizontal
    const randomY = (Math.random() - 0.5) * 200; // Moverá entre -100px y 100px en vertical
    
    // Asigna las posiciones aleatorias a las variables de la animación CSS
    chispa.style.setProperty('--x', `${randomX}px`);
    chispa.style.setProperty('--y', `${randomY}px`);

    // Añade la chispa a la página
    document.body.appendChild(chispa);

    // Elimina la chispa del HTML después de que termine su animación
    setTimeout(() => {
      chispa.remove();
    }, 600); // 600 milisegundos, igual que la duración de la animación
  }

}
