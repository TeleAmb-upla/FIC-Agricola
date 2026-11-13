/**
 * Página Metodología: ficha de índices espectrales.
 * Para editar contenido, modificar el arreglo INDICES.
 *
 * Campos:
 *  id, nombre (sigla), full (nombre completo), cat (clave de categoría),
 *  rango, observa, funciona, formula {num, den, expr, lhs}, s2 (expresión con bandas Sentinel-2),
 *  scale {tipo: veg|water|pigment, labels: []}, interpreta, agro, ejemplo, importante
 */
(function () {
  "use strict";

  const CATEGORIAS = {
    vegetacion: { label: "Vegetación", cls: "", icon: "bi-flower1" },
    clorofila: { label: "Clorofila", cls: "cat-clorofila", icon: "bi-droplet-half" },
    agua: { label: "Agua en vegetación", cls: "cat-agua", icon: "bi-moisture" },
    superficial: { label: "Agua superficial", cls: "cat-agua", icon: "bi-water" },
    pigmentos: { label: "Pigmentos", cls: "cat-pigmentos", icon: "bi-palette" }
  };

  const FILTROS = [
    { key: "todos", label: "Todos" },
    { key: "vegetacion", label: "Vegetación" },
    { key: "clorofila", label: "Clorofila" },
    { key: "agua", label: "Agua" },
    { key: "pigmentos", label: "Pigmentos" }
  ];
  // Qué categorías muestra cada filtro
  const FILTRO_MAP = {
    todos: null,
    vegetacion: ["vegetacion"],
    clorofila: ["clorofila"],
    agua: ["agua", "superficial"],
    pigmentos: ["pigmentos"]
  };

  // Descripciones, fórmulas y bandas basadas en Sentinel Hub Custom Scripts
  // (https://custom-scripts.sentinel-hub.com/custom-scripts/sentinel/sentinel-2/).
  const FUENTE =
    "Fuente: Sentinel Hub Custom Scripts — Sentinel-2 (custom-scripts.sentinel-hub.com).";

  const IMPORTANTE_BASE =
    "Un valor bajo o alto de este índice no determina por sí solo la causa de un problema. Las variaciones también pueden responder a podas, cambios estacionales, suelo visible y otras condiciones, por lo que deben interpretarse junto con el cultivo, su etapa de desarrollo y las observaciones en terreno. " + FUENTE;

  const INDICES = [
    {
      id: "ndvi", nombre: "NDVI", full: "Índice de Vegetación de Diferencia Normalizada", cat: "vegetacion",
      rango: "-1 a +1",
      observa: "El NDVI es un índice simple y efectivo para cuantificar la vegetación verde. Normaliza la dispersión de las hojas verdes en el infrarrojo cercano con la absorción de clorofila en el rojo, y es un buen indicador de vegetación viva.",
      funciona: "Se calcula como la diferencia normalizada entre el infrarrojo cercano (NIR) y el rojo. En Sentinel-2 se usan las bandas B08 (NIR) y B04 (rojo).",
      formula: { lhs: "NDVI", num: "NIR − Rojo", den: "NIR + Rojo" },
      s2: "(B08 − B04) / (B08 + B04)",
      scale: { tipo: "veg", labels: ["−1", "0", "0,5", "+1"] },
      interpreta: "Valores cercanos a −1 suelen corresponder a agua. Valores próximos a cero (−0,1 a 0,1) se asocian a suelo desnudo, roca, arena o nieve. Valores bajos positivos (aprox. 0,2 a 0,4) representan matorrales y pastizales, y valores altos (acercándose a 1) indican vegetación densa, como bosques templados y tropicales.",
      agro: "Permite monitorear la cobertura y la actividad de los cultivos, comparar su comportamiento entre temporadas e identificar cuarteles o sectores con cambios en su vegetación.",
      ejemplo: "en un huerto de paltos, una disminución persistente del NDVI respecto de su historial puede ayudar a identificar sectores que requieren una revisión en terreno.",
      importante: "Un valor bajo de NDVI no significa necesariamente estrés hídrico o una enfermedad. Las variaciones también pueden responder a podas, cambios estacionales, suelo visible y otras condiciones del cultivo. " + FUENTE
    },
    {
      id: "evi", nombre: "EVI", full: "Índice de Vegetación Mejorado", cat: "vegetacion",
      rango: "-1 a +1 (vegetación sana, típicamente 0,20 a 0,80)",
      observa: "El EVI mejora la estimación de la vegetación en áreas de dosel denso, donde el índice de área foliar (LAI) es alto y el NDVI tiende a saturarse. Incorpora la banda azul para corregir señales del suelo y de la atmósfera.",
      funciona: "Combina NIR, rojo y azul con coeficientes de ajuste. En Sentinel-2 se usa: EVI = 2,5 × (B08 − B04) / (B08 + 6 × B04 − 7,5 × B02 + 1).",
      formula: { expr: "EVI = 2,5 × (NIR − Rojo) / (NIR + 6 × Rojo − 7,5 × Azul + 1)" },
      s2: "2,5 × (B08 − B04) / (B08 + 6 × B04 − 7,5 × B02 + 1)",
      scale: { tipo: "veg", labels: ["−1", "0", "0,5", "+1"] },
      interpreta: "El rango es −1 a +1. La vegetación sana suele situarse alrededor de 0,20 a 0,80. Valores bajos se asocian a suelo descubierto o vegetación escasa; valores altos, a follaje denso y activo.",
      agro: "Es útil para seguir cultivos de follaje denso, como huertos adultos o viñedos en pleno desarrollo, y para comparar cuarteles cuando el NDVI ya no distingue diferencias.",
      ejemplo: "en un viñedo en plena temporada, el EVI permite distinguir cuarteles con distinto vigor aun cuando el NDVI muestre valores similares.",
      importante: IMPORTANTE_BASE
    },
    {
      id: "gndvi", nombre: "GNDVI", full: "Índice de Vegetación de Diferencia Normalizada Verde", cat: "clorofila",
      rango: "-1 a +1",
      observa: "El GNDVI es más sensible a las variaciones del contenido de clorofila que el NDVI (Gitelson et al., 1996), por lo que permite observar diferencias en el estado fotosintético de la vegetación.",
      funciona: "Usa la misma lógica del NDVI, pero reemplaza la banda roja por la verde (aprox. 540–570 nm). En Sentinel-2 se calculan B08 (NIR) y B03 (verde).",
      formula: { lhs: "GNDVI", num: "NIR − Verde", den: "NIR + Verde" },
      s2: "(B08 − B03) / (B08 + B03)",
      scale: { tipo: "veg", labels: ["−1", "0", "0,5", "+1"] },
      interpreta: "Los valores mayores se asocian a vegetación con más clorofila y mayor actividad fotosintética; los valores bajos, a vegetación escasa, senescente o suelo visible. Los rangos son orientativos y dependen del cultivo.",
      agro: "Apoya el seguimiento del vigor y del contenido de clorofila, y ayuda a detectar cuarteles con diferencias en su condición nutricional para orientar las visitas a terreno.",
      ejemplo: "en un huerto de nogales, un cuartel con GNDVI menor que el de sus pares puede priorizarse para una revisión de su condición en terreno.",
      importante: IMPORTANTE_BASE
    },
    {
      id: "mcari", nombre: "MCARI", full: "Índice de Absorción de Clorofila en Reflectancia Modificado", cat: "clorofila",
      rango: "Sin límites fijos (depende del cultivo y de la escena)",
      observa: "El MCARI mide la profundidad de la absorción de clorofila y es muy sensible a variaciones en las concentraciones de clorofila y en el índice de área foliar (LAI).",
      funciona: "Utiliza las bandas de borde rojo (≈700 nm), rojo (≈670 nm) y verde (≈550 nm). En Sentinel-2: ((B05 − B04) − 0,2 × (B05 − B03)) × (B05 / B04). Sus valores no se ven afectados por las condiciones de iluminación ni por la reflectancia de fondo del suelo y de materiales no fotosintéticos.",
      formula: { expr: "MCARI = [(R700 − R670) − 0,2 × (R700 − R550)] × (R700 / R670)" },
      s2: "[(B05 − B04) − 0,2 × (B05 − B03)] × (B05 / B04)",
      scale: { tipo: "veg", labels: ["Bajo", "Medio", "Alto"] },
      interpreta: "Los valores bajos suelen indicar menor concentración de clorofila y los altos, mayor concentración. Al no tener un rango fijo, conviene compararlo con el historial del mismo cultivo y con cuarteles similares.",
      agro: "Apoya la identificación de diferencias de clorofila entre sectores de un predio y el seguimiento de su evolución durante la temporada.",
      ejemplo: "en un viñedo, los sectores con un MCARI sistemáticamente menor que el de sus pares pueden revisarse en terreno.",
      importante: IMPORTANTE_BASE
    },
    {
      id: "rep", nombre: "REP", full: "Posición del borde rojo (Red Edge Position)", cat: "clorofila",
      rango: "Aproximadamente 690 a 725 nm",
      observa: "El índice de posición del borde rojo (REP o REPO) es sensible a cambios en las concentraciones de clorofila: a mayor clorofila, la vegetación absorbe longitudes de onda más largas y la posición del borde rojo se desplaza.",
      funciona: "Se calcula por interpolación lineal a cuatro puntos (4PLI), según Gholizadeh et al. (2016). En Sentinel-2: 700 + 40 × (((B04 + B07) / 2 − B05) / (B06 − B05)).",
      formula: { expr: "REP = 700 + 40 × [((R670 + R780) / 2 − R700) / (R740 − R700)]" },
      s2: "700 + 40 × [((B04 + B07) / 2 − B05) / (B06 − B05)]  (nm)",
      scale: { tipo: "veg", labels: ["690 nm", "707 nm", "725 nm"] },
      interpreta: "Los valores más bajos se asocian a menor contenido de clorofila o a vegetación senescente; los valores más altos, a vegetación con mayor clorofila. En visualizaciones de Sentinel Hub se suele considerar un rango cercano a 690–725 nm.",
      agro: "Es útil para detectar cambios tempranos en el contenido de clorofila, que a menudo aparecen antes de que sean evidentes en índices como el NDVI.",
      ejemplo: "en un huerto de paltos, un desplazamiento del REP hacia valores menores respecto de su historial puede indicar un cambio de condición que conviene verificar en terreno.",
      importante: IMPORTANTE_BASE
    },
    {
      id: "msavi", nombre: "MSAVI", full: "Índice de Vegetación Ajustado al Suelo Modificado", cat: "vegetacion",
      rango: "Aprox. −0,4 a 0,6 (depende de la escena)",
      observa: "El MSAVI (Modified Soil Adjusted Vegetation Index) es un índice de vegetación que reduce el efecto del brillo del suelo, útil cuando hay cobertura vegetal parcial y suelo visible entre las plantas.",
      funciona: "A diferencia del SAVI, no requiere definir un factor L de corrección del suelo: el ajuste se obtiene a partir de las propias bandas NIR y rojo. En Sentinel-2 se usa B08 y B04, según la base Index Database incluida en Sentinel Hub.",
      formula: { expr: "MSAVI = [2 × NIR + 1 − √((2 × NIR + 1)² − 8 × (NIR − Rojo))] / 2" },
      s2: "[2 × B08 + 1 − √((2 × B08 + 1)² − 8 × (B08 − B04))] / 2",
      scale: { tipo: "veg", labels: ["−0,4", "0", "0,6"] },
      interpreta: "Los valores bajos se asocian a suelo descubierto o vegetación escasa; los valores altos, a mayor cobertura y actividad vegetal. Los rangos son orientativos y dependen del cultivo y de la escena.",
      agro: "Es adecuado para cultivos jóvenes, huertos con hileras separadas o inicios de temporada, donde hay mucho suelo visible entre las plantas.",
      ejemplo: "en un huerto joven con suelo expuesto entre hileras, el MSAVI entrega una señal de vegetación menos afectada por el suelo que la del NDVI.",
      importante: IMPORTANTE_BASE
    },
    {
      id: "ndmi", nombre: "NDMI", full: "Índice de Diferencia Normalizada de Humedad", cat: "agua",
      rango: "-1 a +1",
      observa: "El NDMI se usa para monitorear cambios en el contenido de agua de las hojas. Combina NIR y SWIR: el SWIR refleja cambios en el agua de la vegetación y en la estructura del mesófilo, mientras que el NIR responde a la estructura interna de la hoja y a la materia seca, pero no al contenido de agua.",
      funciona: "Al combinar NIR con SWIR se reducen las variaciones inducidas por la estructura interna de la hoja y la materia seca, y mejora la estimación del contenido de agua de la vegetación. La reflectancia SWIR se relaciona de forma negativa con el agua foliar. En Sentinel-2: (B08 − B11) / (B08 + B11).",
      formula: { lhs: "NDMI", num: "NIR − SWIR", den: "NIR + SWIR" },
      s2: "(B08 − B11) / (B08 + B11)",
      scale: { tipo: "water", labels: ["−1", "0", "+1"] },
      interpreta: "Los valores bajos se asocian a vegetación con menor contenido de agua o a suelo descubierto; los valores altos, a vegetación con mayor contenido de agua. Los rangos son orientativos.",
      agro: "Permite seguir los cambios en el estado hídrico de la vegetación a lo largo de la temporada y comparar cuarteles entre sí.",
      ejemplo: "una caída persistente del NDMI de un cuartel respecto de sus pares puede orientar una revisión del riego en terreno.",
      importante: "Un valor bajo de NDMI no determina por sí solo que el cultivo necesite riego. Debe interpretarse junto con el tipo de cultivo, su etapa de desarrollo y las observaciones en terreno. " + FUENTE
    },
    {
      id: "ndwi", nombre: "NDWI", full: "Índice de Diferencia Normalizada de Agua", cat: "superficial",
      rango: "-1 a +1",
      observa: "El NDWI (McFeeters, 1996) se usa para monitorear cambios relacionados con el contenido de agua en cuerpos de agua. Como el agua absorbe fuertemente la luz visible e infrarroja, el índice usa las bandas verde e infrarroja cercana para resaltar cuerpos de agua.",
      funciona: "Compara la banda verde con el NIR. En Sentinel-2: (B03 − B08) / (B03 + B08). Es sensible a superficies construidas y puede sobrestimar la extensión de agua.",
      formula: { lhs: "NDWI", num: "Verde − NIR", den: "Verde + NIR" },
      s2: "(B03 − B08) / (B03 + B08)",
      scale: { tipo: "water", labels: ["−1", "0", "+1"] },
      interpreta: "Valores mayores a 0,5 suelen corresponder a cuerpos de agua. La vegetación suele mostrar valores mucho menores, y las áreas construidas valores entre 0 y 0,2.",
      agro: "Apoya la identificación de cuerpos de agua y de la infraestructura de acumulación de agua dentro y cerca de los predios.",
      ejemplo: "permite ubicar tranques de acumulación y seguir su extensión a lo largo del año.",
      importante: "El NDWI detecta agua superficial; no mide la humedad del suelo ni el estado hídrico de las plantas. En la literatura a veces se confunde con el NDMI (NIR–SWIR); aquí se mantiene la separación usada por Sentinel Hub. " + FUENTE
    },
    {
      id: "mndwi", nombre: "MNDWI", full: "Índice de Agua de Diferencia Normalizada Modificado", cat: "superficial",
      rango: "-1 a +1",
      observa: "El MNDWI se usa para detectar superficies de agua abierta. En los scripts de mapeo de cuerpos de agua de Sentinel Hub se combina con el NDWI para mejorar la identificación de agua.",
      funciona: "Reemplaza el NIR del NDWI por el SWIR1, lo que reduce la confusión con suelo y superficies construidas. En Sentinel-2: (B03 − B11) / (B03 + B11).",
      formula: { lhs: "MNDWI", num: "Verde − SWIR", den: "Verde + SWIR" },
      s2: "(B03 − B11) / (B03 + B11)",
      scale: { tipo: "water", labels: ["−1", "0", "+1"] },
      interpreta: "Los valores altos (positivos) suelen corresponder a agua; los valores cercanos a cero o negativos, a suelo, construcciones y vegetación. En scripts de Sentinel Hub se usan umbrales orientativos (por ejemplo, alrededor de 0,1 a 0,42), que pueden requerir calibración por escena.",
      agro: "Es útil para delimitar tranques, embalses y canales con mayor precisión, y para seguir los cambios en su superficie.",
      ejemplo: "permite estimar variaciones en la extensión de un tranque de riego entre distintas semanas.",
      importante: "El MNDWI detecta agua superficial; no mide la humedad del suelo ni el estado hídrico de las plantas. " + FUENTE
    },
    {
      id: "psri", nombre: "PSRI", full: "Índice de Reflectancia de Senescencia de las Plantas", cat: "pigmentos",
      rango: "Aprox. −0,2 a 0,4 (rango típico de visualización)",
      observa: "El PSRI (Plant Senescence Reflectance Index) se usa para estudiar la vegetación y, en particular, procesos asociados a la senescencia y a cambios en los pigmentos de las plantas.",
      funciona: "Se define como la razón entre la diferencia rojo−azul y el borde rojo. En Sentinel-2: PSRI = (B04 − B02) / B06.",
      formula: { lhs: "PSRI", num: "Rojo − Azul", den: "Borde rojo" },
      s2: "(B04 − B02) / B06",
      scale: { tipo: "pigment", labels: ["−0,2", "0", "0,4"] },
      interpreta: "Los valores bajos se asocian a vegetación verde y activa; los valores crecientes, a maduración o senescencia de la vegetación. Los rangos son orientativos y dependen del cultivo y de la etapa de desarrollo.",
      agro: "Es útil para seguir la maduración y el término del ciclo, y para identificar cuarteles que entran en senescencia antes o después que sus pares.",
      ejemplo: "en un viñedo, el PSRI ayuda a seguir el avance de la maduración entre cuarteles.",
      importante: "Un aumento del PSRI puede ser normal hacia el final de la temporada. Debe distinguirse de otras causas considerando el cultivo, su etapa de desarrollo y la observación en terreno. " + FUENTE
    }
  ];

  /* ---------- Render ---------- */
  const grid = document.getElementById("indexGrid");
  const filters = document.getElementById("indexFilters");
  const modalEl = document.getElementById("indexModal");
  const modalContent = document.getElementById("indexModalContent");
  if (!grid || !modalEl) return;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  grid.innerHTML = INDICES.map((i) => {
    const cat = CATEGORIAS[i.cat];
    return (
      '<button type="button" class="index-tile" data-id="' + i.id + '" data-cat="' + i.cat + '" data-aos="fade-up">' +
      '<span class="abbr">' + esc(i.nombre) + "</span>" +
      '<span class="full">' + esc(i.full) + "</span>" +
      '<span class="badge-cat ' + cat.cls + '">' + esc(cat.label) + "</span>" +
      "</button>"
    );
  }).join("");

  filters.innerHTML = FILTROS.map((f, n) =>
    '<button type="button" data-filter="' + f.key + '"' + (n === 0 ? ' class="on"' : "") + ">" + f.label + "</button>"
  ).join("");

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-filter]");
    if (!btn) return;
    filters.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b === btn));
    const allowed = FILTRO_MAP[btn.dataset.filter];
    grid.querySelectorAll(".index-tile").forEach((t) => {
      t.classList.toggle("is-hidden", !!allowed && !allowed.includes(t.dataset.cat));
    });
  });

  function formulaHTML(f) {
    if (f.num) {
      return (
        '<span class="formula"><span>' + esc(f.lhs) + ' =</span><span class="frac"><span>' + esc(f.num) +
        "</span><span>" + esc(f.den) + "</span></span></span>"
      );
    }
    return '<span class="formula">' + esc(f.expr) + "</span>";
  }

  function fichaHTML(i) {
    const cat = CATEGORIAS[i.cat];
    const labels = i.scale.labels.map((l) => "<span>" + esc(l) + "</span>").join("");
    return (
      '<div class="idx-head">' +
      '<span class="idx-ico"><i class="bi ' + cat.icon + '"></i></span>' +
      '<div><h3 id="indexModalLabel">' + esc(i.nombre) + "</h3><small>" + esc(i.full) + "</small></div>" +
      '<span class="badge-cat ' + cat.cls + '">' + esc(cat.label) + "</span>" +
      '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>' +
      "</div>" +
      '<div class="idx-body">' +
      "<h5>¿Qué permite observar?</h5><p>" + esc(i.observa) + "</p>" +
      '<div class="idx-foot"><span>Rango de valores: ' + esc(i.rango) + "</span>" +
      '<button type="button" class="btn-more" aria-expanded="false" aria-controls="idxMore">' +
      '<span class="lbl">Conocer más</span> <i class="bi bi-chevron-down"></i></button></div>' +
      '<div class="idx-more" id="idxMore"><div>' +
      "<h5>¿Cómo funciona?</h5><p>" + esc(i.funciona) + "</p>" +
      '<div class="formula-box"><div class="ttl">Fórmula del ' + esc(i.nombre) + "</div>" +
      formulaHTML(i.formula) +
      '<div class="s2">Sentinel-2: ' + esc(i.s2) + "</div></div>" +
      "<h5>¿Cómo interpretar sus valores?</h5>" +
      '<div class="scale ' + i.scale.tipo + '"></div><div class="scale-labels">' + labels + "</div>" +
      "<p>" + esc(i.interpreta) + "</p>" +
      "<h5>Aplicación agronómica</h5><p>" + esc(i.agro) + "</p>" +
      "<p><strong>Ejemplo:</strong> " + esc(i.ejemplo) + "</p>" +
      '<div class="important"><i class="bi bi-info-circle"></i><div><strong>Importante para su interpretación</strong>' +
      "<span>" + esc(i.importante) + "</span></div></div>" +
      "</div></div>" +
      "</div>"
    );
  }

  const bsModal = window.bootstrap ? new bootstrap.Modal(modalEl) : null;

  grid.addEventListener("click", (e) => {
    const tile = e.target.closest(".index-tile");
    if (!tile) return;
    const idx = INDICES.find((x) => x.id === tile.dataset.id);
    if (!idx) return;
    modalContent.innerHTML = fichaHTML(idx);
    if (bsModal) bsModal.show();
  });

  // "Conocer más / Mostrar menos"
  modalContent.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-more");
    if (!btn) return;
    const more = modalContent.querySelector("#idxMore");
    const open = more.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.querySelector(".lbl").textContent = open ? "Mostrar menos" : "Conocer más";
  });

  /* ---------- Subnavegación pegajosa bajo el header ---------- */
  const header = document.getElementById("header");
  const subnav = document.querySelector(".subnav");
  function placeSubnav() {
    if (subnav && header) subnav.style.top = header.offsetHeight + "px";
  }
  placeSubnav();
  window.addEventListener("resize", placeSubnav);
  window.addEventListener("scroll", placeSubnav, { passive: true });
  window.addEventListener("load", placeSubnav);
  if (header) header.addEventListener("transitionend", placeSubnav);

  /* ---------- Subnavegación: resalta la sección visible ---------- */
  const links = document.querySelectorAll(".subnav a");
  const sections = Array.from(links).map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id));
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach((s) => obs.observe(s));
  }
})();
