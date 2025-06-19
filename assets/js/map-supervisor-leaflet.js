// Mapa exclusivo para el supervisor, estilo clásico compatible con scripts globales
// Este archivo está preparado para cargar múltiples archivos TIFF en el mapa

// Instancia global del mapa supervisor
window.mapSupervisor = window.mapSupervisor || undefined;

// Inicializa el mapa supervisor en el div con id mapId
function initSupervisorMap(mapId) {
    // Elimina el mapa anterior si existe
    if (window.mapSupervisor) {
        window.mapSupervisor.remove();
        window.mapSupervisor = undefined;
    }
    // Asegura que el div existe y está limpio
    let mapDiv = document.getElementById(mapId);
    if (!mapDiv) {
        mapDiv = document.createElement('div');
        mapDiv.id = mapId;
        mapDiv.style.height = '500px';
        mapDiv.style.width = '100%';
        document.body.appendChild(mapDiv);
    } else {
        mapDiv.innerHTML = '';
    }
    window.mapSupervisor = L.map(mapId).setView([-33.036, -71.381], 11);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '© Esri, Earthstar Geographics'
    }).addTo(window.mapSupervisor);
    return window.mapSupervisor;
}

// Paletas de colores por índice (protegido para evitar doble declaración)
if (typeof window.colorParams === 'undefined') {
  window.colorParams = {
    NDVI: { palette: ['ffffff', 'ce7e45', 'df923d', 'f1b555', 'fcd163', '99b718', '74a901', '66a000', '529400', '3e8601', '207401', '056201', '004c00', '023b01', '012e01', '011d01', '011301'] },
    EVI: { palette: ['ffffff', 'f7f7b0', 'e6f59b', 'c6ea7f', 'a6d96a', '86c45d', '66bd63', '46a356', '2e8b4a', '1a753e', '0a5c32'] },
    SAVI: { palette: ['8b4513', 'a05a2c', 'b56f45', 'ca855e', 'df9a77', 'f4b090', 'd5c293', 'b6d496', '97e699', '60c67d', '399565'] },
    GNDVI: { palette: ['ff0000', 'ff4500', 'ff8c00', 'ffd700', 'ffff00', 'adff2f', '69d500', '32cd32', '008000', '006400'] },
    LAI: { palette: ['ffffff', 'e0f3e0', 'c1e7c1', 'a2dba2', '83cf83', '64c364', '45b745', '26ab26', '068b06', '005c00'] },
    NDMI: { palette: ['8b0000', 'ff0000', 'ffa07a', 'ffffff', 'add8e6', '0000ff', '00008b'] },
    GCI: { palette: ['b2182b', 'ef8a62', 'fddbc7', 'f7f7f7', 'b5c6d0', '5890b0', '2166ac'] },
    MSAVI: { palette: ['8c510a', 'bf812d', 'dfc27d', 'f6e8c3', 'b9d9d4', '80cdc1', '35978f', '01665e'] },
    NDWI: { palette: ["d73027", "fc8d59", "fee090", "e0f3f8", "91bfdb", "4575b4"] },
    MNDWI: { palette: ['a50026', 'd75926', 'f46d43', 'fdae61', 'fee08b', 'e6f598', 'abdda4', '66bd63', '1a9850', '006837'] }
  };
}

