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

// Paletas de colores y umbrales fijos por índice
const colorThresholds = {
  NDVI: {
    thresholds: [-1, 1],
    colors: [ '#00a000'] // Bajo, Medio, Alto
  },
  NDMI: {
    thresholds: [-1, 1],
    colors: ['#fee090']
   },
   EVI: {
    thresholds: [-1, 1],
    colors: ['#0a5c32'] // Bajo, Medio, Alto
    },
    MSAVI: { 
      thresholds: [-1, 1],
    colors: ['#01665e']
    } // Bajo, Medio, Alto

    // Bajo, Medio, Alto
  // Puedes agregar otros índices aquí si lo deseas
};

const colorslegend = {
  NDVI: ['#ff0000', '#ffff00', '#00a000'],
    NDMI: ['#d73027', '#fee090', '#4575b4'],
    EVI: ['#ffffff', '#86c45d', '#0a5c32'],
    MSAVI: ['#8c510a', '#f6e8c3', '#01665e']
};


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
                    <button id="toggle-desc-btn" style="z-index:1001; margin-bottom:6px; background:#e9ecef; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:0.95em; color:#2c3e50;">Mostrar/ocultar descripción</button>
                    <div id="desc-text" style="font-size:0.98em; color:#333; text-align:justify; line-height:1.3; padding:0 8px; display:none;">
                        ${descripcion}
                    </div>
                </div>
            `;
            setTimeout(() => {
                const btn = div.querySelector('#toggle-desc-btn');
                const desc = div.querySelector('#desc-text');
                if (btn && desc) {
                    // Evita que el click en el botón interactúe con el mapa
                    L.DomEvent.disableClickPropagation(btn);
                    btn.addEventListener('click', (e) => {
                        desc.style.display = desc.style.display === 'none' ? '' : 'none';
                    });
                }
            }, 0);
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
    // Inicializa el diccionario global de capas de predio
    window.codBaseLayerMap = {};
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
    let userColorList = [];
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
            // --- Coloreado por mediana y paleta de colorslegend ---
            const index = capaSeleccionada.toUpperCase();
            const legendColors = colorslegend[index];
            // Calcular la mediana de los valores del ráster
            let values = [];
            if (raster && raster.readRasters) {
                // Extraer todos los valores válidos (no nulos, no NaN)
                const data = await raster.readRasters();
                for (let i = 0; i < data[0].length; i++) {
                    const v = data[0][i];
                    if (v !== null && !isNaN(v)) values.push(v);
                }
            }
            let mediana = 0;
            if (values.length > 0) {
                values.sort((a, b) => a - b);
                const mid = Math.floor(values.length / 2);
                mediana = values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
            }
            const min = Math.min(...values);
            const max = Math.max(...values);
            // Definir función de color por rango: [min, mediana, max]
            function pixelValuesToColorFn(values) {
                const v = values[0];
                if (v === null || isNaN(v) || !legendColors) return null;
                if (v < mediana) {
                    // Bajo
                    return v < (min + (mediana - min) / 2) ? legendColors[0] : legendColors[1];
                } else {
                    // Alto
                    return v < (mediana + (max - mediana) / 2) ? legendColors[1] : legendColors[2];
                }
            }
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
                    if (!map || !map.getContainer || !document.body.contains(map.getContainer())) {
                        console.warn('No se puede agregar la capa: el mapa o su contenedor no existen.');
                        return;
                    }
                    layer.addTo(map);
                } catch (e) {
                    console.error('Error agregando capa al mapa:', e);
                }
            }
            safeAddLayer(map, layer);
            // Mostrar leyenda dinámica después de agregar la capa
            renderSupervisorLegend(map, capaSeleccionada, min, mediana, max);
            // --- Borde brillante y popup de información ---
            const codNorm = (ruta.codigo_base || '').trim().toLowerCase();
            const bordeColor = (window.codBaseColors && window.codBaseColors[codNorm]) ? window.codBaseColors[codNorm] : '#ff0';
            const highlight = addRasterHighlight(map, bounds, bordeColor);
            if (highlight) {
                // --- Guardar referencia global para zoom/resaltado ---
                window.codBaseLayerMap[codNorm] = highlight;
                highlight.on('click', async function() {
                    // Buscar info del predio
                    const cod = ruta.codigo_base;
                    // Cargar datos si no están en memoria
                    let usuarios = window._usuariosData;
                    let cultivos = window._cultivosData;
                    let localidades = window._localidadData;
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
                        window._localidadData = localidades;
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
            }
            // Agregar a la lista de usuarios para la leyenda
            let usuarios = window._usuariosData;
            if (!usuarios) {
                usuarios = await fetch('./assets/basa_data/user.json').then(r => r.json());
                window._usuariosData = usuarios;
            }
            const user = usuarios.find(u => u.codigo_base === ruta.codigo_base);
            const nombre = user ? (user.Nombre || user.usuario) : ruta.codigo_base;
            // Evitar duplicados
            if (!userColorList.some(u => u.codigo_base === ruta.codigo_base)) {
                userColorList.push({ codigo_base: ruta.codigo_base, nombre, color: bordeColor });
            }
            // ---
            console.log('TIFF agregado exitosamente al mapa:', ruta.tiff);
            loadedCount++;
            if (loadedCount === rutasPorPredio.length && allBounds.length > 0) {
                safeFitBounds(map, allBounds);
                // Mostrar la leyenda de usuarios y colores
                renderUserColorLegend(map, userColorList);
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
    // Usar la paleta y umbrales definidos en colorThresholds
    const index = capaSeleccionada.toUpperCase();
    const config = colorThresholds[index];
    const legendColors = colorslegend[index] || (config ? config.colors : undefined);
    map.legendControl = L.control({ position: 'bottomright' });
    map.legendControl.onAdd = () => {
        const div = L.DomUtil.create('div', 'map-legend');
        div.style.pointerEvents = 'auto';
        if (legendColors) {
            // Leyenda de 3 bloques con etiquetas
            div.innerHTML = `
                <div class="legend-title-container"><span class="legend-main-title">Estado Predial   (${index})</span></div>
                <div class="legend-scale-container" style="display:flex;flex-direction:row;gap:8px;margin-bottom:4px;justify-content:center;">
                    <div style="display:flex;flex-direction:column;align-items:center;">
                        <div style="width:32px;height:18px;background:${legendColors[0]};border:1px solid #aaa;"></div>
                        <span style="font-size:0.85em;">Malo</span>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;">
                        <div style="width:32px;height:18px;background:${legendColors[1]};border:1px solid #aaa;"></div>
                        <span style="font-size:0.85em;">Regular</span>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;">
                        <div style="width:32px;height:18px;background:${legendColors[2]};border:1px solid #aaa;"></div>
                        <span style="font-size:0.85em;">Bueno</span>
                    </div>
                </div>
            `;
        } else {
            div.innerHTML = `<span style='color:#c00;'>No hay paleta definida para ${index}</span>`;
        }
        return div;
    };
    if (map && map.getContainer && document.body.contains(map.getContainer())) {
        map.legendControl.addTo(map);
    }
}

// Leyenda de usuarios y colores de borde
function renderUserColorLegend(map, userColorList) {
    if (map.userColorLegendControl) map.removeControl(map.userColorLegendControl);
    map.userColorLegendControl = L.control({ position: 'bottomleft' });
    map.userColorLegendControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'user-color-legend');
        div.style.background = '#fff';
        div.style.padding = '8px 12px';
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        div.style.fontSize = '0.97em';
        div.innerHTML = `<div style='font-weight:bold; margin-bottom:6px;'>Predios a cargo</div>
            <button id="toggle-user-legend-btn" style="z-index:1001; margin-bottom:6px; background:#e9ecef; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:0.95em; color:#2c3e50;">Mostrar/ocultar leyenda</button>
            <div id="user-legend-content" style="display:none;">${userColorList.map(u => `
                <div style='display:flex;align-items:center;gap:8px;margin-bottom:2px;'>
                    <span style='display:inline-block;width:18px;height:12px;background:${u.color};border:1px solid #888;border-radius:3px;'></span>
                    <span>${u.nombre}</span>
                </div>`).join('')}</div>`;
        setTimeout(() => {
            const btn = div.querySelector('#toggle-user-legend-btn');
            const content = div.querySelector('#user-legend-content');
            if (btn && content) {
                L.DomEvent.disableClickPropagation(btn);
                btn.addEventListener('click', () => {
                    content.style.display = content.style.display === 'none' ? '' : 'none';
                });
            }
        }, 0);
        return div;
    };
    map.userColorLegendControl.addTo(map);
}

// Función segura para ajustar bounds (debe estar al inicio del archivo)
function safeFitBounds(map, bounds) {
    if (map && map.getContainer && document.body.contains(map.getContainer())) {
        map.fitBounds(bounds);
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
    safeFitBounds(map, combinedBounds);
}

// Función para agregar un borde resaltado a un ráster
function addRasterHighlight(map, bounds, color = '#ff0') {
    if (map && map.getContainer && map.getContainer() && document.body.contains(map.getContainer())) {
        const highlight = L.rectangle(bounds, {
            color: color, // Color personalizado
            weight: 4,
            dashArray: '10,10',
            opacity: 1,
            fillOpacity: 0,
            className: 'raster-highlight'
        }).addTo(map);
        // Eliminar parpadeo: dejar el color fijo
        // (No usar setInterval para alternar color)
        return highlight;
    }
    return null;
}

// Exponer funciones globalmente
window.initSupervisorMap = initSupervisorMap;
window.addAllRastersToSupervisorMap = addAllRastersToSupervisorMap;