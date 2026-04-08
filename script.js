const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sab', 'Dom'];

let eventosPorFecha = {};

function mergeEventos(...fuentes) {
  const resultado = {};

  fuentes.forEach((fuente) => {
    Object.keys(fuente).forEach((fecha) => {
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

function sumarDias(fecha, dias) {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + dias);
  return nueva;
}

function obtenerLunesDeSemana(fecha) {
  const copia = new Date(fecha);
  const dia = copia.getDay();
  const diferencia = dia === 0 ? -6 : 1 - dia;

  copia.setDate(copia.getDate() + diferencia);
  copia.setHours(0, 0, 0, 0);

  return copia;
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

function obtenerEstadoSemana(lunesSemana) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const inicioSemana = new Date(lunesSemana);
  inicioSemana.setHours(0, 0, 0, 0);

  const finSemana = sumarDias(inicioSemana, 6);
  finSemana.setHours(0, 0, 0, 0);

  if (hoy >= inicioSemana && hoy <= finSemana) {
    return 'actual';
  }

  if (finSemana < hoy) {
    return 'pasada';
  }

  return 'futura';
}

function escaparHtml(texto) {
  if (!texto) return '';

  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function obtenerClaseMateria(evento) {
  const tipo = (evento.tipo || '').toLowerCase();
  const materia = (evento.materia || '').toLowerCase();

  if (tipo) {
    return tipo;
  }

  if (materia.includes('lógica')) return 'logica';
  if (materia.includes('base de datos')) return 'base-datos';
  if (materia.includes('análisis')) return 'analisis';
  if (materia.includes('técnicas')) return 'tecnicas';

  return '';
}

function obtenerClaseModo(evento) {
  const modoMinuscula = (evento.modo || '').toLowerCase();

  if (modoMinuscula.includes('asincr')) return 'asincronica';
  if (modoMinuscula.includes('presencial')) return 'presencial';
  if (modoMinuscula.includes('virtual')) return 'virtual';
  if (modoMinuscula.includes('feriado') || modoMinuscula.includes('parcial')) return 'especial';

  return '';
}

function crearEventoHTML(evento) {
  const claseMateria = obtenerClaseMateria(evento);
  const claseModo = obtenerClaseModo(evento);

  return `
    <article class='evento ${claseMateria}'>
      <h3>${escaparHtml(evento.materia || '')}</h3>
      ${evento.hora ? `<div class='hora'>${escaparHtml(evento.hora)}</div>` : ''}
      ${evento.modo ? `<div class='modo ${claseModo}'>${escaparHtml(evento.modo)}</div>` : ''}
      ${evento.detalle ? `<div class='detalle'>${escaparHtml(evento.detalle)}</div>` : ''}
      ${evento.meet ? `<a class='link' href='${evento.meet}' target='_blank' rel='noopener noreferrer'>Entrar al Meet</a>` : ''}
    </article>
  `;
}

function crearFilaSemana(lunesActual, numeroSemana) {
  const filas = [];

  const filaDias = document.createElement('tr');
  filaDias.className = 'fila-dias';

  const celdaSemanaDias = document.createElement('td');
  celdaSemanaDias.className = 'semana';
  celdaSemanaDias.rowSpan = 3;
  celdaSemanaDias.textContent = `Semana ${numeroSemana}`;
  filaDias.appendChild(celdaSemanaDias);

  for (let i = 0; i < 7; i += 1) {
    const td = document.createElement('td');
    td.textContent = diasSemana[i];
    filaDias.appendChild(td);
  }

  filas.push(filaDias);

  const filaFechas = document.createElement('tr');
  filaFechas.className = 'fila-fechas';

  let tieneCambioMes = false;

  for (let i = 0; i < 7; i += 1) {
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

  if (tieneCambioMes) {
    filaFechas.classList.add('mes-nuevo');
  }

  filas.push(filaFechas);

  const filaContenido = document.createElement('tr');
  filaContenido.className = 'fila-contenido';

  for (let i = 0; i < 7; i += 1) {
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
      td.classList.add('vacio');
    }

    td.appendChild(celda);
    filaContenido.appendChild(td);
  }

  filas.push(filaContenido);

  return filas;
}

function configurarBotonPasadas() {
  const boton = document.getElementById('togglePasadas');
  if (!boton) return;

  const filasPasadas = document.querySelectorAll('[data-estado-semana="pasada"]');
  let visibles = false;

  if (filasPasadas.length === 0) {
    boton.style.display = 'none';
    return;
  }

  boton.textContent = 'Ver semanas pasadas';

  boton.onclick = function () {
    visibles = !visibles;

    filasPasadas.forEach((fila) => {
      fila.classList.toggle('semana-pasada-oculta', !visibles);
    });

    boton.textContent = visibles ? 'Ocultar semanas pasadas' : 'Ver semanas pasadas';
  };
}

function generarTabla() {
  const tabla = document.getElementById('tablaHorario');
  tabla.innerHTML = '';

  const inicio = new Date('2026-03-23T00:00:00');
  const fin = new Date('2026-07-05T00:00:00');

  let lunesActual = obtenerLunesDeSemana(inicio);
  let numeroSemana = 1;

  const semanasPasadas = [];
  const semanasActualesOFuturas = [];

  while (lunesActual <= fin) {
    const estadoSemana = obtenerEstadoSemana(lunesActual);
    const filasSemana = crearFilaSemana(lunesActual, numeroSemana);

    filasSemana.forEach((fila) => {
      fila.dataset.estadoSemana = estadoSemana;
      fila.dataset.numeroSemana = numeroSemana;
    });

    if (estadoSemana === 'pasada') {
      semanasPasadas.push(...filasSemana);
    } else {
      semanasActualesOFuturas.push(...filasSemana);
    }

    lunesActual = sumarDias(lunesActual, 7);
    numeroSemana += 1;
  }

  semanasActualesOFuturas.forEach((fila) => {
    tabla.appendChild(fila);
  });

  semanasPasadas.forEach((fila) => {
    fila.classList.add('semana-pasada-oculta');
    tabla.appendChild(fila);
  });

  configurarBotonPasadas();
}

async function cargarEventos() {
  try {
    const [martes, jueves, miercoles, lunes, viernes] = await Promise.all([
      fetch('martes.json').then((res) => res.json()),
      fetch('jueves.json').then((res) => res.json()),
      fetch('miercoles.json').then((res) => res.json()),
      fetch('lunes.json').then((res) => res.json()),
      fetch('viernes.json').then((res) => res.json())
    ]);

    eventosPorFecha = mergeEventos(martes, jueves, miercoles, lunes, viernes);
    generarTabla();
  } catch (error) {
    console.error('Error al cargar los eventos:', error);

    const tabla = document.getElementById('tablaHorario');
    tabla.innerHTML = `
      <tr>
        <td style='padding: 16px; text-align: left;'>
          No se pudieron cargar los archivos JSON.
        </td>
      </tr>
    `;
  }
}

function actualizarTextoBotonTema() {
  const botonTema = document.getElementById('botonTema');
  if (!botonTema) return;

  const esOscuro = document.body.classList.contains('tema-oscuro');
  botonTema.textContent = esOscuro ? '☀️ Modo claro' : '🌙 Modo oscuro';
}

function aplicarTemaGuardado() {
  const temaGuardado = localStorage.getItem('tema');

  if (temaGuardado === 'oscuro') {
    document.body.classList.add('tema-oscuro');
  }

  actualizarTextoBotonTema();
}

function alternarTema() {
  document.body.classList.toggle('tema-oscuro');

  const temaActual = document.body.classList.contains('tema-oscuro') ? 'oscuro' : 'claro';
  localStorage.setItem('tema', temaActual);

  actualizarTextoBotonTema();
}

document.addEventListener('DOMContentLoaded', () => {
  aplicarTemaGuardado();

  const botonTema = document.getElementById('botonTema');
  if (botonTema) {
    botonTema.addEventListener('click', alternarTema);
  }

  cargarEventos();
});
