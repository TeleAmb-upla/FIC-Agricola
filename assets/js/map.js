let map;

// Variable global para controlar si el usuario está arrastrando el slider
let isDraggingSlider = false;

export function initMap(mapId) {
    if (map) {
        map.remove();
    }
    map = L.map(mapId).setView([-33.036, -71.381], 11);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '© Esri, Earthstar Geographics'
    }).addTo(map);
    return map;
}

// assets/js/map-colors.js

const text_cont = {
    NDVI: "Índice de Vegetación de Diferencia Normalizada",
    EVI: "Índice de Vegetación Mejorada",
    SAVI: "Índice de Vegetación Ajustado por Suelo",
    GNDVI: "Índice de Vegetación de Diferencia Normalizada Verde",
    LAI: "Índice de Área Foliar",
    NDMI: "Índice de Humedad de Diferencia Normalizada",
    GCI: "Índice de Clorofila Verde",
    MSAVI: "Índice de Vegetación Mejorado Modificado",
    NDWI: "Índice de Agua de Diferencia Normalizada",
    MNDWI: "Índice de Agua de Diferencia Normalizada Modificado"
};












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
  
// Modified getColorParams to accept the layer name (string) instead of pixel value
export function getColorParams(capaSeleccionada) {
    return colorParams[capaSeleccionada.toUpperCase()]; // Convertir a mayúsculas para coincidencia
}

// Utilidad para calcular min y max de un raster (ignora noData)
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

export async function loadGeoRasterLayer(url, mapInstance, capaSeleccionada) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const georaster = await parseGeoraster(arrayBuffer);
        const params = getColorParams(capaSeleccionada);

        // Calcula min y max reales del raster ACTUAL (solo para este raster)
        const { min, max } = getRasterMinMax(georaster);

        // Eliminar controles anteriores
        [mapInstance.titleControl, mapInstance.legendControl, mapInstance.legendControlLeft].forEach(control => {
            if (control) {
                mapInstance.removeControl(control);
                control = null;
            }
        });

        // Control del título optimizado
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

        // Control independiente para la descripción del índice (ajustado)
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
                    <div style="width:180px; height:164px; display:flex; flex-direction:column; align-items:center; justify-content:flex-start;">
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

        // Leyenda vertical optimizada
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
                    <div class="legend-values">
                        <span>${min.toFixed(2)}</span>
                        <span>${max.toFixed(2)}</span>
                    </div>
                </div>
            `;
            return div;
        };
        mapInstance.legendControl.addTo(mapInstance);

        // Leyenda vertical optimizada izquierda (Histórico)
        mapInstance.legendControlLeft = L.control({ position: 'bottomleft' });
        mapInstance.legendControlLeft.onAdd = () => {
            const div = L.DomUtil.create('div', 'map-legend');
            const gradientColors = params.palette.map(color => `#${color}`).join(', ');
            div.innerHTML = `
                <div class="legend-title-container">
                    <span class="legend-main-title">${capaSeleccionada.toUpperCase()}</span>
                    <span class="legend-layer-type" style="font-weight:bold; color:#34495e; font-size:0.9em;">Histórico</span>
                </div>
                <div class="legend-scale-container">
                    <div class="legend-gradient" style="background: linear-gradient(to right, ${gradientColors})"></div>
                    <div class="legend-values">
                        <span>${min.toFixed(2)}</span>
                        <span>${max.toFixed(2)}</span>
                    </div>
                </div>
            `;
            return div;
        };
        mapInstance.legendControlLeft.addTo(mapInstance);


        // Capa raster
        const rasterLayer = new GeoRasterLayer({
            georaster,
            resolution: 256,
            pixelValuesToColorFn: values => {
                const value = values[0];
                if (value === null || value === undefined || isNaN(value) || value === georaster.noDataValue) {
                    return "transparent";
                }
                // Normaliza usando min y max calculados
                const clampedValue = Math.max(min, Math.min(value, max));
                const normalized = (clampedValue - min) / (max - min);
                const index = Math.floor(normalized * (params.palette.length - 1));
                return `#${params.palette[Math.max(0, Math.min(index, params.palette.length - 1))]}`;
            },
            opacity: params.opacity
        });
        
        return { rasterLayer, georaster };
    } catch (error) {
        console.error('Error al cargar el GeoTIFF:', error);
        throw error;
    }
}

