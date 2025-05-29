let map; // Variable global para la instancia del mapa Leaflet

// Variable global para controlar si el usuario está arrastrando el slider side-by-side
let isDraggingSlider = false;

// Inicializa el mapa Leaflet en el elemento con id mapId
export function initMap(mapId) {
    if (map) {
        map.remove(); // Elimina el mapa anterior si existe
    }
    map = L.map(mapId).setView([-33.036, -71.381], 11); // Crea el mapa centrado en las coordenadas dadas
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '© Esri, Earthstar Geographics'
    }).addTo(map); // Añade la capa base de imágenes satelitales
    return map;
}

// Diccionario con descripciones para cada índice
const text_cont = {
    NDVI: "Qué indica: Se utiliza para cuantificar el verdor de la vegetación y es útil para comprender la densidad de la vegetación y evaluar los cambios en la salud de las plantas. Valores: Los valores del NDVI varían entre -1 y 1. Cuando obtenemos valores cercanos a 1 (entre 0.6 y 0.9), esto nos indica vegetación densa y en buen estado de salud. Valores intermedios (0.2 a 0.5) señalan vegetación moderada o en crecimiento. Los valores próximos a cero y negativos representan superficies sin vegetación, como suelo desnudo, rocas o áreas urbanas.",
    
    EVI: "Qué indica: Diseñado para áreas de vegetación densa o suelos húmedos, minimiza distorsiones atmosféricas y del suelo. Valores: Este índice presenta valores entre -1 y 1. Los valores más altos (0.5 a 1) corresponden a vegetación densa y saludable. Valores entre 0.2 y 0.4 indican vegetación moderada. Cuando los valores son inferiores a 0.1, estamos ante suelos expuestos o zonas con muy poca vegetación. Los valores negativos aparecen en superficies no vegetales como construcciones o áreas secas.",
    SAVI: "Qué indica: Analiza vegetación en zonas con mucho suelo expuesto, incorporando un factor de corrección fijo para minimizar la interferencia del suelo. Valores: Sus valores oscilan entre -1 y 1. Valores superiores a 0.4 indican buena cobertura vegetal. Cuando están entre 0.1 y 0.3, muestran vegetación escasa. Los valores menores a cero generalmente corresponden a suelos desnudos o cuerpos de agua. Este índice es particularmente valioso en zonas donde el suelo está muy expuesto.",
    GNDVI: "Qué indica: Evalúa el contenido de clorofila y estrés vegetal usando luz verde en lugar de roja, siendo más sensible a cambios tempranos en salud vegetal. Valores: Con un rango de -1 a 1, los valores superiores a 0.7 muestran plantas con alto contenido de clorofila y excelente salud. Valores entre 0.3 y 0.6 representan vegetación normal. Cuando los valores caen por debajo de 0.2, esto indica problemas como estrés hídrico o deficiencias nutricionales en las plantas, siendo especialmente útil para detectar estos problemas en etapas tempranas.",
    LAI: "Índice de Área Foliar",
    NDMI: "Qué indica: Mide específicamente el contenido de humedad en las hojas usando infrarrojo cercano y de onda corta, ideal para detectar estrés hídrico. Valores: Sus valores van de -1 a 1. Valores mayores a 0.4 muestran alta humedad foliar (plantas bien hidratadas). Valores entre 0 y 0.3 indican humedad normal. Los valores negativos señalan sequía o estrés hídrico severo. Este índice es clave para la gestión eficiente del riego en agricultura.",
    GCI: "Índice de Clorofila Verde",
    MSAVI: "Qué indica: Versión mejorada del SAVI que ajusta automáticamente la corrección del suelo sin necesidad de parámetros fijos. Valores: Con valores entre 0 y 1, los resultados superiores a 0.6 señalan vegetación densa. Valores entre 0.2 y 0.5 indican vegetación moderada. Cuando los valores son inferiores a 0.2, nos encontramos ante suelos sin actividad fotosintética significativa. La ventaja de este índice es que se ajusta automáticamente a las condiciones del terreno.",
    NDWI: "Qué indica: Detecta contenido de agua en vegetación y presencia de cuerpos de agua mediante la reflectancia de luz verde e infrarroja. Valores: Sus valores van de -1 a 1. Valores mayores a 0.3 identifican cuerpos de agua o vegetación muy húmeda. Los valores entre 0 y 0.2 muestran humedad moderada. Cuando los valores son negativos, indican zonas secas. Este índice es fundamental para el monitoreo de recursos hídricos.",
    MNDWI: "Qué indica: Versión mejorada del NDWI que usa infrarrojo de onda corta para distinguir mejor el agua en zonas urbanas o con suelos secos. Valores: También con rango de -1 a 1, valores superiores a 0.5 corresponden a agua superficial clara. Valores entre 0 y 0.3 indican humedad en suelo o vegetación. Los valores negativos señalan áreas secas o estructuras artificiales."
};