// Descripciones de índices espectrales (igual que en map.js)
if (typeof window.text_cont === 'undefined') {
  window.text_cont = {
    NDVI: "Qué indica: Se utiliza para cuantificar el verdor de la vegetación y es útil para comprender la densidad de la vegetación y evaluar los cambios en la salud de las plantas. Valores: Los valores del NDVI varían entre -1 y 1. Cuando obtenemos valores cercanos a 1 (entre 0.6 y 0.9), esto nos indica vegetación densa y en buen estado de salud. Valores intermedios (0.2 a 0.5) señalan vegetación moderada o en crecimiento. Los valores próximos a cero y negativos representan superficies sin vegetación, como suelo desnudo, rocas o áreas urbanas.",
    EVI: "Qué indica: Diseñado para áreas de vegetación densa o suelos húmedos, minimiza distorsiones atmosféricas y del suelo. Valores: Este índice presenta valores entre -1 y 1. Los valores más altos (0.5 a 1) corresponden a vegetación densa y saludable. Valores entre 0.2 y 0.4 indican vegetación moderada. Cuando los valores son inferiores a 0.1, estamos ante suelos expuestos o zonas con muy poca vegetación. Los valores negativos aparecen en superficies no vegetales como construcciones o áreas secas.",
    SAVI: "Qué indica: Analiza vegetación en zonas con mucho suelo expuesto, incorporando un factor de corrección fijo para minimizar la interferencia del suelo. Valores: Sus valores oscilan entre -1 y 1. Valores superiores a 0.4 indican buena cobertura vegetal. Cuando están entre 0.1 y 0.3, muestran vegetación escasa. Los valores menores a cero generalmente corresponden a suelos desnudos o cuerpos de agua. Este índice es particularmente valioso en zonas donde el suelo está muy expuesto.",
    GNDVI: "Qué indica: Evalúa el contenido de clorofila y estrés vegetal usando luz verde en lugar de roja, siendo más sensible a cambios tempranos en la salud vegetal. Valores: Con un rango de -1 a 1, los valores superiores a 0.7 muestran plantas con alto contenido de clorofila y excelente salud. Valores entre 0.3 y 0.6 representan vegetación normal. Cuando los valores caen por debajo de 0.2, esto indica problemas como estrés hídrico o deficiencias nutricionales en las plantas, siendo especialmente útil para detectar estos problemas en etapas tempranas.",
    LAI: "Índice de Área Foliar",
    NDMI: "Qué indica: Mide específicamente el contenido de humedad en las hojas usando infrarrojo cercano y de onda corta, ideal para detectar estrés hídrico. Valores: Sus valores van de -1 a 1. Valores mayores a 0.4 muestran alta humedad foliar (plantas bien hidratadas). Valores entre 0 y 0.3 indican humedad normal. Los valores negativos señalan sequía o estrés hídrico severo. Este índice es clave para la gestión eficiente del riego en agricultura.",
    GCI: "Índice de Clorofila Verde",
    MSAVI: "Qué indica: Versión mejorada del SAVI que ajusta automáticamente la corrección del suelo sin necesidad de parámetros fijos. Valores: Con valores entre 0 y 1, los resultados superiores a 0.6 señalan vegetación densa. Valores entre 0.2 y 0.5 indican vegetación moderada. Cuando los valores son inferiores a 0.2, nos encontramos ante suelos sin actividad fotosintética significativa. La ventaja de este índice es que se ajusta automáticamente a las condiciones del terreno.",
    NDWI: "Qué indica: Detecta contenido de agua en vegetación y presencia de cuerpos de agua mediante la reflectancia de luz verde e infrarroja. Valores: Sus valores van de -1 a 1. Valores mayores a 0.3 identifican cuerpos de agua o vegetación muy húmeda. Los valores entre 0 y 0.2 muestran humedad moderada. Cuando los valores son negativos, indican zonas secas. Este índice es fundamental para el monitoreo de recursos hídricos.",
    MNDWI: "Qué indica: Versión mejorada del NDWI que usa infrarrojo de onda corta para distinguir mejor el agua en zonas urbanas o con suelos secos. Valores: También con rango de -1 a 1, valores superiores a 0.5 corresponden a agua superficial clara. Valores entre 0 y 0.3 indican humedad en suelo o vegetación. Los valores negativos señalan áreas secas o estructuras artificiales."
  };
}

// Control de descripción dinámica para el mapa del supervisor
function updateSupervisorDescControl(map, capaSeleccionada) {
    if (map.descControl) map.removeControl(map.descControl);
    const descripcion = text_cont[capaSeleccionada.toUpperCase()] || "";
    if (descripcion) {
        map.descControl = L.control({ position: 'topleft' });
        map.descControl.onAdd = function() {
            const div = L.DomUtil.create('div', 'map-index-desc');
            div.innerHTML = `
                <div style="width:180px; display:flex; flex-direction:column; align-items:center; justify-content:flex-start;">
                    <div style="font-weight:bold; font-size:1.05em; color:#2c3e50; margin-top:10px; margin-bottom:12px; text-align:center;">
                        ${capaSeleccionada.toUpperCase()}
                    </div>
                    <div style="font-size:0.98em; color:#333; text-align:justify; line-height:1.3; padding:0 8px;">
                        ${descripcion}
                    </div>
                </div>
            `;
            return div;
        };
        map.descControl.addTo(map);
    }
}

