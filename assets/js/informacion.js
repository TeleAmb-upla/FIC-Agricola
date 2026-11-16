/* ==========================================================================
   ¿Cómo se muestra la información?  ·  Explorador interactivo
   --------------------------------------------------------------------------
   3 vistas:  1) Priorización (dashboard)  2) Series de tiempo (SVG vectorial)
              3) Distribución espacial (mapa Leaflet alimentado por GeoJSON)

   >>> Para cargar el GeoJSON real del cuartel, copia el archivo en:
   >>>    assets/data/cuartel.geojson
   >>> (ver assets/data/README.txt para el formato esperado).
   ========================================================================== */
(function () {
  'use strict';

  var root = document.getElementById('infoExplorer');
  if (!root) return;

  /* ---------------- Configuración del mapa / GeoJSON ---------------- */
  var GEOJSON_URL = './assets/data/cuartel.geojson';
  // Propiedades candidatas (se usa la primera que exista en el archivo)
  var VALUE_PROPS = ['ndvi', 'evi', 'savi', 'ndre', 'ndwi', 'ndmi', 'valor', 'value', 'indice', 'mean', 'media'];
  var NAME_PROPS = ['cuartel', 'nombre', 'name', 'Name', 'id_cuartel', 'cod_cuartel', 'codigo', 'id', 'ID'];
  var SECTOR_PROPS = ['sector', 'zona', 'id_sector'];
  var RAMP = ['#d7191c', '#fdae61', '#ffffbf', '#a6d96a', '#1a9641'];

  /* ---------------- Contenido de las guías ---------------- */
  var ITEMS = {
    prioridad: [
      { short: 'Resumen', t: 'Resumen de tu cartera', d: 'Cuatro cifras para dimensionar el trabajo: <strong>agricultores, predios, cuarteles y cultivos</strong> que estás monitoreando.' },
      { short: 'Agrupar', t: 'Agrupa a tu manera', d: 'Cambia entre <strong>Predios</strong>, <strong>Agricultores</strong> y <strong>Comunas</strong> para ver la misma información agrupada de distinta forma.' },
      { short: 'Buscar', t: 'Busca rápido', d: 'Escribe el nombre de un agricultor, un predio o un código para ubicarlo de inmediato.' },
      { short: 'Semana', t: 'Semana de referencia', d: 'Semana ISO (en el ejemplo, <strong>W44</strong>) con su rango de fechas. Todos los valores de la tabla corresponden a esa semana.' },
      { short: 'Predio', t: 'Qué predio es', d: '<strong>Predio, agricultor y comuna</strong>. Puedes ordenar cualquier columna con las flechas ↑↓ del encabezado.' },
      { short: 'Tamaño', t: 'Cuánto abarca', d: '<strong>Cuarteles, cultivos y superficie (ha)</strong> de cada predio, para dimensionarlo de un vistazo.' },
      { short: 'NDVI', t: 'Cómo está esta semana', d: 'Valor del <strong>NDVI</strong> de la semana: a mayor valor, mayor vigor de la vegetación.' },
      { short: 'Δ Hist', t: 'Cómo cambió frente al historial', d: '<strong>Δ Hist</strong> compara el NDVI de esta semana con su historial. Una flecha hacia arriba indica un valor sobre lo habitual; hacia abajo, bajo lo habitual.' },
      { short: 'Detalle', t: 'Entra al detalle', d: 'Desde cada fila puedes abrir el detalle del predio para revisar sus cuarteles, gráficos y mapas.' }
    ],
    series: [
      { short: 'Eje Y', t: 'Métrica (eje Y)', d: 'Muestra el valor de la métrica del índice espectral seleccionado. En este ejemplo, el <strong>EVI</strong>.' },
      { short: 'Eje X', t: 'Semana ISO (eje X)', d: 'Muestra la evaluación anual por semana, según el estándar ISO, desde la semana 1 hasta la 53.' },
      { short: 'Cuarteles', t: 'Líneas por cuartel', d: 'Cada línea de color representa un cuartel seleccionado. En este ejemplo: <strong>C00105, C00106 y C00107</strong>.' },
      { short: 'Pares', t: 'Línea de comparación (Pares)', d: 'Representa el comportamiento habitual del grupo de comparación, formado por cuarteles similares de la misma zona.' },
      { short: 'Banda P05–P95', t: 'Banda P05–P95', d: 'Área gris que representa el <strong>rango habitual de variación</strong> del grupo de comparación: entre el percentil 5 y el percentil 95. El 90 % de los cuarteles similares está dentro de este rango.' },
      { short: 'Semana', t: 'Semana seleccionada', d: 'Marca la semana que se está consultando. En el ejemplo, <strong>S41 (5/Oct/2026 – 11/Oct/2026)</strong>.' },
      { short: 'Sin datos', t: 'Semanas sin información', d: 'Semanas sin información en la base comparativa, usualmente por presencia de nubes.', note: '<strong>Nota importante:</strong> la ausencia de datos en un cuartel o en su base comparativa suele deberse a la presencia de nubes.' },
      { short: 'Leyenda', t: 'Leyenda', d: 'Identifica el significado de cada línea y elemento comparativo del gráfico. En este ejemplo: <strong>C00105, C00106 y C00107</strong>; <strong>Pares</strong> y <strong>P05–P95 Pares</strong>.' },
      { short: 'Controles', t: 'Controles del gráfico', d: '<strong>Vista activa:</strong> indica la vista del gráfico que se está mostrando.<br><strong>Cambiar modo de visualización:</strong> alterna la forma de presentar los datos.<br><strong>Interpretación del gráfico:</strong> ayuda para leer correctamente el gráfico.' }
    ],
    mapa: [
      { short: 'Cuartel', t: 'El cuartel y sus sectores', d: 'Cada polígono es un cuartel (o un sector dentro de él). Muestra, <strong>dentro del cuartel</strong>, la información de interés para ubicar zonas que requieren atención.' },
      { short: 'Color', t: 'El color es el valor del índice', d: 'La leyenda explica los colores: del <strong>valor más bajo</strong> (rojo) al <strong>más alto</strong> (verde). Los contrastes dentro del cuartel indican sectores distintos.' },
      { short: 'Detalle', t: 'Información al instante', d: 'Pasa el cursor o toca un sector: aquí aparece su <strong>nombre y el valor del índice</strong>.' },
      { short: 'Vista', t: 'Zoom y capas', d: 'Acerca o aleja el mapa y cambia entre <strong>imagen satelital</strong> y <strong>mapa de calles</strong> para ubicarte en terreno.' }
    ]
  };

  /* ---------------- Utilidades de guía ---------------- */
  function Guide(panel, key, onChange) {
    var items = ITEMS[key], cur = -1;
    var box = panel.querySelector('[data-guide]');
    var pills = items.map(function (it, i) {
      return '<button type="button" class="gd-pill" data-i="' + i + '" aria-label="' + (i + 1) + '. ' + it.t + '"><b>' + (i + 1) + '</b><span>' + it.short + '</span></button>';
    }).join('');
    box.innerHTML =
      '<div class="gd-pills" role="group" aria-label="Elementos de la vista">' + pills + '</div>' +
      '<div class="gd-card" aria-live="polite">' +
        '<div class="gd-badge"></div>' +
        '<div class="gd-body"><h4></h4><p></p><div class="gd-note" hidden></div></div>' +
        '<div class="gd-nav"><span class="gd-count"></span>' +
          '<div><button type="button" class="gd-arrow" data-dir="-1" aria-label="Anterior"><i class="bi bi-arrow-left"></i></button>' +
          '<button type="button" class="gd-arrow" data-dir="1" aria-label="Siguiente"><i class="bi bi-arrow-right"></i></button></div></div>' +
      '</div>';
    var card = box.querySelector('.gd-card'),
        badge = box.querySelector('.gd-badge'),
        h4 = box.querySelector('h4'),
        p = box.querySelector('.gd-body p'),
        note = box.querySelector('.gd-note'),
        count = box.querySelector('.gd-count'),
        pillEls = box.querySelectorAll('.gd-pill');

    function select(i, silent) {
      if (i < 0) i = items.length - 1;
      if (i >= items.length) i = 0;
      if (i === cur) return;
      cur = i;
      var it = items[i];
      badge.textContent = i + 1;
      h4.textContent = it.t;
      p.innerHTML = it.d;
      if (it.note) { note.innerHTML = it.note; note.hidden = false; } else { note.hidden = true; }
      count.textContent = (i + 1) + ' de ' + items.length;
      Array.prototype.forEach.call(pillEls, function (b, k) {
        b.classList.toggle('is-active', k === i);
        b.setAttribute('aria-pressed', k === i ? 'true' : 'false');
      });
      Array.prototype.forEach.call(panel.querySelectorAll('[data-hs]'), function (el) {
        el.classList.toggle('is-active', +el.getAttribute('data-hs') === i);
      });
      card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
      if (onChange && !silent) onChange(i);
    }

    box.addEventListener('click', function (e) {
      var pill = e.target.closest('.gd-pill');
      if (pill) { select(+pill.getAttribute('data-i')); return; }
      var ar = e.target.closest('.gd-arrow');
      if (ar) select(cur + (+ar.getAttribute('data-dir')));
    });
    box.addEventListener('keydown', function (e) {
      var pill = e.target.closest('.gd-pill');
      if (!pill || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
      e.preventDefault();
      var n = cur + (e.key === 'ArrowRight' ? 1 : -1);
      select(n);
      var el = box.querySelectorAll('.gd-pill')[cur]; if (el) el.focus();
    });
    // Clic en números sobre la figura
    panel.querySelector('[data-stage]').addEventListener('click', function (e) {
      var t = e.target.closest('[data-hs]');
      if (t) select(+t.getAttribute('data-hs'));
    });
    panel.querySelector('[data-stage]').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var t = e.target.closest('[data-hs]');
      if (t && t.getAttribute('role') === 'button') { e.preventDefault(); select(+t.getAttribute('data-hs')); }
    });
    return { select: select, current: function () { return cur; } };
  }

  /* ======================================================================
     1) PRIORIZACIÓN — captura del dashboard con zonas numeradas
     ====================================================================== */
  function initPrioridad(panel) {
    // [left, top, width, height, posición del número]  (en % de la imagen)
    var Z = [
      [1.2, 10.8, 97.7, 18.4, 'tl'],
      [1.6, 32.2, 22.2, 7.0, 'tl'],
      [2.7, 46.4, 40.6, 6.9, 'tl'],
      [83.8, 56.5, 14.6, 10.6, 'tl'],
      [2.7, 70.0, 40.6, 30.0, 'tl'],
      [45.6, 70.0, 32.8, 30.0, 'tc'],
      [78.9, 70.0, 7.2, 30.0, 'tc'],
      [86.9, 70.0, 7.2, 30.0, 'tc'],
      [94.4, 70.0, 3.0, 30.0, 'tc']
    ];
    var html = '<div class="scroller"><div class="shot"><img src="./assets/img/metodologia/dashboard_priorizacion.png" alt="Dashboard de la plataforma: resumen de agricultores, predios, cuarteles y cultivos, y tabla de priorización de predios" width="1496" height="674" decoding="async">';
    Z.forEach(function (z, i) {
      html += '<button type="button" class="hs" data-hs="' + i + '" aria-label="' + (i + 1) + '. ' + ITEMS.prioridad[i].t + '" style="left:' + z[0] + '%;top:' + z[1] + '%;width:' + z[2] + '%;height:' + z[3] + '%">' +
              '<span class="hs-pin p-' + z[4] + '">' + (i + 1) + '</span></button>';
    });
    html += '</div></div><p class="ex-hint"><i class="bi bi-hand-index-thumb"></i> <span>Toca los números sobre la imagen o usa los botones de abajo.<em class="m-only"> Desliza la imagen para verla completa.</em></span></p>';
    panel.querySelector('[data-stage]').innerHTML = html;
    return Guide(panel, 'prioridad');
  }

  /* ======================================================================
     2) SERIES DE TIEMPO — gráfico vectorial (SVG)
     ====================================================================== */
  function initSeries(panel) {
    var W = 1000, H = 548, L = 82, R = 962, T = 122, B = 424, WK = 53, YMIN = 0.1, YMAX = 0.7;
    function X(w) { return L + (w - 1) / (WK - 1) * (R - L); }
    function Y(v) { return B - (v - YMIN) / (YMAX - YMIN) * (B - T); }

    var KEY = {
      c1: [[1,.47],[3,.45],[4,.44],[5,.46],[6,.44],[7,.43],[8,.45],[9,.42],[10,.40],[11,.39],[12,.37],[13,.40],[14,.40],[15,.37],[16,.31],[17,.27],[18,.29],[19,.22],[20,.18],[22,.16],[25,.15],[28,.14],[31,.14],[34,.16],[36,.17],[37,.16],[38,.18],[39,.22],[40,.28],[41,.38],[42,.45]],
      c2: [[1,.55],[3,.52],[4,.53],[5,.52],[6,.50],[7,.49],[8,.51],[9,.50],[10,.47],[11,.46],[13,.46],[14,.44],[15,.38],[16,.33],[17,.28],[18,.30],[19,.24],[20,.19],[22,.16],[25,.15],[28,.14],[31,.14],[34,.16],[36,.19],[37,.16],[38,.18],[39,.22],[40,.26],[41,.32],[42,.38]],
      c3: [[1,.64],[3,.63],[4,.61],[5,.60],[6,.61],[7,.59],[8,.60],[9,.56],[10,.53],[11,.51],[12,.52],[13,.52],[14,.50],[15,.45],[16,.37],[17,.27],[18,.41],[19,.30],[20,.20],[21,.17],[22,.16],[25,.15],[28,.14],[31,.14],[34,.16],[36,.20],[37,.16],[38,.17],[39,.20],[40,.26],[41,.33],[42,.39]],
      par: [[1,.52],[3,.505],[5,.50],[7,.49],[9,.47],[11,.44],[13,.43],[15,.37],[16,.31],[17,.27],[18,.29],[19,.23],[20,.19],[22,.165],[25,.15],[28,.14],[31,.14],[34,.16],[36,.18],[37,.165]],
      hw: [[1,.085],[5,.08],[10,.055],[14,.06],[16,.05],[17,.035],[19,.05],[20,.03],[22,.015],[28,.01],[37,.012]]
    };
    function interp(arr, w) {
      if (w < arr[0][0] || w > arr[arr.length - 1][0]) return null;
      for (var i = 0; i < arr.length - 1; i++) {
        var a = arr[i], b = arr[i + 1];
        if (w >= a[0] && w <= b[0]) return a[1] + (b[1] - a[1]) * (w - a[0]) / (b[0] - a[0]);
      }
      return null;
    }
    function series(key, from, to) {
      var out = [];
      for (var w = from; w <= to; w++) { var v = interp(KEY[key], w); if (v !== null) out.push([w, v]); }
      return out;
    }
    function smooth(pts) {            // Catmull-Rom → Bézier
      if (!pts.length) return '';
      var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
      for (var i = 0; i < pts.length - 1; i++) {
        var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ',' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
                   (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ',' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' +
                   p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
      }
      return d;
    }
    function toXY(s, off) { return s.map(function (q) { return [X(q[0]), Y(q[1] + (off || 0))]; }); }

    var C1 = '#2f7be0', C2 = '#f29b1d', C3 = '#1fa457', PAR = '#5b6b7b';
    var wk = series('c1', 1, 42), s1 = toXY(wk), s2 = toXY(series('c2', 1, 42)), s3 = toXY(series('c3', 1, 42));
    var par = series('par', 1, 37);
    var parXY = toXY(par);
    // banda P05–P95
    var hw = par.map(function (q) { return [q[0], interp(KEY.hw, q[0])]; });
    var up = par.map(function (q, i) { return [X(q[0]), Y(q[1] + hw[i][1])]; });
    var lo = par.map(function (q, i) { return [X(q[0]), Y(q[1] - hw[i][1])]; }).reverse();
    var bandPath = smooth(up) + 'L' + lo[0][0].toFixed(1) + ',' + lo[0][1].toFixed(1) + smooth(lo).replace(/^M[^C]+/, '') + 'Z';

    var g = '';
    // rejilla
    var yt = [], v;
    for (v = 0.1; v <= 0.701; v += 0.1) yt.push(v);
    yt.forEach(function (t) { g += '<line class="grid" x1="' + L + '" x2="' + R + '" y1="' + Y(t).toFixed(1) + '" y2="' + Y(t).toFixed(1) + '"/>'; });
    // etiquetas eje Y
    g += '<g class="fx" data-k="y">';
    yt.forEach(function (t) { g += '<text class="tick" x="' + (L - 12) + '" y="' + (Y(t) + 4).toFixed(1) + '" text-anchor="end">' + t.toFixed(2) + '</text>'; });
    g += '<text class="axis-title" transform="translate(22 ' + ((T + B) / 2) + ') rotate(-90)" text-anchor="middle">EVI</text></g>';
    // etiquetas eje X
    g += '<g class="fx" data-k="x">';
    for (var w = 1; w <= WK; w += 4) {
      g += '<line class="tickline" x1="' + X(w).toFixed(1) + '" x2="' + X(w).toFixed(1) + '" y1="' + B + '" y2="' + (B + 6) + '"/>' +
           '<text class="tick" x="' + X(w).toFixed(1) + '" y="' + (B + 24) + '" text-anchor="middle">' + w + '</text>';
    }
    g += '<text class="axis-title" x="' + ((L + R) / 2) + '" y="' + (B + 52) + '" text-anchor="middle">Semana ISO</text></g>';
    g += '<line class="axis" x1="' + L + '" x2="' + R + '" y1="' + B + '" y2="' + B + '"/>';

    // semanas sin información (comparación)
    var gx1 = X(37.6), gx2 = X(42.4);
    g += '<g class="fx" data-k="gap"><rect class="gap" x="' + gx1.toFixed(1) + '" y="' + T + '" width="' + (gx2 - gx1).toFixed(1) + '" height="' + (B - T) + '" rx="6"/>' +
         '<text class="gap-label" x="' + ((gx1 + gx2) / 2).toFixed(1) + '" y="' + (T + 22) + '" text-anchor="middle">sin datos de</text><text class="gap-label" x="' + ((gx1 + gx2) / 2).toFixed(1) + '" y="' + (T + 36) + '" text-anchor="middle">comparación</text></g>';
    // semana seleccionada
    var sx = X(41);
    g += '<g class="fx" data-k="week"><rect class="week-band" x="' + (sx - 7).toFixed(1) + '" y="' + T + '" width="14" height="' + (B - T) + '" rx="4"/>' +
         '<line class="week-line" x1="' + sx.toFixed(1) + '" x2="' + sx.toFixed(1) + '" y1="' + (T - 6) + '" y2="' + B + '"/>' +
         '<rect class="week-tag" x="' + (sx - 20).toFixed(1) + '" y="' + (T - 28) + '" width="40" height="22" rx="11"/>' +
         '<text class="week-tag-t" x="' + sx.toFixed(1) + '" y="' + (T - 13) + '" text-anchor="middle">S41</text></g>';
    // banda y comparación
    g += '<g class="fx" data-k="band"><path class="band" d="' + bandPath + '"/></g>';
    g += '<g class="fx" data-k="pares"><path class="pares" d="' + smooth(parXY) + '"/></g>';
    // líneas de cuartel
    g += '<g class="fx" data-k="lines">' +
         '<path class="ln" stroke="' + C1 + '" d="' + smooth(s1) + '"/>' +
         '<path class="ln" stroke="' + C2 + '" d="' + smooth(s2) + '"/>' +
         '<path class="ln" stroke="' + C3 + '" d="' + smooth(s3) + '"/>' +
         '<circle cx="' + s1[s1.length - 1][0].toFixed(1) + '" cy="' + s1[s1.length - 1][1].toFixed(1) + '" r="4.5" fill="' + C1 + '"/>' +
         '<circle cx="' + s2[s2.length - 1][0].toFixed(1) + '" cy="' + s2[s2.length - 1][1].toFixed(1) + '" r="4.5" fill="' + C2 + '"/>' +
         '<circle cx="' + s3[s3.length - 1][0].toFixed(1) + '" cy="' + s3[s3.length - 1][1].toFixed(1) + '" r="4.5" fill="' + C3 + '"/></g>';

    // Título
    g += '<text class="chart-title" x="' + L + '" y="50">Serie de tiempo · EVI</text>' +
         '<text class="chart-sub" x="' + L + '" y="76">S41 (5/Oct/2026 – 11/Oct/2026)</text>';
    // Controles (arriba a la derecha)
    g += '<g class="fx" data-k="ctrl">' +
         '<rect class="ctl on" x="584" y="32" width="110" height="34" rx="17"/><circle cx="604" cy="49" r="4" fill="#fff"/><text class="ctl-t on" x="616" y="53.5">Vista activa</text>' +
         '<rect class="ctl" x="704" y="32" width="136" height="34" rx="17"/><text class="ctl-t" x="722" y="53.5">⇄  Cambiar modo</text>' +
         '<rect class="ctl" x="850" y="32" width="112" height="34" rx="17"/><text class="ctl-t" x="866" y="53.5">ⓘ  Interpretar</text></g>';
    // Leyenda
    var ly = B + 96, lx = L;
    g += '<g class="fx" data-k="legend"><rect class="legend-bg" x="' + (lx - 12) + '" y="' + (ly - 22) + '" width="' + (R - L + 24) + '" height="36" rx="18"/>';
    var leg = [['C00105', C1, 'ln'], ['C00106', C2, 'ln'], ['C00107', C3, 'ln'], ['Pares', PAR, 'dash'], ['P05–P95 Pares', '', 'band']];
    var cx = lx + 18;
    leg.forEach(function (e) {
      if (e[2] === 'ln') g += '<line x1="' + cx + '" x2="' + (cx + 28) + '" y1="' + (ly - 4) + '" y2="' + (ly - 4) + '" stroke="' + e[1] + '" stroke-width="3.5" stroke-linecap="round"/>';
      else if (e[2] === 'dash') g += '<line x1="' + cx + '" x2="' + (cx + 28) + '" y1="' + (ly - 4) + '" y2="' + (ly - 4) + '" stroke="' + e[1] + '" stroke-width="2.5" stroke-dasharray="5 4"/>';
      else g += '<rect class="band" x="' + cx + '" y="' + (ly - 12) + '" width="28" height="16" rx="3"/>';
      g += '<text class="leg-t" x="' + (cx + 38) + '" y="' + ly + '">' + e[0] + '</text>';
      cx += 38 + e[0].length * 8.2 + 34;
    });
    g += '</g>';

    // Zona interactiva (tooltip al pasar el cursor)
    g += '<rect class="hover-zone" x="' + L + '" y="' + T + '" width="' + (R - L) + '" height="' + (B - T) + '"/>';
    g += '<g class="tip" visibility="hidden"><line class="tip-line" y1="' + T + '" y2="' + B + '"/><g class="tip-box"><rect rx="10" width="170" height="104"/>' +
         '<text class="tip-h" x="12" y="22"></text>' +
         '<text class="tip-r" x="12" y="42"></text><text class="tip-r" x="12" y="60"></text><text class="tip-r" x="12" y="78"></text><text class="tip-r" x="12" y="96"></text></g></g>';

    // Números (con línea guía hacia el elemento)
    var pins = [
      /* 0 */ { x: 28, y: 96, tx: L - 6, ty: Y(0.62) },
      /* 1 */ { x: (L + R) / 2 + 92, y: B + 48, tx: (L + R) / 2 + 54, ty: B + 48 },
      /* 2 */ { x: X(18), y: 100, tx: X(18), ty: Y(0.41) },
      /* 3 */ { x: X(11), y: 100, tx: X(11), ty: Y(0.44) },
      /* 4 */ { x: X(5), y: 100, tx: X(5), ty: Y(0.58) },
      /* 5 */ { x: sx + 52, y: T - 17, tx: sx + 20, ty: T - 17 },
      /* 6 */ { x: X(47), y: Y(0.36), tx: gx2, ty: Y(0.36) },
      /* 7 */ { x: L - 40, y: ly - 4, tx: lx - 12, ty: ly - 4 },
      /* 8 */ { x: 556, y: 49, tx: 584, ty: 49 }
    ];
    pins.forEach(function (p, i) {
      g += '<g class="pin" data-hs="' + i + '" role="button" tabindex="0" aria-label="' + (i + 1) + '. ' + ITEMS.series[i].t + '">' +
           '<line class="leader" x1="' + p.x + '" y1="' + p.y + '" x2="' + p.tx.toFixed(1) + '" y2="' + p.ty.toFixed(1) + '"/>' +
           '<circle class="leader-dot" cx="' + p.tx.toFixed(1) + '" cy="' + p.ty.toFixed(1) + '" r="3"/>' +
           '<circle class="pin-ring" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="14"/>' +
           '<circle class="pin-c" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="14"/>' +
           '<text x="' + p.x.toFixed(1) + '" y="' + p.y.toFixed(1) + '">' + (i + 1) + '</text></g>';
    });

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="chartT chartD">' +
              '<title id="chartT">Serie de tiempo del índice EVI por semana ISO</title>' +
              '<desc id="chartD">Tres cuarteles comparados con el grupo de pares y su banda de variación P05–P95. Semana seleccionada: S41.</desc>' +
              '<defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#fff6e5"/><line x1="0" y1="0" x2="0" y2="8" stroke="#f5c36b" stroke-width="2"/></pattern></defs>' +
              g + '</svg>';

    var stage = panel.querySelector('[data-stage]');
    stage.innerHTML = '<div class="scroller"><div class="chart focusing">' + svg + '</div></div><p class="ex-hint"><i class="bi bi-hand-index-thumb"></i> <span>Toca los números del gráfico o pasa el cursor sobre las semanas para ver los valores.<em class="m-only"> Desliza el gráfico para verlo completo.</em></span></p>';

    var chart = stage.querySelector('.chart');
    var FOCUS = [['y'], ['x'], ['lines'], ['pares'], ['band'], ['week'], ['gap'], ['legend'], ['ctrl']];
    function focusOn(i) {
      var keys = FOCUS[i];
      Array.prototype.forEach.call(chart.querySelectorAll('.fx'), function (el) {
        el.classList.toggle('is-on', keys.indexOf(el.getAttribute('data-k')) > -1);
      });
    }

    // Tooltip
    var svgEl = chart.querySelector('svg'), zone = chart.querySelector('.hover-zone'), tip = chart.querySelector('.tip'),
        tipLine = chart.querySelector('.tip-line'), tipBox = chart.querySelector('.tip-box'), tipRows = chart.querySelectorAll('.tip-h, .tip-r');
    function fmt(vv) { return vv === null || vv === undefined ? '—' : vv.toFixed(3); }
    function move(ev) {
      var r = svgEl.getBoundingClientRect();
      var px = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) * (W / r.width);
      var w = Math.max(1, Math.min(42, Math.round(1 + (px - L) / (R - L) * (WK - 1))));
      var x = X(w);
      tipLine.setAttribute('x1', x); tipLine.setAttribute('x2', x);
      tipRows[0].textContent = 'Semana S' + w;
      var rows = [['C00105', interp(KEY.c1, w), C1], ['C00106', interp(KEY.c2, w), C2], ['C00107', interp(KEY.c3, w), C3], ['Pares', interp(KEY.par, w), '#cfd9e2']];
      rows.forEach(function (rw, k) { tipRows[k + 1].textContent = rw[0] + ':  ' + fmt(rw[1]); tipRows[k + 1].setAttribute('fill', rw[2]); });
      var bx = x + 14; if (bx + 170 > R + 20) bx = x - 184;
      tipBox.setAttribute('transform', 'translate(' + bx + ' ' + (T + 8) + ')');
      tip.setAttribute('visibility', 'visible');
    }
    zone.addEventListener('mousemove', move);
    zone.addEventListener('touchstart', move, { passive: true });
    zone.addEventListener('touchmove', move, { passive: true });
    zone.addEventListener('mouseleave', function () { tip.setAttribute('visibility', 'hidden'); });

    return Guide(panel, 'series', focusOn);
  }

  /* ======================================================================
     3) DISTRIBUCIÓN ESPACIAL — Leaflet + GeoJSON
     ====================================================================== */
  function initMapa(panel) {
    var stage = panel.querySelector('[data-stage]');
    stage.innerHTML =
      '<div class="map-wrap">' +
        '<div id="infoMap" aria-label="Mapa del cuartel con el índice espectral"></div>' +
        '<span class="map-tag" id="mapTag" hidden><i class="bi bi-info-circle"></i> Datos de ejemplo</span>' +
        '<span class="map-ring ring-zoom" data-hs="3"></span>' +
        '<span class="map-ring ring-layers" data-hs="3"><span class="hs-pin" data-hs="3" role="button" tabindex="0" aria-label="4. Zoom y capas">4</span></span>' +
        '<div class="map-ui map-legend" data-hs="1"><span class="hs-pin" data-hs="1" role="button" tabindex="0" aria-label="2. Color">2</span>' +
          '<div class="lg-title" id="lgTitle">Índice</div><div class="lg-bar" id="lgBar"></div>' +
          '<div class="lg-scale"><span id="lgMin">0</span><span id="lgMid"></span><span id="lgMax">1</span></div></div>' +
        '<div class="map-ui map-info" data-hs="2"><span class="hs-pin" data-hs="2" role="button" tabindex="0" aria-label="3. Detalle">3</span>' +
          '<div id="mapInfo"><span class="mi-empty"><i class="bi bi-cursor"></i> Pasa el cursor o toca un sector para ver su detalle.</span></div></div>' +
      '</div>' +
      '<p class="ex-hint"><i class="bi bi-hand-index-thumb"></i> Explora el mapa: haz clic en un sector y usa los números para entender cada elemento.</p>';

    var guide = Guide(panel, 'mapa', function (i) {
      if (geoLayer) geoLayer.setStyle(i === 0 ? { weight: 3, color: '#ffffff' } : baseStyle());
    });

    guide.select(0, true);
    var map = null, geoLayer = null, vmin = 0, vmax = 1, valueProp = null, nameProp = null, sectorProp = null, indexLabel = 'Índice', loaded = false;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
    function color(v) {
      if (v === null || isNaN(v)) return '#9aa7b3';
      var t = Math.max(0, Math.min(1, (v - vmin) / (vmax - vmin || 1)));
      var s = t * (RAMP.length - 1), i = Math.min(RAMP.length - 2, Math.floor(s)), f = s - i;
      var a = hex(RAMP[i]), b = hex(RAMP[i + 1]);
      return 'rgb(' + Math.round(lerp(a[0], b[0], f)) + ',' + Math.round(lerp(a[1], b[1], f)) + ',' + Math.round(lerp(a[2], b[2], f)) + ')';
    }
    function baseStyle() { return { weight: 1.2, color: 'rgba(255,255,255,.85)', fillOpacity: .78 }; }
    function pick(props, list) { for (var i = 0; i < list.length; i++) if (props && props[list[i]] !== undefined && props[list[i]] !== null) return list[i]; return null; }
    function fnum(v) { return typeof v === 'number' ? (Math.abs(v) < 10 ? v.toFixed(3) : v.toFixed(1)) : v; }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    /* Datos de ejemplo (se usan solo si aún no existe assets/data/cuartel.geojson) */
    function demoGeoJSON() {
      var lat0 = -32.7918, lon0 = -70.8350, nx = 12, ny = 7, cw = 24, ch = 24, ang = 18 * Math.PI / 180, feats = [];
      function pt(i, j) {
        var x = (i - nx / 2) * cw, y = (j - ny / 2) * ch;
        var xr = x * Math.cos(ang) - y * Math.sin(ang), yr = x * Math.sin(ang) + y * Math.cos(ang);
        return [lon0 + xr * 1.07e-5, lat0 + yr * 9e-6];
      }
      for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) {
        var v = 0.52 + 0.22 * Math.sin(i / 2.6) * Math.cos(j / 2.1) + 0.12 * (i / nx) - 0.18 * Math.exp(-(Math.pow(i - 8, 2) + Math.pow(j - 4, 2)) / 6);
        feats.push({ type: 'Feature', properties: { cuartel: 'C00105', sector: 'S' + (i + 1) + '-' + (j + 1), ndvi: Math.max(0.12, Math.min(0.88, v)) },
          geometry: { type: 'Polygon', coordinates: [[pt(i, j), pt(i + 1, j), pt(i + 1, j + 1), pt(i, j + 1), pt(i, j)]] } });
      }
      return { type: 'FeatureCollection', features: feats };
    }

    function setInfo(props) {
      var el = document.getElementById('mapInfo');
      if (!props) { el.innerHTML = '<span class="mi-empty"><i class="bi bi-cursor"></i> Pasa el cursor o toca un sector para ver su detalle.</span>'; return; }
      var name = nameProp ? props[nameProp] : null, sec = sectorProp ? props[sectorProp] : null, val = valueProp ? props[valueProp] : null;
      var h = '<div class="mi-name">' + esc(name !== null ? name : 'Sector') + (sec ? ' · <small>' + esc(sec) + '</small>' : '') + '</div>';
      if (val !== null && val !== undefined) h += '<div class="mi-val"><span class="mi-dot" style="background:' + color(+val) + '"></span><strong>' + fnum(+val) + '</strong><small>' + esc(indexLabel) + '</small></div>';
      var extra = Object.keys(props).filter(function (k) { return [valueProp, nameProp, sectorProp].indexOf(k) < 0 && typeof props[k] !== 'object'; }).slice(0, 3);
      if (extra.length) h += '<dl>' + extra.map(function (k) { return '<dt>' + esc(k) + '</dt><dd>' + esc(props[k]) + '</dd>'; }).join('') + '</dl>';
      el.innerHTML = h;
    }

    function render(data, isDemo) {
      var feats = (data.features || []).filter(function (f) { return f && f.geometry; });
      if (!feats.length) return false;
      var p0 = feats[0].properties || {};
      valueProp = pick(p0, VALUE_PROPS);
      if (!valueProp) { for (var k in p0) if (typeof p0[k] === 'number') { valueProp = k; break; } }
      nameProp = pick(p0, NAME_PROPS); sectorProp = pick(p0, SECTOR_PROPS);
      indexLabel = valueProp ? (valueProp.length <= 5 ? valueProp.toUpperCase() : valueProp.charAt(0).toUpperCase() + valueProp.slice(1)) : 'Índice';
      var vals = valueProp ? feats.map(function (f) { return +f.properties[valueProp]; }).filter(function (x) { return !isNaN(x); }) : [];
      vmin = vals.length ? Math.min.apply(null, vals) : 0; vmax = vals.length ? Math.max.apply(null, vals) : 1;
      if (vmin === vmax) { vmin -= 0.05; vmax += 0.05; }

      document.getElementById('lgTitle').textContent = indexLabel;
      document.getElementById('lgBar').style.background = 'linear-gradient(90deg,' + RAMP.join(',') + ')';
      document.getElementById('lgMin').textContent = fnum(vmin);
      document.getElementById('lgMid').textContent = fnum((vmin + vmax) / 2);
      document.getElementById('lgMax').textContent = fnum(vmax);
      document.getElementById('mapTag').hidden = !isDemo;
      panel.querySelector('.map-legend').style.display = vals.length ? '' : 'none';

      if (geoLayer) map.removeLayer(geoLayer);
      geoLayer = L.geoJSON({ type: 'FeatureCollection', features: feats }, {
        style: function (f) { var s = baseStyle(); s.fillColor = valueProp ? color(+f.properties[valueProp]) : '#34bf49'; return s; },
        pointToLayer: function (f, ll) { return L.circleMarker(ll, { radius: 7, fillColor: valueProp ? color(+f.properties[valueProp]) : '#34bf49', color: '#fff', weight: 1.5, fillOpacity: .9 }); },
        onEachFeature: function (f, layer) {
          layer.on({
            mouseover: function (e) { if (e.target.setStyle) e.target.setStyle({ weight: 3, color: '#033e60' }); if (e.target.bringToFront) e.target.bringToFront(); setInfo(f.properties); },
            mouseout: function (e) { geoLayer.resetStyle(e.target); if (guide.current() === 0) geoLayer.setStyle({ weight: 3, color: '#ffffff' }); setInfo(null); },
            click: function () { setInfo(f.properties); }
          });
        }
      }).addTo(map);
      map.fitBounds(geoLayer.getBounds(), { padding: [34, 34], maxZoom: 19 });

      // número 1 sobre el cuartel
      var c = geoLayer.getBounds().getCenter();
      L.marker(c, { keyboard: false, icon: L.divIcon({ className: 'hs-pin-marker', html: '<span class="hs-pin" data-hs="0" role="button" tabindex="0" aria-label="1. Cuartel">1</span>', iconSize: [28, 28], iconAnchor: [14, 14] }) })
        .addTo(map).on('click', function () { guide.select(0); });
      Array.prototype.forEach.call(panel.querySelectorAll('[data-hs]'), function (el) {
        el.classList.toggle('is-active', +el.getAttribute('data-hs') === guide.current());
      });
      return true;
    }

    function load() {
      if (loaded) return; loaded = true;
      var sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 20, maxNativeZoom: 18, attribution: 'Imágenes © Esri, Maxar, Earthstar Geographics' });
      var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' });
      map = L.map('infoMap', { zoomControl: true, scrollWheelZoom: false, layers: [sat] }).setView([-32.7918, -70.8350], 16);
      L.control.layers({ 'Satélite': sat, 'Calles': osm }, null, { position: 'topright', collapsed: true }).addTo(map);
      map.on('click focus', function () { map.scrollWheelZoom.enable(); });
      map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

      fetch(GEOJSON_URL, { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { if (!render(d, false)) throw new Error('vacío'); })
        .catch(function () { render(demoGeoJSON(), true); });
    }

    return {
      show: function () {
        if (typeof L === 'undefined') { stage.innerHTML = '<p class="ex-hint">No se pudo cargar el mapa (sin conexión a Leaflet).</p>'; return; }
        if (!loaded) { load(); }
        setTimeout(function () { if (map) { map.invalidateSize(); if (geoLayer) map.fitBounds(geoLayer.getBounds(), { padding: [34, 34], maxZoom: 19 }); } }, 60);
      }
    };
  }

  /* ---------------- Pestañas ---------------- */
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.ex-tab'));
  var panels = {};
  panels.prioridad = root.querySelector('#panel-prioridad');
  panels.series = root.querySelector('#panel-series');
  panels.mapa = root.querySelector('#panel-mapa');
  var inst = { prioridad: initPrioridad(panels.prioridad), series: initSeries(panels.series), mapa: initMapa(panels.mapa) };
  inst.prioridad.select(0, true); inst.series.select(0); // la guía arranca en el paso 1

  function show(key, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-panel') === key;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    Object.keys(panels).forEach(function (k) {
      var on = k === key;
      panels[k].hidden = !on;
      panels[k].classList.toggle('is-active', on);
    });
    if (key === 'mapa') inst.mapa.show();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t.getAttribute('data-panel')); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      if (n !== null) { e.preventDefault(); show(tabs[n].getAttribute('data-panel'), true); }
    });
  });

  // Permite enlazar directo: metodologia.html?vista=series#informacion
  var m = /[?&]vista=(prioridad|series|mapa)/.exec(location.search);
  if (m) show(m[1]);
})();