// Paletas de colores y opacidad para cada índice
const colorParams = {
    NDVI: {
      opacity: 1,
      palette: ['ffffff', 'ce7e45', 'df923d', 'f1b555', 'fcd163', '99b718', '74a901', '66a000', '529400', '3e8601', '207401', '056201', '004c00', '023b01', '012e01', '011d01', '011301']
    },
    EVI: {
      opacity: 1,
      palette: ['ffffff', 'f7f7b0', 'e6f59b', 'c6ea7f', 'a6d96a', '86c45d', '66bd63', '46a356', '2e8b4a', '1a753e', '0a5c32']
    },
    SAVI: {
      opacity: 1,
      palette: ['8b4513', 'a05a2c', 'b56f45', 'ca855e', 'df9a77', 'f4b090', 'd5c293', 'b6d496', '97e699', '60c67d', '399565']
    },
    GNDVI: {
      opacity: 1,
      palette: ['ff0000', 'ff4500', 'ff8c00', 'ffd700', 'ffff00', 'adff2f', '69d500', '32cd32', '008000', '006400']
    },
    LAI: {
      opacity: 1,
      palette: ['ffffff', 'e0f3e0', 'c1e7c1', 'a2dba2', '83cf83', '64c364', '45b745', '26ab26', '068b06', '005c00']
    },
    NDMI: {
      opacity: 1,
      palette: ['8b0000', 'ff0000', 'ffa07a', 'ffffff', 'add8e6', '0000ff', '00008b']
    },
    GCI: {
      opacity: 1,
      palette: ['b2182b', 'ef8a62', 'fddbc7', 'f7f7f7', 'b5c6d0', '5890b0', '2166ac']
    },
    MSAVI: {
      opacity: 1,
      palette: ['8c510a', 'bf812d', 'dfc27d', 'f6e8c3', 'b9d9d4', '80cdc1', '35978f', '01665e']
    },
    NDWI: {
      opacity: 1,
      palette: ["d73027", "fc8d59", "fee090", "e0f3f8", "91bfdb", "4575b4"]
    },
    MNDWI: {
      opacity: 1,
      palette: ['a50026', 'd75926', 'f46d43', 'fdae61', 'fee08b', 'e6f598', 'abdda4', '66bd63', '1a9850', '006837']
    }
  };
  
// Devuelve los parámetros de color para la capa seleccionada
export function getColorParams(capaSeleccionada) {
    return colorParams[capaSeleccionada.toUpperCase()]; // Busca por nombre en mayúsculas
}

// Calcula el valor mínimo y máximo de un raster, ignorando valores noData
function getRasterMinMax(georaster) {
    let min = Infinity, max = -Infinity;
    const noData = georaster.noDataValue;
    const values = georaster.values[0];
    for (let y = 0; y < values.length; y++) {
        for (let x = 0; x < values[0].length; x++) {
            const v = values[y][x];
            if (v === null || v === undefined || isNaN(v) || v === noData) continue;
            if (v < min) min = v;
            if (v > max) max = v;
        }
    }
    return { min, max };
}