// Control de título dinámico para el mapa del supervisor
function updateSupervisorTitleControl(map, capaSeleccionada) {
    if (map.titleControl) map.removeControl(map.titleControl);
    map.titleControl = L.control({ position: 'topright' });
    map.titleControl.onAdd = () => {
        const div = L.DomUtil.create('div', 'map-title');
        div.innerHTML = `
            <div class="legend-title-container">
                <span class="legend-main-title">Índice de Vegetación</span>
                <span class="legend-layer-name">${capaSeleccionada.toUpperCase()}</span>
            </div>
        `;
        return div;
    };
    map.titleControl.addTo(map);
}

// Función simple para calcular min y max del ráster
function getMinMax(georaster) {
  return {
    min: georaster.mins ? georaster.mins[0] : georaster.min,
    max: georaster.maxs ? georaster.maxs[0] : georaster.max
  };
}

// Calcula los límites geográficos del raster para ajustar el mapa
function calculateBounds(georaster) {
    const xmin = georaster.xmin;
    const xmax = georaster.xmax;
    const ymin = georaster.ymin;
    const ymax = georaster.ymax;
    return [[ymin, xmin], [ymax, xmax]]; // Formato Leaflet: [suroeste, noreste]
}

// Carga y agrega múltiples rásteres (GeoTIFF) al mapa supervisor y ajusta el mapa a los bounds combinados
function addAllRastersToSupervisorMap(map, usuario, capaSeleccionada, semanaSeleccionada) {
    if (!window.getRutasPorPredio) {
        console.error('getRutasPorPredio no está definido');
        return;
    }
    const rutasPorPredio = window.getRutasPorPredio(usuario, capaSeleccionada, semanaSeleccionada);
    const parseGeo = window.parseGeoraster;
    if (!parseGeo) {
        console.error('parseGeoraster no está definido en window:', window.parseGeoraster);
        alert('No se pudo cargar la librería georaster. Verifica tu conexión o si algún bloqueador está interfiriendo.');
        return;
    }
    let allBounds = [];
    let loadedCount = 0;
    rutasPorPredio.forEach(async (ruta) => {
        try {
            console.log('Intentando cargar TIFF:', ruta.tiff);
            const response = await fetch(ruta.tiff);
            if (!response.ok) {
                console.warn('No se encontró el archivo TIFF:', ruta.tiff);
                loadedCount++;
                if (loadedCount === rutasPorPredio.length && allBounds.length > 0) {
                    safeFitBounds(map, allBounds);
                }
                return;
            }
            const arrayBuffer = await response.arrayBuffer();
            const raster = await parseGeo(arrayBuffer);
            // --- Refuerzo: verifica mapa y raster válidos antes de continuar ---
            if (!map || !map.getContainer || !document.body.contains(map.getContainer())) {
                console.warn('El mapa ya no existe, se cancela la carga de este raster.');
                return;
            }
            if (!raster || !raster.width || !raster.height) {
                console.warn('Raster inválido o corrupto:', ruta.tiff);
                return;
            }
            const bounds = calculateBounds(raster);
            allBounds.push(bounds);
            // --- Coloreado por índice espectral usando min/max de max_min_h.json ---
            // Buscar min/max para este cod_base, índice, año y semana
            let min = null, max = null;
            if (window.maxMinHData && window.maxMinHData[ruta.codigo_base] && window.maxMinHData[ruta.codigo_base][capaSeleccionada]) {
                // Buscar por año/semana primero
                const anio = ruta.anio || ruta.anio_semana || semanaSeleccionada?.split('_')[0];
                const semana = ruta.semana || ruta.semana_semana || semanaSeleccionada?.split('_')[1];
                // Buscar claves de año/semana si existen
                let minmaxSemana = null;
                if (anio && semana && window.maxMinHData[ruta.codigo_base][capaSeleccionada][anio + '_' + anio] && window.maxMinHData[ruta.codigo_base][capaSeleccionada][anio + '_' + anio][semana]) {
                    minmaxSemana = window.maxMinHData[ruta.codigo_base][capaSeleccionada][anio + '_' + anio][semana];
                } else if (anio && semana && window.maxMinHData[ruta.codigo_base][capaSeleccionada][anio] && window.maxMinHData[ruta.codigo_base][capaSeleccionada][anio][semana]) {
                    minmaxSemana = window.maxMinHData[ruta.codigo_base][capaSeleccionada][anio][semana];
                }
                if (minmaxSemana && minmaxSemana.min != null && minmaxSemana.max != null) {
                    min = minmaxSemana.min;
                    max = minmaxSemana.max;
                } else if (window.maxMinHData[ruta.codigo_base][capaSeleccionada]["absoluto"]) {
                    // Fallback a absoluto
                    min = window.maxMinHData[ruta.codigo_base][capaSeleccionada]["absoluto"].min_absoluto;
                    max = window.maxMinHData[ruta.codigo_base][capaSeleccionada]["absoluto"].max_absoluto;
                }
            }
            const palette = window.colorParams[capaSeleccionada]?.palette || window.colorParams['NDVI'].palette;
            const steps = palette.length - 1;
            function pixelValuesToColorFn(values) {
                const v = values[0];
                // Si no hay min/max válidos o el valor es nulo/NaN, hazlo transparente
                if (min === null || max === null || v === null || isNaN(v)) return null;
                // Normaliza el valor entre min y max
                const idx = Math.round(((v - min) / (max - min)) * steps);
                const color = palette[Math.max(0, Math.min(steps, idx))];
                return `#${color}`;
              }
            // Si no hay min/max válidos, no pintes el ráster (hazlo transparente)
            if (min === null || max === null) {
                console.warn('No hay min/max válidos para', ruta.codigo_base, capaSeleccionada, semanaSeleccionada, '- El ráster será transparente');
                return;
            }
            // ---
            const layer = new window.GeoRasterLayer({
                georaster: raster,
                opacity: 0.7,
                resolution: 256,
                bounds: bounds,
                pixelValuesToColorFn: pixelValuesToColorFn
            });
            // --- Función segura para agregar capas ---
            function safeAddLayer(map, layer) {
                try {
                    if (map && map.getContainer && document.body.contains(map.getContainer())) {
                        layer.addTo(map);
                    } else {
                        console.warn('No se puede agregar la capa: el mapa o su contenedor no existen.');
                    }
                } catch (e) {
                    console.error('Error agregando capa al mapa:', e);
                }
            }
            safeAddLayer(map, layer);
            // Mostrar leyenda dinámica después de agregar la capa
            renderSupervisorLegend(map, capaSeleccionada, min, max);
            // --- Borde brillante parpadeante y popup de información ---
            if (map && map.getContainer && map.getContainer() && document.body.contains(map.getContainer())) {
                const highlight = L.rectangle(bounds, {
                    color: '#ff0', // Amarillo brillante
                    weight: 4,
                    dashArray: '10,10',
                    opacity: 1,
                    fillOpacity: 0,
                    className: 'raster-highlight'
                }).addTo(map);
                let visible = true;
                const intervalId = setInterval(() => {
                    visible = !visible;
                    highlight.setStyle({ color: visible ? '#ff0' : '#fff' });
                }, 500);
                if (!map._rasterHighlightIntervals) map._rasterHighlightIntervals = [];
                map._rasterHighlightIntervals.push(intervalId);

                // --- Popup de información al hacer click ---
                highlight.on('click', async function() {
                    // Buscar info del predio
                    const cod = ruta.codigo_base;
                    // Cargar datos si no están en memoria
                    let usuarios = window._usuariosData;
                    let cultivos = window._cultivosData;
                    let localidades = window._localidadesData;
                    if (!usuarios) {
                        usuarios = await fetch('./assets/basa_data/user.json').then(r => r.json());
                        window._usuariosData = usuarios;
                    }
                    if (!cultivos) {
                        cultivos = await fetch('./assets/basa_data/cultivo.json').then(r => r.json());
                        window._cultivosData = cultivos;
                    }
                    if (!localidades) {
                        localidades = await fetch('./assets/basa_data/localidad.json').then(r => r.json());
                        window._localidadesData = localidades;
                    }
                    const user = usuarios.find(u => u.codigo_base === cod);
                    const cultivo = user ? cultivos[user.cultivo] : null;
                    const localidad = user ? localidades[user.localidad] : null;
                    const nombre = user ? (user.Nombre || user.usuario) : cod;
                    const cultivoNombre = cultivo ? cultivo.nombre : '-';
                    const localidadNombre = localidad ? localidad.nombre : '-';
                    // Popup HTML
                    const popupHtml = `
                        <div style='min-width:180px;'>
                            <strong>${nombre}</strong><br>
                            <span style='font-size:0.95em;'>Cultivo: ${cultivoNombre}<br>Localidad: ${localidadNombre}</span><br><br>
                            <a href="mapa.html?predio=${encodeURIComponent(cod)}" class="btn-ver-predio" style="display:inline-block;padding:6px 16px;background:#4caf50;color:#fff;border-radius:5px;text-decoration:none;font-weight:bold;">Ver predio</a>
                        </div>
                    `;
                    highlight.bindPopup(popupHtml).openPopup();
                });
                // ---
            }
            // ---
            console.log('TIFF agregado exitosamente al mapa:', ruta.tiff);
            loadedCount++;
            if (loadedCount === rutasPorPredio.length && allBounds.length > 0) {
                safeFitBounds(map, allBounds);
            }
        } catch (e) {
            console.error('Error cargando raster para', ruta.codigo_base, e);
            loadedCount++;
            if (loadedCount === rutasPorPredio.length && allBounds.length > 0) {
                safeFitBounds(map, allBounds);
            }
        }
    });
    updateSupervisorDescControl(map, capaSeleccionada);
    updateSupervisorTitleControl(map, capaSeleccionada); // Llama a updateSupervisorTitleControl cada vez que se cambie el índice
}

