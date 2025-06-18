// Importar la función para obtener el mínimo y máximo absolutos
import { getMinMaxFromJson, getAltPaletteMinMax } from './map_calculater/getAbsoluteMinMax.js';

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
    window.map = map; // <-- Exponer la instancia globalmente para el slider
    return map;
}

// Diccionario con descripciones para cada índice
const text_cont = {
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

// Paletas de colores y opacidad para cada índice
const colorParams = {
    NDVI: {
      palette: ['ffffff', 'ce7e45', 'df923d', 'f1b555', 'fcd163', '99b718', '74a901', '66a000', '529400', '3e8601', '207401', '056201', '004c00', '023b01', '012e01', '011d01', '011301']
    },
    EVI: {
      palette: ['ffffff', 'f7f7b0', 'e6f59b', 'c6ea7f', 'a6d96a', '86c45d', '66bd63', '46a356', '2e8b4a', '1a753e', '0a5c32']
    },
    SAVI: {
      palette: ['8b4513', 'a05a2c', 'b56f45', 'ca855e', 'df9a77', 'f4b090', 'd5c293', 'b6d496', '97e699', '60c67d', '399565']
    },
    GNDVI: {
      palette: ['ff0000', 'ff4500', 'ff8c00', 'ffd700', 'ffff00', 'adff2f', '69d500', '32cd32', '008000', '006400']
    },
    LAI: {
      palette: ['ffffff', 'e0f3e0', 'c1e7c1', 'a2dba2', '83cf83', '64c364', '45b745', '26ab26', '068b06', '005c00']
    },
    NDMI: {
      palette: ['8b0000', 'ff0000', 'ffa07a', 'ffffff', 'add8e6', '0000ff', '00008b']
    },
    GCI: {
      palette: ['b2182b', 'ef8a62', 'fddbc7', 'f7f7f7', 'b5c6d0', '5890b0', '2166ac']
    },
    MSAVI: {
      palette: ['8c510a', 'bf812d', 'dfc27d', 'f6e8c3', 'b9d9d4', '80cdc1', '35978f', '01665e']
    },
    NDWI: {
      palette: ["d73027", "fc8d59", "fee090", "e0f3f8", "91bfdb", "4575b4"]
    },
    MNDWI: {
      palette: ['a50026', 'd75926', 'f46d43', 'fdae61', 'fee08b', 'e6f598', 'abdda4', '66bd63', '1a9850', '006837']
    }
  };
  
// Nueva paleta de colores alternativa (paleta corta) "ff0000", "ffff00", "006400"
const colorParamsAlt = {
    NDVI: { palette: ["ffffff", "fcd163", "011301"] },
    EVI: { palette: ["ff0000", "ffff00", "006400"] },
    SAVI: { palette: ["8b4513", "f4b090", "399565"] },
    GNDVI: { palette: ["ff0000", "ffff00", "006400"] },
    LAI: { palette: ["ffffff", "64c364", "005c00"] },
    NDMI: { palette: ["8b0000", "ffffff", "00008b"] },
    GCI: { palette: ["b2182b", "f7f7f7", "2166ac"] },
    MSAVI: { palette: ["8c510a", "f6e8c3", "01665e"] },
    NDWI: { palette: ["d73027", "fee090", "4575b4"] },
    MNDWI: { palette: ["a50026", "fee08b", "006837"] }
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
export async function loadGeoRasterLayer(url) {
    const response = await fetch(url); // Descarga el archivo TIFF
    const arrayBuffer = await response.arrayBuffer(); // Lo convierte a ArrayBuffer
    const georaster = await parseGeoraster(arrayBuffer); // Parsea el raster
    return georaster;
}

// Modifica createRasterLayerWithPalette para aceptar min/max personalizados
export function createRasterLayerWithPalette(georaster, minRange, maxRange, palette) {
    return new GeoRasterLayer({
        georaster,
        resolution: 256,
        pixelValuesToColorFn: values => {
            const value = values[0];
            if (value === null || value === undefined || isNaN(value) || value === georaster.noDataValue) {
                return "transparent";
            }
            const clampedValue = Math.max(minRange, Math.min(value, maxRange));
            const normalized = (clampedValue - minRange) / (maxRange - minRange);
            const index = Math.floor(normalized * (palette.length - 1));
            return `#${palette[Math.max(0, Math.min(index, palette.length - 1))]}`;
        },
        opacity: 1
    });
}

// Nueva función para sincronizar ambos rasters y la leyenda
export async function syncRastersAndLegend(mapInstance, capaSeleccionada, georasterActual, georasterHistorico, semanaActual, semanaHistorico, codigoBase) {
    // Obtener min/max desde JSON para cada raster
    let minActual, maxActual, minHistorico, maxHistorico;
    try {
        const abs = await getMinMaxFromJson(codigoBase, capaSeleccionada);
        minActual = abs.min_actual;
        maxActual = abs.max_actual;
        minHistorico = abs.min_historico;
        maxHistorico = abs.max_historico;
    } catch (e) {
        // Fallback: usar valores por defecto si no hay datos
        minActual = minHistorico = 0;
        maxActual = maxHistorico = 1;
        console.warn('No min/max data for', codigoBase, capaSeleccionada, e);
    }
    const palette = getActivePalette(capaSeleccionada);

    // Eliminar capas anteriores
    if (mapInstance.rasterLayerLeft) mapInstance.removeLayer(mapInstance.rasterLayerLeft);
    if (mapInstance.rasterLayerRight) mapInstance.removeLayer(mapInstance.rasterLayerRight);

    // Crear y agregar ambos rasters con sus rangos respectivos
    mapInstance.rasterLayerLeft = createRasterLayerWithPalette(georasterHistorico, minHistorico, maxHistorico, palette);
    mapInstance.rasterLayerRight = createRasterLayerWithPalette(georasterActual, minActual, maxActual, palette);
    mapInstance.rasterLayerLeft.addTo(mapInstance);
    mapInstance.rasterLayerRight.addTo(mapInstance);

    // Guardar para recarga rápida
    mapInstance._lastGeoRasters = {
        [capaSeleccionada]: {
            georasterActual,
            georasterHistorico,
            minActual,
            maxActual,
            minHistorico,
            maxHistorico
        }
    };

    // Actualizar leyenda (solo con el rango del actual)
    renderDualLegends(mapInstance, capaSeleccionada, georasterActual, georasterHistorico, semanaActual, semanaHistorico, minActual, maxActual);
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
            // Eliminar el cierre automático del popup al soltar el slider
            // (No cerrar el popup aquí)
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
                    value1Text = "Imagen con un 50% de Nubosidad";
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
                        value2Text = "Imagen con un 50% de Nubosidad";
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

/**
 * Crea un slider de opacidad vertical personalizado sobre el mapa.
 * Controla la opacidad de las capas leftLayer (Histórico) y rightLayer (Actual).
 * El slider aparece centrado y permite ajustar la opacidad de ambas capas.

 */
export function createOpacitySlider(mapInstance, leftLayer, rightLayer) {
    // Elimina slider anterior si existe
    const prevSlider = document.getElementById('opacity-slider-container');
    if (prevSlider && prevSlider.parentNode) {
        prevSlider.parentNode.removeChild(prevSlider);
    }

    // Crea el contenedor del slider
    const sliderContainer = document.createElement('div');
    sliderContainer.id = 'opacity-slider-container';
    sliderContainer.style.position = 'absolute';
    sliderContainer.style.top = '50%';
    sliderContainer.style.left = '50%';
    sliderContainer.style.transform = 'translate(-50%, -50%)';
    sliderContainer.style.zIndex = '10001';
    sliderContainer.style.background = 'rgba(255,255,255,0.95)';
    sliderContainer.style.borderRadius = '12px';
    sliderContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.13)';
    sliderContainer.style.padding = '18px 10px 18px 10px';
    sliderContainer.style.display = 'flex';
    sliderContainer.style.flexDirection = 'column';
    sliderContainer.style.alignItems = 'center';
    sliderContainer.style.width = '48px';
    sliderContainer.style.height = '220px';

    // Etiquetas
    const labelHist = document.createElement('div');
    labelHist.innerText = 'Hist.';
    labelHist.style.fontSize = '0.85em';
    labelHist.style.color = '#2c3e50';
    labelHist.style.marginBottom = '6px';
    sliderContainer.appendChild(labelHist);

    // Slider de opacidad (vertical)
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0.2';
    slider.max = '1';
    slider.step = '0.01';
    slider.value = rightLayer && rightLayer.options && rightLayer.options.opacity ? rightLayer.options.opacity : 1;
    slider.style.writingMode = 'bt-lr'; // vertical
    slider.style.WebkitAppearance = 'slider-vertical';
    slider.style.width = '30px';
    slider.style.height = '140px';
    slider.style.margin = '0 0 0 0';
    slider.style.cursor = 'pointer';
    slider.style.background = 'transparent';
    slider.style.accentColor = '#4CAF50';

    sliderContainer.appendChild(slider);

    // Etiqueta inferior
    const labelAct = document.createElement('div');
    labelAct.innerText = 'Act.';
    labelAct.style.fontSize = '0.85em';
    labelAct.style.color = '#2c3e50';
    labelAct.style.marginTop = '6px';
    sliderContainer.appendChild(labelAct);

    // Valor numérico
    const valueLabel = document.createElement('div');
    valueLabel.innerText = `${Math.round(slider.value * 100)}%`;
    valueLabel.style.fontSize = '0.85em';
    valueLabel.style.color = '#4CAF50';
    valueLabel.style.marginTop = '8px';
    sliderContainer.appendChild(valueLabel);

    // Evento para actualizar opacidad
    slider.addEventListener('input', function() {
        const val = parseFloat(slider.value);
        if (leftLayer && typeof leftLayer.setOpacity === 'function') leftLayer.setOpacity(val);
        if (rightLayer && typeof rightLayer.setOpacity === 'function') rightLayer.setOpacity(val);
        valueLabel.innerText = `${Math.round(val * 100)}%`;
    });

    // Añade el slider al contenedor del mapa
    const mapContainer = mapInstance.getContainer();
    mapContainer.appendChild(sliderContainer);
}



// Estado global para la paleta activa
export let useAltPalette = false;

// Función para forzar la paleta original
export function setDefaultPalette() {
    useAltPalette = false;
}

// Función para obtener la paleta activa (debe usarse en todo el render de raster y leyenda)
export function getActivePalette(capa) {
    return useAltPalette ? colorParamsAlt[capa.toUpperCase()].palette : colorParams[capa.toUpperCase()].palette;
}

// Renderiza la leyenda usando el rango absoluto de los dos rasters
export function renderDualLegends(mapInstance, capaSeleccionada, georasterActual, georasterHistorico, semanaActual, semanaHistorico, minRange, maxRange) {
    const last = mapInstance._lastGeoRasters && mapInstance._lastGeoRasters[capaSeleccionada];
    let minActual = last ? last.minActual : 0;
    let maxActual = last ? last.maxActual : 1;

    // Elimina leyendas anteriores
    [mapInstance.legendControl, mapInstance.legendControlLeft].forEach(control => {
        if (control) {
            mapInstance.removeControl(control);
        }
    });

    const params = getColorParams(capaSeleccionada);

    // Renderiza la leyenda con gradiente o bloques según la paleta
    function renderPaletteLegend(div, capa, minRange, maxRange) {
        const palette = getActivePalette(capa);
        // Paleta alternativa: muestra los umbrales especiales
        if (palette.length === 3 && typeof minRange === 'object' && minRange !== null && 'min' in minRange) {
            const { min, umbral_min, step, umbral_max, max: maxAlt } = minRange;
            div.innerHTML += `
                <div class="legend-scale-container" style="display:flex;flex-direction:column;align-items:center;">
                    <div style="display:flex;flex-direction:row;gap:2px;margin-bottom:4px;">
                        <div style="width:32px;height:18px;background:#${palette[0]};border:1px solid #aaa;"></div>
                        <div style="width:32px;height:18px;background:#${palette[1]};border:1px solid #aaa;"></div>
                        <div style="width:32px;height:18px;background:#${palette[2]};border:1px solid #aaa;"></div>
                    </div>
                    <div class="legend-values" style="font-size:0.85em;display:flex;flex-direction:column;align-items:center;width:100%;">
                        <span>Min: <span style="font-size:0.95em;">${(min ?? 'N/A').toFixed ? min.toFixed(2) : min}</span></span>
                        <span>Umbral min: <span style="font-size:0.95em;">${(umbral_min ?? 'N/A').toFixed ? umbral_min.toFixed(2) : umbral_min}</span></span>
                        <span>Step: <span style="font-size:0.95em;">${(step ?? 'N/A').toFixed ? step.toFixed(2) : step}</span></span>
                        <span>Umbral max: <span style="font-size:0.95em;">${(umbral_max ?? 'N/A').toFixed ? umbral_max.toFixed(2) : umbral_max}</span></span>
                        <span>Max: <span style="font-size:0.95em;">${(maxAlt ?? 'N/A').toFixed ? maxAlt.toFixed(2) : maxAlt}</span></span>
                    </div>
                </div>
            `;
            return;
        }
        // Paleta normal: muestra min/max reales del JSON
        const minText = (typeof minRange === 'number' && !isNaN(minRange)) ? minRange.toFixed(2) : (minRange ?? 'N/A');
        const maxText = (typeof maxRange === 'number' && !isNaN(maxRange)) ? maxRange.toFixed(2) : (maxRange ?? 'N/A');
        if (palette.length > 3) {
            // Gradiente
            const gradientColors = palette.map(color => `#${color}`).join(', ');
            div.innerHTML += `
                <div class="legend-scale-container">
                    <div class="legend-gradient" style="background: linear-gradient(to right, ${gradientColors})"></div>
                    <div class="legend-values" style="font-size:0.85em;">
                        <span style="margin-right:10px;">Min: <span style="font-size:0.95em;">${minText}</span></span>
                        <span>Max: <span style="font-size:0.95em;">${maxText}</span></span>
                    </div>
                </div>
            `;
        } else {
            // 3 bloques (por compatibilidad)
            div.innerHTML += `
                <div class="legend-scale-container" style="display:flex;flex-direction:column;align-items:center;">
                    <div style="display:flex;flex-direction:row;gap:2px;margin-bottom:4px;">
                        <div style="width:32px;height:18px;background:#${palette[0]};border:1px solid #aaa;"></div>
                        <div style="width:32px;height:18px;background:#${palette[1]};border:1px solid #aaa;"></div>
                        <div style="width:32px;height:18px;background:#${palette[2]};border:1px solid #aaa;"></div>
                    </div>
                    <div class="legend-values" style="font-size:0.85em;display:flex;justify-content:space-between;width:100%;">
                        <span>Min: <span style="font-size:0.95em;">${minText}</span></span>
                        <span>Medio</span>
                        <span>Max: <span style="font-size:0.95em;">${maxText}</span></span>
                    </div>
                </div>
            `;
        }
    }

    mapInstance.legendControl = L.control({ position: 'bottomright' });
    mapInstance.legendControl.onAdd = () => {
        const div = L.DomUtil.create('div', 'map-legend');
        div.style.pointerEvents = 'auto'; // Permitir interacción
        div.innerHTML = `
            <div class="legend-title-container">
                <span class="legend-main-title">${capaSeleccionada.toUpperCase()}</span>
                <span class="legend-layer-type" style="font-weight:bold; color:#34495e; font-size:0.9em;">
                     <span style="color:#888;font-weight:normal; text-decoration:underline;">Semana ${semanaActual}</span>
                </span>
            </div>
        `;
        renderPaletteLegend(div, capaSeleccionada, minRange, maxRange);
        div.innerHTML += `<button id="toggle-palette-btn" style="margin-top:8px;padding:4px 10px;font-size:0.9em;border-radius:6px;border:1px solid #bbb;background:#f7f7f7;cursor:pointer;">Cambiar paleta</button>`;
        setTimeout(() => {
            const btn = div.querySelector('#toggle-palette-btn');
            if (btn) {
                btn.style.pointerEvents = 'auto';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    useAltPalette = !useAltPalette;
                    // Actualiza ambos rasters y el side-by-side
                    if (last) {
                        // Siempre pasa el codigoBase correcto, incluso tras cambiar de paleta
                        let codigoBase = last.codigoBase;
                        if (!codigoBase) {
                            if (typeof usuario !== 'undefined' && usuario && usuario.codigo_base) {
                                codigoBase = usuario.codigo_base;
                            } else if (window.usuario && window.usuario.codigo_base) {
                                codigoBase = window.usuario.codigo_base;
                            }
                        }
                        updateSideBySideWithPalette(
                            mapInstance,
                            capaSeleccionada,
                            last.georasterActual,
                            last.georasterHistorico,
                            last.semanaActual,
                            last.semanaHistorico,
                            codigoBase // <-- asegura que siempre se pase el codigo base
                        );
                    }
                };
            }
        }, 10);
        return div;
    };
    mapInstance.legendControl.addTo(mapInstance);

    // Actualizar la paleta de la capa raster (si ya está en el mapa)
    if (mapInstance.rasterLayer) {
        mapInstance.removeLayer(mapInstance.rasterLayer);
    }
    // Aquí deberías volver a crear la capa raster con la nueva paleta y agregarla al mapa
    // Esto depende de cómo estés gestionando la recarga de capas, pero la lógica es:
    // 1. Crear un nuevo GeoRasterLayer con la paleta activa
    // 2. Agregarlo al mapa y actualizar mapInstance.rasterLayer
}

// Función para actualizar ambos rasters y el side-by-side con la paleta activa
export async function updateSideBySideWithPalette(mapInstance, capaSeleccionada, georasterActual, georasterHistorico, semanaActual, semanaHistorico, codigoBase) {
    let minRange, maxRange;
    let palette = getActivePalette(capaSeleccionada);
    if (palette.length === 3) {
        // Paleta alternativa: usar rango especial y leyenda especial
        const alt = getAltPaletteMinMax(georasterActual, georasterHistorico);
        minRange = alt;
        maxRange = alt; // Se pasa el objeto completo para la leyenda
        mapInstance.rasterLayerLeft = createRasterLayerWithPalette(georasterHistorico, alt.min, alt.max, palette);
        mapInstance.rasterLayerRight = createRasterLayerWithPalette(georasterActual, alt.min, alt.max, palette);
    } else {
        // Paleta normal: usar min/max del JSON
        try {
            const abs = await getMinMaxFromJson(codigoBase, capaSeleccionada);
            minRange = abs.min_actual;
            maxRange = abs.max_actual;
            mapInstance.rasterLayerLeft = createRasterLayerWithPalette(georasterHistorico, abs.min_historico, abs.max_historico, palette);
            mapInstance.rasterLayerRight = createRasterLayerWithPalette(georasterActual, abs.min_actual, abs.max_actual, palette);
        } catch (e) {
            minRange = maxRange = 0;
            mapInstance.rasterLayerLeft = createRasterLayerWithPalette(georasterHistorico, 0, 1, palette);
            mapInstance.rasterLayerRight = createRasterLayerWithPalette(georasterActual, 0, 1, palette);
            console.warn('No min/max data for', codigoBase, capaSeleccionada, e);
        }
    }

    // Reinstalar side-by-side (elimina el anterior si existe)
    if (mapInstance._sideBySideControl) {
        mapInstance.removeControl(mapInstance._sideBySideControl);
        mapInstance._sideBySideControl = null;
    }
    initSideBySide(mapInstance, mapInstance.rasterLayerLeft, mapInstance.rasterLayerRight);

    // Guardar para recarga rápida
    mapInstance._lastGeoRasters = {
        [capaSeleccionada]: {
            georasterActual,
            georasterHistorico,
            minRange,
            maxRange,
            semanaActual,
            semanaHistorico,
            codigoBase
        }
    };

    // Actualizar leyenda y títulos
    renderDualLegends(mapInstance, capaSeleccionada, georasterActual, georasterHistorico, semanaActual, semanaHistorico, minRange, maxRange);

    // Control de título (arriba a la derecha)
    if (mapInstance.titleControl) mapInstance.removeControl(mapInstance.titleControl);
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

    // Control de descripción (arriba a la izquierda)
    if (mapInstance.descControl) mapInstance.removeControl(mapInstance.descControl);
    const descripcion = text_cont[capaSeleccionada.toUpperCase()] || "";
    if (descripcion) {
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
}