// Carga un raster GeoTIFF y crea la capa Leaflet correspondiente
export async function loadGeoRasterLayer(url, mapInstance, capaSeleccionada, georasterHistorico = null) {
    try {
        const response = await fetch(url); // Descarga el archivo TIFF
        const arrayBuffer = await response.arrayBuffer(); // Lo convierte a ArrayBuffer
        const georaster = await parseGeoraster(arrayBuffer); // Parsea el raster
        const params = getColorParams(capaSeleccionada); // Obtiene la paleta de colores

        // Calcula min/max del raster actual
        const { min: minAct, max: maxAct } = getRasterMinMax(georaster);

        // Si hay raster histórico, calcula también su min/max
        let minHist = null, maxHist = null;
        if (georasterHistorico) {
            const minMaxHist = getRasterMinMax(georasterHistorico);
            minHist = minMaxHist.min;
            maxHist = minMaxHist.max;
        }

        // Calcula el mínimo absoluto y el máximo absoluto entre ambos raster
        let minAbs = minAct, maxAbs = maxAct;
        if (minHist !== null && maxHist !== null) {
            minAbs = Math.min(minAct, minHist);
            maxAbs = Math.max(maxAct, maxHist);
        }

        // Elimina controles anteriores del mapa (título, leyenda, etc.)
        [mapInstance.titleControl, mapInstance.legendControl, mapInstance.legendControlLeft].forEach(control => {
            if (control) {
                mapInstance.removeControl(control);
                control = null;
            }
        });

        // Control de título (arriba a la derecha)
        mapInstance.titleControl = L.control({ position: 'topright' });
        mapInstance.titleControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'map-title');
            div.innerHTML = `
                <div class="legend-title-container">
                    <span class="legend-main-title">Índice de Vegetación</span>
                    <span class="legend-layer-name">${capaSeleccionada.toUpperCase()}</span>
                </div>
            `;
            return div;
        };
        mapInstance.titleControl.addTo(mapInstance);



        // Control independiente para la descripción del índice (arriba a la izquierda)
        function addOrUpdateDescriptionControl(mapInstance, capaSeleccionada) {
            if (mapInstance.descControl) {
                mapInstance.removeControl(mapInstance.descControl);
                mapInstance.descControl = null;
            }
            const descripcion = text_cont[capaSeleccionada.toUpperCase()] || "";
            if (!descripcion) return;

            mapInstance.descControl = L.control({ position: 'topleft' });
            mapInstance.descControl.onAdd = function() {
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
            mapInstance.descControl.addTo(mapInstance);
        }

        // Agrega/actualiza el control de descripción independiente
        addOrUpdateDescriptionControl(mapInstance, capaSeleccionada);

        // Leyenda vertical (abajo a la derecha) usando minAbs y maxAbs
        mapInstance.legendControl = L.control({ position: 'bottomright' });
        mapInstance.legendControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'map-legend');
            const gradientColors = params.palette.map(color => `#${color}`).join(', ');
            div.innerHTML = `
                <div class="legend-title-container">
                    <span class="legend-main-title">${capaSeleccionada.toUpperCase()}</span>
                    <span class="legend-layer-type" style="font-weight:bold; color:#34495e; font-size:0.9em;">Actual</span>
                </div>
                <div class="legend-scale-container">
                    <div class="legend-gradient" style="background: linear-gradient(to right, ${gradientColors})"></div>
                    <div class="legend-values" style="font-size:0.85em;">
                        <span style="margin-right:10px;">MinAbs: <span style="font-size:0.95em;">${minAbs.toFixed(2)}</span></span>
                        <span>MaxAbs: <span style="font-size:0.95em;">${maxAbs.toFixed(2)}</span></span>
                    </div>
                </div>
            `;
            return div;
        };
        mapInstance.legendControl.addTo(mapInstance);

        // Crea la capa raster Leaflet usando la paleta y los valores absolutos
        const rasterLayer = new GeoRasterLayer({
            georaster,
            resolution: 256,
            pixelValuesToColorFn: values => {
                const value = values[0];
                if (value === null || value === undefined || isNaN(value) || value === georaster.noDataValue) {
                    return "transparent";
                }
                // Normaliza el valor usando minAbs y maxAbs
                const clampedValue = Math.max(minAbs, Math.min(value, maxAbs));
                const normalized = (clampedValue - minAbs) / (maxAbs - minAbs);
                const index = Math.floor(normalized * (params.palette.length - 1));
                return `#${params.palette[Math.max(0, Math.min(index, params.palette.length - 1))]}`;
            },
            opacity: params.opacity
        });
        
        return { rasterLayer, georaster }; // Devuelve la capa y el raster
    } catch (error) {
        console.error('Error al cargar el GeoTIFF:', error);
        throw error;
    }
}

