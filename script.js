
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sab', 'Dom'];
  
    function mergeEventos(...fuentes) {
    const resultado = {};

    fuentes.forEach(fuente => {
        Object.keys(fuente).forEach(fecha => {
        if (!resultado[fecha]) {
            resultado[fecha] = [];
        }
        resultado[fecha].push(...fuente[fecha]);
        });
    });

    return resultado;
    }

    function formatearFechaISO(fecha) {
      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      return `${anio}-${mes}-${dia}`;
    }
function obtenerEstadoFecha(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaComparar = new Date(fecha);
  fechaComparar.setHours(0, 0, 0, 0);

  if (fechaComparar.getTime() === hoy.getTime()) {
    return 'hoy';
  }

  if (fechaComparar < hoy) {
    return 'pasado';
  }

  return '';
}

    function crearEventoHTML(evento) {
      let claseModo = '';
      const modoMinuscula = (evento.modo || '').toLowerCase();
      if (modoMinuscula.includes('asincrónica')) claseModo = 'asincronica';
      if (modoMinuscula.includes('presencial')) claseModo = 'presencial';
      if (modoMinuscula.includes('virtual')) claseModo = 'virtual';
      if (modoMinuscula.includes('feriado') || modoMinuscula.includes('parcial')) claseModo = 'especial';

      return `
        <div class="evento ${evento.tipo}">
          <h3>${evento.materia}</h3>
          ${evento.hora ? `<div class="hora">${evento.hora}</div>` : ''}
          ${evento.modo ? `<div class="modo ${claseModo}">${evento.modo}</div>` : ''}
          ${evento.detalle ? `<div class="detalle">${evento.detalle}</div>` : ''}
          ${evento.meet ? `<a class="link" href="${evento.meet}" target="_blank">Entrar al Meet</a>` : ''}
        </div>
      `;
    }

    function obtenerLunesDeSemana(fecha) {
      const copia = new Date(fecha);
      const dia = copia.getDay();
      const diferencia = dia === 0 ? -6 : 1 - dia;
      copia.setDate(copia.getDate() + diferencia);
      copia.setHours(0, 0, 0, 0);
      return copia;
    }

    function sumarDias(fecha, dias) {
      const nueva = new Date(fecha);
      nueva.setDate(nueva.getDate() + dias);
      return nueva;
    }

    function generarTabla() {
      const tabla = document.getElementById('tablaHorario');

      const inicio = new Date('2026-03-23T00:00:00');
      const fin = new Date('2026-07-05T00:00:00');

      let lunesActual = obtenerLunesDeSemana(inicio);
      let numeroSemana = 1;

      while (lunesActual <= fin) {
        // fila días
        const filaDias = document.createElement('tr');
        filaDias.className = 'fila-dias';

        const celdaSemanaDias = document.createElement('td');
        celdaSemanaDias.className = 'semana';
        celdaSemanaDias.rowSpan = 3;
        celdaSemanaDias.textContent = `Semana ${numeroSemana}`;
        filaDias.appendChild(celdaSemanaDias);

        for (let i = 0; i < 7; i++) {
          const td = document.createElement('td');
          td.textContent = diasSemana[i];
          filaDias.appendChild(td);
        }
        tabla.appendChild(filaDias);

        // fila fechas
        const filaFechas = document.createElement('tr');
        filaFechas.className = 'fila-fechas';

        let tieneCambioMes = false;
        for (let i = 0; i < 7; i++) {
          const fecha = sumarDias(lunesActual, i);
          const td = document.createElement('td');
         const estadoFecha = obtenerEstadoFecha(fecha);
td.textContent = fecha.getDate();

if (estadoFecha) {
  td.classList.add(estadoFecha);
}
          filaFechas.appendChild(td);

          if (fecha.getDate() <= 7 && i >= 3) {
            tieneCambioMes = true;
          }
        }
        if (tieneCambioMes) filaFechas.classList.add('mes-nuevo');
        tabla.appendChild(filaFechas);

        // fila contenido
        const filaContenido = document.createElement('tr');
        filaContenido.className = 'fila-contenido';

        for (let i = 0; i < 7; i++) {
          const fecha = sumarDias(lunesActual, i);
          const iso = formatearFechaISO(fecha);
          const td = document.createElement('td');
            const estadoFecha = obtenerEstadoFecha(fecha);

if (estadoFecha) {
  td.classList.add(estadoFecha);
}
          const celda = document.createElement('div');
          celda.className = 'celda';

          const eventos = eventosPorFecha[iso] || [];
          if (eventos.length > 0) {
            celda.innerHTML = eventos.map(crearEventoHTML).join('');
          } else {
            celda.innerHTML = '';
            td.classList.add('vacio');
          }

          td.appendChild(celda);
          filaContenido.appendChild(td);
        }

        tabla.appendChild(filaContenido);

        lunesActual = sumarDias(lunesActual, 7);
        numeroSemana++;
      }
    }

let eventosPorFecha = {};

async function cargarEventos() {
  const [martes, jueves, miercoles, lunes, viernes] = await Promise.all([
    fetch('martes.json').then(res => res.json()),
    fetch('jueves.json').then(res => res.json()),
    fetch('miercoles.json').then(res => res.json()),
    fetch('lunes.json').then(res => res.json()),
    fetch('viernes.json').then(res => res.json())
  ]);

  // combinar todos los objetos
  eventosPorFecha = {
    ...martes,
    ...jueves,
    ...miercoles,
    ...lunes,
    ...viernes
  };

  generarTabla(); 
}

cargarEventos();
