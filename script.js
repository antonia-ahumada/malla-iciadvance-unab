// Cargar la malla desde malla.json
fetch('malla.json')
  .then(res => res.json())
  .then(data => {
    window.mallaData = data;
    renderMalla(data);
  });

const mallaContainer = document.getElementById('malla');

const aprobadas = new Set();

function renderMalla(data) {
  mallaContainer.innerHTML = '';
  data.forEach(trimestre => {
    const divTrim = document.createElement('div');
    divTrim.classList.add('trimestre');
    const h2 = document.createElement('h2');
    h2.textContent = trimestre.trimestre;
    divTrim.appendChild(h2);

    trimestre.asignaturas.forEach(asig => {
      const divAsig = document.createElement('div');
      divAsig.classList.add('asignatura');

      divAsig.textContent = `${asig.nombre} (${asig.codigo})`;

      // Estado inicial
      if (puedeDesbloquear(asig)) {
        divAsig.classList.remove('bloqueado');
      } else {
        divAsig.classList.add('bloqueado');
      }

      if (aprobadas.has(asig.codigo)) {
        divAsig.classList.add('aprobada');
        divAsig.classList.remove('bloqueado');
      }

      divAsig.onclick = () => {
        if (divAsig.classList.contains('bloqueado')) return;
        if (aprobadas.has(asig.codigo)) {
          aprobadas.delete(asig.codigo);
          divAsig.classList.remove('aprobada');
          desbloquearMalla();
        } else {
          aprobadas.add(asig.codigo);
          divAsig.classList.add('aprobada');
          desbloquearMalla();
        }
      };

      if (asig.req && asig.req.length > 0) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = 'Requisitos: ' + asig.req.join(', ');
        divAsig.appendChild(tooltip);
      }

      divTrim.appendChild(divAsig);
    });

    mallaContainer.appendChild(divTrim);
  });
}

// Función para verificar si una asignatura puede desbloquearse
function puedeDesbloquear(asig) {
  if (!asig.req || asig.req.length === 0) return true;
  return asig.req.every(r => aprobadas.has(r));
}

function desbloquearMalla() {
  // Re-render para actualizar estados
  renderMalla(window.mallaData);
}