// Calcula los límites geográficos del raster para ajustar el mapa
export function calculateBounds(georaster) {
    const xmin = georaster.xmin;
    const xmax = georaster.xmax;
    const ymin = georaster.ymin;
    const ymax = georaster.ymax;
    return [[ymin, xmin], [ymax, xmax]]; // Formato Leaflet: [suroeste, noreste]
}

// Habilita el popup de valores de raster al hacer click en el mapa
export function enableRasterValuePopup(mapInstance, rasterLayer, layerName, georaster, rasterLayer2, layerName2, georaster2, capaSeleccionada) {
    // Remueve listeners previos para evitar duplicados
    mapInstance.off("click");
    mapInstance.off("dblclick");

    // Manejo de eventos para el slider side-by-side (desactiva popup mientras se arrastra)
    setTimeout(() => {
        const rangeInput = document.querySelector('.leaflet-sbs-range');
        if (rangeInput) {
            rangeInput.addEventListener('mousedown', function(e) {
                isDraggingSlider = true;
            });
            rangeInput.addEventListener('touchstart', function(e) {
                isDraggingSlider = true;
            });
            rangeInput.addEventListener('mouseup', function(e) {
                setTimeout(() => { isDraggingSlider = false; }, 10);
            });
            rangeInput.addEventListener('touchend', function(e) {
                setTimeout(() => { isDraggingSlider = false; }, 10);
            });
            rangeInput.addEventListener('mouseleave', function(e) {
                setTimeout(() => { isDraggingSlider = false; }, 10);
            });
        }
    }, 200);

    // Evento click en el mapa para mostrar popup con valores de ambos raster
    mapInstance.on("click", function (e) {
        if (isDraggingSlider) return; // No mostrar popup si se está arrastrando el slider

        const { lat, lng } = e.latlng;
        try {
            // Obtiene el valor del raster actual en la ubicación clickeada
            let value1 = null, value2 = null;
            let value1Text = "", value2Text = "";

            // Valor actual
            if (
                lng >= georaster.xmin && lng <= georaster.xmax &&
                lat >= georaster.ymin && lat <= georaster.ymax
            ) {
                const x = (lng - georaster.xmin) / georaster.pixelWidth;
                const y = (georaster.ymax - lat) / georaster.pixelHeight;
                const pixelX = Math.round(x);
                const pixelY = Math.round(y);
                if (
                    georaster.values[0][pixelY] &&
                    typeof georaster.values[0][pixelY][pixelX] !== "undefined"
                ) {
                    value1 = georaster.values[0][pixelY][pixelX];
                }
                if (value1 === undefined || value1 === null) {
                    value1Text = "Sin datos en esta ubicación";
                } else if (isNaN(value1)) {
                    value1Text = "Valor no numérico (NaN)";
                } else {
                    value1Text = value1.toFixed(3);
                }
            } else {
                value1Text = "Fuera de los límites del raster";
            }

            // Valor histórico (si existe)
            if (georaster2 && georaster2.values && georaster2.values[0]) {
                if (
                    lng >= georaster2.xmin && lng <= georaster2.xmax &&
                    lat >= georaster2.ymin && lat <= georaster2.ymax
                ) {
                    const x2 = (lng - georaster2.xmin) / georaster2.pixelWidth;
                    const y2 = (georaster2.ymax - lat) / georaster2.pixelHeight;
                    const pixelX2 = Math.round(x2);
                    const pixelY2 = Math.round(y2);
                    if (
                        georaster2.values[0][pixelY2] &&
                        typeof georaster2.values[0][pixelY2][pixelX2] !== "undefined"
                    ) {
                        value2 = georaster2.values[0][pixelY2][pixelX2];
                    }
                    if (value2 === undefined || value2 === null) {
                        value2Text = "Sin datos en esta ubicación";
                    } else if (isNaN(value2)) {
                        value2Text = "Valor no numérico (NaN)";
                    } else {
                        value2Text = value2.toFixed(3);
                    }
                } else {
                    value2Text = "Fuera de los límites del raster";
                }
            } else {
                value2Text = "No disponible";
            }

            // Contenido del popup con ambos valores
            let content = `
                <div class="legend-title-container">
                    <span class="legend-main-title">Valores</span>
                    <span>Actual: <span class="legend-layer-name">${isNaN(value1Text) ? value1Text : Number(value1Text).toFixed(2)}</span></span>
                    <span>Histórico: <span class="legend-layer-name">${isNaN(value2Text) ? value2Text : Number(value2Text).toFixed(2)}</span></span>
                </div>
            `;
            // Muestra el popup (no se cierra con otro click, solo con doble click)
            mapInstance.closePopup();
            L.popup({ autoClose: false, closeOnClick: false })
                .setLatLng([lat, lng])
                .setContent(content)
                .openOn(mapInstance);
        } catch (error) {
            mapInstance.closePopup();
            L.popup({ autoClose: false, closeOnClick: false })
                .setLatLng([lat, lng])
                .setContent("Error al leer el píxel")
                .openOn(mapInstance);
        }
    });

    // Cierra el popup con doble click en el mapa
    mapInstance.on("dblclick", function () {
        mapInstance.closePopup();
    });
}

