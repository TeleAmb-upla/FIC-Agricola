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

  const IMPORTANTE_BASE =
    "Un valor bajo o alto de este índice no determina por sí solo la causa de un problema. Las variaciones también pueden responder a podas, cambios estacionales, suelo visible y otras condiciones, por lo que deben interpretarse junto con el cultivo, su etapa de desarrollo y las observaciones en terreno.";

  const INDICES = [
    {
      id: "ndvi", nombre: "NDVI", full: "Índice de Vegetación de Diferencia Normalizada", cat: "vegetacion",
      rango: "-1 a +1",
      observa: "El NDVI es el índice de vegetación más utilizado en teledetección. Permite observar la cobertura y actividad de la vegetación verde, identificar diferencias dentro de los cultivos y realizar un seguimiento de sus cambios a lo largo del tiempo.",
      funciona: "El NDVI compara la luz roja y la infrarroja cercana reflejadas por la vegetación. Las plantas verdes absorben gran parte de la luz roja para realizar la fotosíntesis y reflejan una mayor proporción del infrarrojo cercano.",
      formula: { lhs: "NDVI", num: "NIR − Rojo", den: "NIR + Rojo" },
      s2: "(B08 − B04) / (B08 + B04)",
      scale: { tipo: "veg", labels: ["−1", "0", "0,5", "+1"] },
      interpreta: "Los valores bajos suelen asociarse a suelo descubierto o vegetación escasa, mientras que los valores altos generalmente indican mayor cobertura y actividad vegetal. Estos rangos son orientativos y dependen del cultivo y la etapa de desarrollo.",
      agro: "Permite monitorear el desarrollo de los cultivos, comparar su comportamiento entre temporadas e identificar cuarteles o sectores que presentan cambios en su actividad vegetal.",
      ejemplo: "en un huerto de paltos, una disminución persistente del NDVI respecto de su historial puede ayudar a identificar sectores que requieren una revisión en terreno.",
      importante: "Un valor bajo de NDVI no significa necesariamente estrés hídrico o una enfermedad. Las variaciones también pueden responder a podas, cambios estacionales, suelo visible y otras condiciones del cultivo."
    },
    {
      id: "evi", nombre: "EVI", full: "Índice de Vegetación Mejorado", cat: "vegetacion",
      rango: "-1 a +1 (en vegetación, típicamente 0 a 1)",
      observa: "El EVI permite observar la actividad de la vegetación en cultivos de cobertura densa, donde el NDVI tiende a saturarse. Incorpora la banda azul para reducir la influencia de la atmósfera y del suelo.",
      funciona: "Combina las bandas infrarroja cercana, roja y azul con coeficientes de ajuste. De esta forma mantiene sensibilidad en coberturas densas y reduce el efecto de la atmósfera y del fondo de suelo.",
      formula: { expr: "EVI = 2,5 × (NIR − Rojo) / (NIR + 6 × Rojo − 7,5 × Azul + 1)" },
      s2: "2,5 × (B08 − B04) / (B08 + 6 × B04 − 7,5 × B02 + 1)",
      scale: { tipo: "veg", labels: ["−1", "0", "0,5", "+1"] },
      interpreta: "Los valores bajos suelen asociarse a suelo descubierto o vegetación escasa; los valores altos, a follaje denso y activo. Los rangos son orientativos y dependen del cultivo y de su etapa de desarrollo.",
      agro: "Es útil para seguir cultivos de follaje denso, como huertos adultos o viñedos en pleno desarrollo, y para comparar cuarteles cuando el NDVI ya no distingue diferencias.",
      ejemplo: "en un viñedo en plena temporada, el EVI permite distinguir cuarteles con distinto vigor aun cuando el NDVI muestre valores similares.",
      importante: IMPORTANTE_BASE
    },
    {
      id: "gndvi", nombre: "GNDVI", full: "Índice de Vegetación de Diferencia Normalizada Verde", cat: "clorofila",
      rango: "-1 a +1",
      observa: "El GNDVI permite observar diferencias en el contenido de clorofila de la vegetación. Es más sensible que el NDVI a variaciones en el estado nutricional y fotosintético de las hojas.",
      funciona: "Reemplaza la banda roja del NDVI por la banda verde. La clorofila refleja una parte importante de la luz verde, y esa reflectancia cambia con la concentración de pigmentos en la hoja.",
      formula: { lhs: "GNDVI", num: "NIR − Verde", den: "NIR + Verde" },
      s2: "(B08 − B03) / (B08 + B03)",
      scale: { tipo: "veg", labels: ["−1", "0", "0,5", "+1"] },
      interpreta: "Los valores mayores se asocian a vegetación con más clorofila y mayor actividad fotosintética; los valores bajos, a vegetación escasa, senescente o suelo visible. Los rangos son orientativos.",
      agro: "Apoya el seguimiento del vigor y del contenido de clorofila, y ayuda a detectar cuarteles con diferencias en su condición nutricional para orientar las visitas a terreno.",
      ejemplo: "en un huerto de nogales, un cuartel con GNDVI menor que el de sus pares puede priorizarse para una revisión de su condición en terreno.",
      importante: IMPORTANTE_BASE
    },
    {
      id: "mcari", nombre: "MCARI", full: "Índice de Absorción de Clorofila Modificado", cat: "clorofila",
      rango: "Sin límites fijos (valores positivos; dependen del cultivo)",
      observa: "El MCARI permite estimar la concentración relativa de clorofila en las hojas y reduce el efecto del fondo de suelo y de la cobertura vegetal parcial.",
      funciona: "Utiliza las bandas verde, roja y de borde rojo (red-edge). Mide cuánto aumenta la reflectancia del borde rojo respecto de la roja, ajustada por la verde, lo que lo hace sensible a la absorción de clorofila.",
      formula: { expr: "MCARI = [(R705 − R670) − 0,2 × (R705 − R550)] × (R705 / R670)" },
      s2: "[(B05 − B04) − 0,2 × (B05 − B03)] × (B05 / B04)",
      scale: { tipo: "veg", labels: ["Bajo", "Medio", "Alto"] },
      interpreta: "Los valores bajos suelen indicar menor concentración de clorofila y los altos, mayor concentración. Al no tener un rango fijo, conviene compararlo con el historial del mismo cultivo y con cuarteles similares.",
      agro: "Apoya la identificación de diferencias de clorofila entre sectores de un predio y el seguimiento de su evolución durante la temporada.",
      ejemplo: "en un viñedo, los sectores con un MCARI sistemáticamente menor que el de sus pares pueden revisarse en terreno.",
      importante: IMPORTANTE_BASE
    },
    {
      id: "rep", nombre: "REP", full: "Posición del borde rojo (Red-edge position)", cat: "clorofila",
      rango: "Aproximadamente 700 a 750 nm",
      observa: "El REP indica la longitud de onda en que la reflectancia de la vegetación cambia con mayor rapidez entre el rojo y el infrarrojo cercano. Esa posición se desplaza según el contenido de clorofila y el estado de la vegetación.",
      funciona: "Se calcula por interpolación lineal con las bandas del borde rojo. A mayor contenido de clorofila, el borde rojo se desplaza hacia longitudes de onda mayores.",
      formula: { expr: "REP = 705 + 35 × [((R670 + R783) / 2 − R705) / (R740 − R705)]" },
      s2: "705 + 35 × [((B04 + B07) / 2 − B05) / (B06 − B05)]  (nm)",
      scale: { tipo: "veg", labels: ["700 nm", "725 nm", "750 nm"] },
      interpreta: "Los valores más bajos se asocian a menor contenido de clorofila o a vegetación senescente; los valores más altos, a vegetación con mayor clorofila y vigor.",
      agro: "Es útil para detectar cambios tempranos en el contenido de clorofila, que a menudo aparecen antes de que sean evidentes en índices como el NDVI.",
      ejemplo: "en un huerto de paltos, un desplazamiento del REP hacia valores menores respecto de su historial puede indicar un cambio de condición que conviene verificar en terreno.",
      importante: IMPORTANTE_BASE
    },
    {
      id: "msavi", nombre: "MSAVI", full: "Índice de Vegetación Ajustado al Suelo Modificado", cat: "vegetacion",
      rango: "-1 a +1",
      observa: "El MSAVI permite observar la vegetación en cultivos con cobertura parcial, donde el suelo visible altera la señal de otros índices.",
      funciona: "Ajusta el efecto del brillo del suelo mediante un factor que se calcula a partir de la propia imagen, sin necesidad de definir un valor fijo de corrección.",
      formula: { expr: "MSAVI = [2 × NIR + 1 − √((2 × NIR + 1)² − 8 × (NIR − Rojo))] / 2" },
      s2: "[2 × B08 + 1 − √((2 × B08 + 1)² − 8 × (B08 − B04))] / 2",
      scale: { tipo: "veg", labels: ["−1", "0", "0,5", "+1"] },
      interpreta: "Los valores bajos se asocian a suelo descubierto o vegetación escasa; los valores altos, a mayor cobertura y actividad vegetal. Los rangos son orientativos y dependen del cultivo.",
      agro: "Es adecuado para cultivos jóvenes, huertos con hileras separadas o inicios de temporada, donde hay mucho suelo visible entre las plantas.",
      ejemplo: "en un huerto joven con suelo expuesto entre hileras, el MSAVI entrega una señal de vegetación menos afectada por el suelo que la del NDVI.",
      importante: IMPORTANTE_BASE
    },
    {
      id: "ndmi", nombre: "NDMI", full: "Índice de Diferencia Normalizada de Humedad", cat: "agua",
      rango: "-1 a +1",
      observa: "El NDMI permite observar cambios en el contenido de agua de la vegetación.",
      funciona: "Compara el infrarrojo cercano con el infrarrojo de onda corta (SWIR). El SWIR es absorbido por el agua presente en las hojas, mientras que el infrarrojo cercano responde a la estructura del follaje.",
      formula: { lhs: "NDMI", num: "NIR − SWIR", den: "NIR + SWIR" },
      s2: "(B08 − B11) / (B08 + B11)",
      scale: { tipo: "water", labels: ["−1", "0", "+1"] },
      interpreta: "Los valores bajos se asocian a vegetación con menor contenido de agua o a suelo descubierto; los valores altos, a vegetación con mayor contenido de agua. Los rangos son orientativos.",
      agro: "Permite seguir los cambios en el estado hídrico de la vegetación a lo largo de la temporada y comparar cuarteles entre sí.",
      ejemplo: "una caída persistente del NDMI de un cuartel respecto de sus pares puede orientar una revisión del riego en terreno.",
      importante: "Un valor bajo de NDMI no determina por sí solo que el cultivo necesite riego. Debe interpretarse junto con el tipo de cultivo, su etapa de desarrollo y las observaciones en terreno."
    },
    {
      id: "ndwi", nombre: "NDWI", full: "Índice de Diferencia Normalizada de Agua", cat: "superficial",
      rango: "-1 a +1",
      observa: "El NDWI permite identificar la presencia de agua superficial, como embalses, tranques o canales.",
      funciona: "Compara la luz verde, que el agua refleja, con el infrarrojo cercano, que el agua absorbe casi por completo.",
      formula: { lhs: "NDWI", num: "Verde − NIR", den: "Verde + NIR" },
      s2: "(B03 − B08) / (B03 + B08)",
      scale: { tipo: "water", labels: ["−1", "0", "+1"] },
      interpreta: "Los valores altos (positivos) suelen corresponder a agua; los valores cercanos a cero o negativos, a suelo y vegetación.",
      agro: "Apoya la identificación de cuerpos de agua y de la infraestructura de acumulación de agua dentro y cerca de los predios.",
      ejemplo: "permite ubicar tranques de acumulación y seguir su extensión a lo largo del año.",
      importante: "El NDWI detecta agua superficial; no mide la humedad del suelo ni el estado hídrico de las plantas."
    },
    {
      id: "mndwi", nombre: "MNDWI", full: "Índice de Agua de Diferencia Normalizada Modificado", cat: "superficial",
      rango: "-1 a +1",
      observa: "El MNDWI mejora la identificación de agua superficial al reducir la confusión con superficies construidas y con el suelo.",
      funciona: "Reemplaza el infrarrojo cercano del NDWI por el infrarrojo de onda corta (SWIR), región donde el agua absorbe más y el suelo y las construcciones reflejan más.",
      formula: { lhs: "MNDWI", num: "Verde − SWIR", den: "Verde + SWIR" },
      s2: "(B03 − B11) / (B03 + B11)",
      scale: { tipo: "water", labels: ["−1", "0", "+1"] },
      interpreta: "Los valores altos (positivos) suelen corresponder a agua; los valores cercanos a cero o negativos, a suelo, construcciones y vegetación.",
      agro: "Es útil para delimitar tranques, embalses y canales con mayor precisión, y para seguir los cambios en su superficie.",
      ejemplo: "permite estimar variaciones en la extensión de un tranque de riego entre distintas semanas.",
      importante: "El MNDWI detecta agua superficial; no mide la humedad del suelo ni el estado hídrico de las plantas."
    },
    {
      id: "psri", nombre: "PSRI", full: "Índice de Reflectancia de Senescencia de las Plantas", cat: "pigmentos",
      rango: "-1 a +1",
      observa: "El PSRI permite observar el cambio en la proporción de pigmentos de la vegetación, en particular el aumento de carotenoides frente a la clorofila que se asocia a la senescencia y la maduración.",
      funciona: "Relaciona la diferencia entre la reflectancia roja y la azul con la del borde rojo. Cuando la clorofila disminuye y aumentan los carotenoides, el valor del índice crece.",
      formula: { lhs: "PSRI", num: "Rojo − Azul", den: "Borde rojo" },
      s2: "(B04 − B02) / B06",
      scale: { tipo: "pigment", labels: ["−1", "0", "+1"] },
      interpreta: "Los valores bajos se asocian a vegetación verde y activa; los valores crecientes, a maduración o senescencia de la vegetación o del fruto. Los rangos son orientativos.",
      agro: "Es útil para seguir la maduración y el término del ciclo, y para identificar cuarteles que entran en senescencia antes o después que sus pares.",
      ejemplo: "en un viñedo, el PSRI ayuda a seguir el avance de la maduración entre cuarteles.",
      importante: "Un aumento del PSRI puede ser normal hacia el final de la temporada. Debe distinguirse de otras causas considerando el cultivo, su etapa de desarrollo y la observación en terreno."
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