export function calculateBounds(georaster) {
    const xmin = georaster.xmin;
    const xmax = georaster.xmax;
    const ymin = georaster.ymin;
    const ymax = georaster.ymax;
    return [[ymin, xmin], [ymax, xmax]]; // Formato Leaflet: [suroeste, noreste]
}
export function enableRasterValuePopup(mapInstance, rasterLayer, layerName, georaster, rasterLayer2, layerName2, georaster2, capaSeleccionada) {
    // Remueve cualquier listener anterior para evitar duplicados
    mapInstance.off("click");
    mapInstance.off("dblclick");

    // --- Manejo de eventos para el slider ---
    setTimeout(() => {
        const rangeInput = document.querySelector('.leaflet-sbs-range');
        if (rangeInput) {
            rangeInput.addEventListener('mousedown', function(e) {
                isDraggingSlider = true;
            });
            rangeInput.addEventListener('touchstart', function(e) {
                isDraggingSlider = true;
            });
            // Cuando termina el drag, vuelve a desactivar la bandera
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

    // Mostrar popup en click (mantiene solo uno visible, reemplaza el anterior, NO se cierra con otro click)
    mapInstance.on("click", function (e) {
        if (isDraggingSlider) return;

        const { lat, lng } = e.latlng;
        try {
            // --- Valor ACTUAL ---
            let value1 = null, value2 = null;
            let value1Text = "", value2Text = "";

            // --- Actual ---
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

            // --- Histórico ---
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

            // Contenido popup unificado
            let content = `
                <div class="legend-title-container">
                    <span class="legend-main-title">Valores</span>
                    <span>Actual: <span class="legend-layer-name">${isNaN(value1Text) ? value1Text : Number(value1Text).toFixed(2)}</span></span>
                    <span>Histórico: <span class="legend-layer-name">${isNaN(value2Text) ? value2Text : Number(value2Text).toFixed(2)}</span></span>
                </div>
            `;
            // Usa autoClose: false y closeOnClick: false para mantener el popup hasta doble click
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

    // Cierra el popup solo con doble click en cualquier parte del mapa
    mapInstance.on("dblclick", function () {
        mapInstance.closePopup();
    });
}

/**
 * Inicializa el control side-by-side en el mapa con dos capas raster.
 * @param {object} mapInstance - Instancia de Leaflet map.
 * @param {object} leftLayer - Capa raster izquierda.
 * @param {object} rightLayer - Capa raster derecha.
 */
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

            // --- Solo permitir mover el slider si el usuario arrastra el thumb ---
            const rangeInput = document.querySelector('.leaflet-sbs-range');
            if (rangeInput) {
                // Deshabilita pointer-events en toda la barra excepto el thumb
                rangeInput.style.pointerEvents = "none";
                // Habilita pointer-events solo en el thumb al iniciar drag
                rangeInput.addEventListener('mousedown', function(e) {
                    rangeInput.style.pointerEvents = "auto";
                });
                rangeInput.addEventListener('touchstart', function(e) {
                    rangeInput.style.pointerEvents = "auto";
                });
                // Cuando termina el drag, vuelve a deshabilitar pointer-events
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
            // --- Fin configuración slider ---
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

export function renderDualLegends(mapInstance, capaSeleccionada, georasterActual, georasterHistorico, semanaActual, semanaHistorico) {
    // Elimina leyendas anteriores
    [mapInstance.legendControl, mapInstance.legendControlLeft].forEach(control => {
        if (control) {
            mapInstance.removeControl(control);
        }
    });

    const params = getColorParams(capaSeleccionada);

    // Leyenda derecha (Actual)
    const { min: minActual, max: maxActual } = getRasterMinMax(georasterActual);
    // Log min/max actual
    console.log(`[Leyenda Actual] ${capaSeleccionada}: min=${minActual}, max=${maxActual}`);

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
                <div class="legend-values">
                    <span>${minActual.toFixed(2)}</span>
                    <span>${maxActual.toFixed(2)}</span>
                </div>
            </div>
        `;
        return div;
    };
    mapInstance.legendControl.addTo(mapInstance);

    // Leyenda izquierda (Histórico)
    const { min: minHistorico, max: maxHistorico } = getRasterMinMax(georasterHistorico);
    // Log min/max histórico
    console.log(`[Leyenda Histórico] ${capaSeleccionada}: min=${minHistorico}, max=${maxHistorico}`);

    mapInstance.legendControlLeft = L.control({ position: 'bottomleft' });
    mapInstance.legendControlLeft.onAdd = () => {
        const div = L.DomUtil.create('div', 'map-legend');
        const gradientColors = params.palette.map(color => `#${color}`).join(', ');
        div.innerHTML = `
            <div class="legend-title-container">
                <span class="legend-main-title">${capaSeleccionada.toUpperCase()}</span>
                <span class="legend-layer-type" style="font-weight:bold; color:#34495e; font-size:0.9em;">
                    Histórico <span style="color:#888;font-weight:normal; text-decoration:underline;">Semana ${semanaHistorico}</span>
                </span>
            </div>
            <div class="legend-scale-container">
                <div class="legend-gradient" style="background: linear-gradient(to right, ${gradientColors})"></div>
                <div class="legend-values">
                    <span>${minHistorico.toFixed(2)}</span>
                    <span>${maxHistorico.toFixed(2)}</span>
                </div>
            </div>
        `;
        return div;
    };
    mapInstance.legendControlLeft.addTo(mapInstance);
}

// Cuando tengas ambos georasters y la capa seleccionada, llama así:
// renderDualLegends(mapInstance, capaSeleccionada, georasterActual, georasterHistorico);