// Inicializa el control side-by-side para comparar dos capas raster
export function initSideBySide(mapInstance, leftLayer, rightLayer) {
    // Elimina el control anterior si existe
    if (mapInstance._sideBySideControl) {
        mapInstance.removeControl(mapInstance._sideBySideControl);
        mapInstance._sideBySideControl = null;
    }
    // Elimina el slider manualmente si quedó en el DOM
    const oldSlider = document.querySelector('.leaflet-sbs-divider');
    if (oldSlider && oldSlider.parentNode) {
        oldSlider.parentNode.removeChild(oldSlider);
    }
    // Elimina solo capas raster anteriores (GeoRasterLayer), NO el mapa base
    mapInstance.eachLayer(layer => {
        if (layer.constructor && layer.constructor.name === "GeoRasterLayer" && layer !== leftLayer && layer !== rightLayer) {
            mapInstance.removeLayer(layer);
        }
    });
    // Asegura que ambas capas estén en el mapa antes de crear el control
    if (leftLayer && !mapInstance.hasLayer(leftLayer)) {
        leftLayer.addTo(mapInstance);
    }
    if (rightLayer && !mapInstance.hasLayer(rightLayer)) {
        rightLayer.addTo(mapInstance);
    }
    // AGREGA el control side-by-side y el slider
    setTimeout(() => {
        if (window.L && window.L.control && window.L.control.sideBySide) {
            mapInstance._sideBySideControl = window.L.control.sideBySide(leftLayer, rightLayer).addTo(mapInstance);

            // Solo permitir mover el slider si el usuario arrastra el thumb
            const rangeInput = document.querySelector('.leaflet-sbs-range');
            if (rangeInput) {
                rangeInput.style.pointerEvents = "none";
                rangeInput.addEventListener('mousedown', function(e) {
                    rangeInput.style.pointerEvents = "auto";
                });
                rangeInput.addEventListener('touchstart', function(e) {
                    rangeInput.style.pointerEvents = "auto";
                });
                rangeInput.addEventListener('mouseup', function(e) {
                    rangeInput.style.pointerEvents = "none";
                });
                rangeInput.addEventListener('touchend', function(e) {
                    rangeInput.style.pointerEvents = "none";
                });
                rangeInput.addEventListener('mouseleave', function(e) {
                    rangeInput.style.pointerEvents = "none";
                });
            }

            // Agrega etiquetas "Histórico" (izquierda) y "Actual" (derecha)
            // Elimina etiquetas previas si existen
            const prevLabels = document.querySelectorAll('.sbs-label-historico, .sbs-label-actual');
            prevLabels.forEach(el => el.parentNode.removeChild(el));
            // Crea y posiciona las etiquetas
            const mapContainer = mapInstance.getContainer();

            // Estilos base para ambos labels
            const labelBaseStyle = `
                position: absolute;
                top: 18px;
                z-index: 999;
                background: rgba(255,255,255,0.85);
                padding: 3px 12px;
                border-radius: 6px;
                font-weight: bold;
                color: #2c3e50;
                box-shadow: 0 1px 4px rgba(0,0,0,0.08);
                font-size: 1em;
                pointer-events: none;
                transition: left 0.2s, right 0.2s;
            `;

            // Media query para móvil (max-width: 600px)
            const mobileStyle = `
                @media (max-width:600px) {
                    .sbs-label-historico, .sbs-label-actual {
                        top: 10px !important;
                        font-size: 0.95em !important;
                        padding: 2px 8px !important;
                    }
                    .sbs-label-historico { left: 50px !important; }
                    .sbs-label-actual { right: 60px !important; }
                }
            `;
            // Inserta el style solo una vez
            if (!document.getElementById('sbs-label-mobile-style')) {
                const styleTag = document.createElement('style');
                styleTag.id = 'sbs-label-mobile-style';
                styleTag.innerHTML = mobileStyle;
                document.head.appendChild(styleTag);
            }

            // Etiqueta izquierda (Histórico)
            const leftLabel = document.createElement('div');
            leftLabel.className = 'sbs-label-historico';
            leftLabel.innerText = 'Histórico';
            leftLabel.setAttribute('style', labelBaseStyle + 'left: 500px; right: auto;');
            // Etiqueta derecha (Actual)
            const rightLabel = document.createElement('div');
            rightLabel.className = 'sbs-label-actual';
            rightLabel.innerText = 'Actual';
            rightLabel.setAttribute('style', labelBaseStyle + 'right: 500px; left: auto;');
            // Agrega al contenedor del mapa
            mapContainer.appendChild(leftLabel);
            mapContainer.appendChild(rightLabel);
        } else {
            console.log('Leaflet sideBySide control not found');
        }
    }, 100);
}