// Leyenda dinámica para el supervisor
function renderSupervisorLegend(map, capaSeleccionada, min, max) {
    if (map.legendControl) map.removeControl(map.legendControl);
    const palette = window.colorParams[capaSeleccionada]?.palette || window.colorParams['NDVI'].palette;
    map.legendControl = L.control({ position: 'bottomright' });
    map.legendControl.onAdd = () => {
        const div = L.DomUtil.create('div', 'map-legend');
        div.style.pointerEvents = 'auto';
        // Gradiente
        if (palette.length > 3) {
            const gradientColors = palette.map(color => `#${color}`).join(', ');
            div.innerHTML = `
                <div class="legend-title-container"><span class="legend-main-title">Paleta de colores (${capaSeleccionada.toUpperCase()})</span></div>
                <div class="legend-scale-container">
                    <div class="legend-gradient" style="background: linear-gradient(to right, ${gradientColors}); height: 16px; border-radius: 4px;"></div>
                </div>
            `;
        } else {
            // 3 bloques
            div.innerHTML = `
                <div class="legend-title-container"><span class="legend-main-title">Paleta de colores (${capaSeleccionada.toUpperCase()})</span></div>
                <div class="legend-scale-container" style="display:flex;flex-direction:column;align-items:center;">
                    <div style="display:flex;flex-direction:row;gap:2px;margin-bottom:4px;">
                        <div style="width:32px;height:18px;background:#${palette[0]};border:1px solid #aaa;"></div>
                        <div style="width:32px;height:18px;background:#${palette[1]};border:1px solid #aaa;"></div>
                        <div style="width:32px;height:18px;background:#${palette[2]};border:1px solid #aaa;"></div>
                    </div>
                </div>
            `;
        }
        return div;
    };
    if (map && map.getContainer && document.body.contains(map.getContainer())) {
        map.legendControl.addTo(map);
    }
}

// Ajusta el mapa a los bounds combinados de todos los rásteres
function fitAllBounds(map, boundsArray) {
    if (!boundsArray || boundsArray.length === 0) return;
    let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
    boundsArray.forEach(b => {
        if (!b || !b[0] || !b[1]) return;
        minLat = Math.min(minLat, b[0][0]);
        minLng = Math.min(minLng, b[0][1]);
        maxLat = Math.max(maxLat, b[1][0]);
        maxLng = Math.max(maxLng, b[1][1]);
    });
    if (!isFinite(minLat) || !isFinite(minLng) || !isFinite(maxLat) || !isFinite(maxLng)) return;
    const combinedBounds = [[minLat, minLng], [maxLat, maxLng]];
    // --- Función segura para ajustar bounds ---
    function safeFitBounds(map, bounds) {
        if (map && map.getContainer && document.body.contains(map.getContainer())) {
            map.fitBounds(bounds);
        }
    }
    safeFitBounds(map, combinedBounds);
}

// Exponer funciones globalmente
window.initSupervisorMap = initSupervisorMap;
window.addAllRastersToSupervisorMap = addAllRastersToSupervisorMap;