// En renderDualLegends:
function getLegendHtml(capa, georaster, tipo) {
    // Calcula min y max SOLO del raster correspondiente (izquierda o derecha)
    const { min, max } = getRasterMinMax(georaster);
    // ...existing code...
}

// Renderiza la leyenda usando los valores absolutos de ambos raster
export function renderDualLegends(mapInstance, capaSeleccionada, georasterActual, georasterHistorico, semanaActual, semanaHistorico) {
    // Elimina leyendas anteriores
    [mapInstance.legendControl, mapInstance.legendControlLeft].forEach(control => {
        if (control) {
            mapInstance.removeControl(control);
        }
    });

    const params = getColorParams(capaSeleccionada);

    // Calcula min/max de ambos raster
    const { min: minAct, max: maxAct } = getRasterMinMax(georasterActual);
    const { min: minHist, max: maxHist } = getRasterMinMax(georasterHistorico);

    // Calcula los valores absolutos para la leyenda
    const minAbs = Math.min(minAct, minHist);
    const maxAbs = Math.max(maxAct, maxHist);

    mapInstance.legendControl = L.control({ position: 'bottomright' });
    mapInstance.legendControl.onAdd = () => {
        const div = L.DomUtil.create('div', 'map-legend');
        const gradientColors = params.palette.map(color => `#${color}`).join(', ');
        div.innerHTML = `
            <div class="legend-title-container">
                <span class="legend-main-title">${capaSeleccionada.toUpperCase()}</span>
                <span class="legend-layer-type" style="font-weight:bold; color:#34495e; font-size:0.9em;">
                    Actual <span style="color:#888;font-weight:normal; text-decoration:underline;">Semana ${semanaActual}</span>
                </span>
            </div>
            <div class="legend-scale-container">
                <div class="legend-gradient" style="background: linear-gradient(to right, ${gradientColors})"></div>
                <div class="legend-values" style="font-size:0.85em;">
                    <span style="margin-right:10px;">MinAbs: <span style="font-size:0.95em;">${minAbs.toFixed(2)}</span></span>
                    <span>MaxAbs: <span style="font-size:0.95em;">${maxAbs.toFixed(2)}</span></span>
                </div>
            </div>
        `;
        return div;
    };
    mapInstance.legendControl.addTo(mapInstance);

    // Elimina la creación de legendControlLeft (histórica)
    // ...existing code...
}

// Cuando tengas ambos georasters y la capa seleccionada, llama así:
// renderDualLegends(mapInstance, capaSeleccionada, georasterActual, georasterHistorico);
