let map;

export function initMap(mapId) {
    if (map) {
        map.remove();
    }
    map = L.map(mapId).setView([-33.036, -71.381], 11);
    L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        {
            minZoom: 0,
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions"'
        }
    ).addTo(map);
    return map;
}

// assets/js/map-colors.js

const colorParams = {
    NDVI: {
      min: 0.2330039598766232,
      max: 0.707437991042495,
      opacity: 1,
      palette: ['ffffff', 'ce7e45', 'df923d', 'f1b555', 'fcd163', '99b718', '74a901', '66a000', '529400', '3e8601', '207401', '056201', '004c00', '023b01', '012e01', '011d01', '011301']
    },
    EVI: {
      min: 0.2571088902885615,
      max: 0.6893892158008912,
      opacity: 1,
      palette: ['ffffff', 'f7f7b0', 'e6f59b', 'c6ea7f', 'a6d96a', '86c45d', '66bd63', '46a356', '2e8b4a', '1a753e', '0a5c32']
    },
    SAVI: {
      min: 0.22413114461557246,
      max: 0.46946892678762225,
      opacity: 1,
      palette: ['8b4513', 'a05a2c', 'b56f45', 'ca855e', 'df9a77', 'f4b090', 'd5c293', 'b6d496', '97e699', '60c67d', '399565']
    },
    GNDVI: {
      min: 0.3649700312592607,
      max: 0.5849262514366984,
      opacity: 1,
      palette: ['ff0000', 'ff4500', 'ff8c00', 'ffd700', 'ffff00', 'adff2f', '69d500', '32cd32', '008000', '006400']
    },
    LAI: {
      min: 0.9425796813567707,
      max: 2.3762101827676245,
      opacity: 1,
      palette: ['ffffff', 'e0f3e0', 'c1e7c1', 'a2dba2', '83cf83', '64c364', '45b745', '26ab26', '068b06', '005c00']
    },
    NDMI: {
      min: -0.005000530825911282,
      max: 0.3762953890775752,
      opacity: 1,
      palette: ['8b0000', 'ff0000', 'ffa07a', 'ffffff', 'add8e6', '0000ff', '00008b']
    },
    GCI: {
      min: -0.13299888278136007,
      max: 0.41241029556898656,
      opacity: 1,
      palette: ['b2182b', 'ef8a62', 'fddbc7', 'f7f7f7', 'b5c6d0', '5890b0', '2166ac']
    },
    MSAVI: {
      min: 0.18597123452563147,
      max: 0.4402407177635358,
      opacity: 1,
      palette: ['8c510a', 'bf812d', 'dfc27d', 'f6e8c3', 'b9d9d4', '80cdc1', '35978f', '01665e']
    },
    NDWI: {
      min: -0.5849262514366984,
      max: -0.2519302749320387,
      opacity: 1,
      palette: ["d73027", "fc8d59", "fee090", "e0f3f8", "91bfdb", "4575b4"]
    },
    MNDWI: {
      min: -0.3925689723798504,
      max: -0.23922708446088817,
      opacity: 1,
      palette: ['a50026', 'd75926', 'f46d43', 'fdae61', 'fee08b', 'e6f598', 'abdda4', '66bd63', '1a9850', '006837']
    }
  };
  
// Modified getColorParams to accept the layer name (string) instead of pixel value
export function getColorParams(capaSeleccionada) {
    return colorParams[capaSeleccionada.toUpperCase()]; // Convertir a mayúsculas para coincidencia
}




// Modified loadGeoRasterLayer to specify which layer's color scheme to use
// Modified loadGeoRasterLayer to handle NA, NULL, and NaN as transparent
export async function loadGeoRasterLayer(url, mapInstance, capaSeleccionada) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const georaster = await parseGeoraster(arrayBuffer);
        const params = getColorParams(capaSeleccionada);

        // Eliminar controles anteriores
        [mapInstance.titleControl, mapInstance.legendControl].forEach(control => {
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

        // Leyenda vertical optimizada
        mapInstance.legendControl = L.control({ position: 'bottomright' });
        mapInstance.legendControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'map-legend');
            const gradientColors = params.palette.map(color => `#${color}`).join(', ');
            
            div.innerHTML = `
                <div class="legend-scale-container">
                    <div class="legend-gradient" style="background: linear-gradient(to right, ${gradientColors})"></div>
                    <div class="legend-values">
                        <span>${params.min.toFixed(2)}</span>
                        <span>${params.max.toFixed(2)}</span>
                    </div>
                </div>
            `;
            return div;
        };
        mapInstance.legendControl.addTo(mapInstance);

        // Capa raster
        const rasterLayer = new GeoRasterLayer({
            georaster,
            resolution: 256,
            pixelValuesToColorFn: values => {
                const value = values[0];
                
                if (value === null || value === undefined || isNaN(value) || value === georaster.noDataValue) {
                    return "transparent";
                }
                
                const clampedValue = Math.max(params.min, Math.min(value, params.max));
                const normalized = (clampedValue - params.min) / (params.max - params.min);
                const index = Math.floor(normalized * (params.palette.length - 1));
                
                return `#${params.palette[Math.max(0, Math.min(index, params.palette.length - 1))]}`;
            },
            opacity: params.opacity
        });
        
        rasterLayer.addTo(mapInstance);
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
export function enableRasterValuePopup(mapInstance, rasterLayer, layerName, georaster) {
    mapInstance.on("click", function (e) {
        const { lat, lng } = e.latlng;
        
        try {
            // 1. Validar que las coordenadas estén dentro del raster
            const bounds = calculateBounds(georaster);
            if (
                lng < georaster.xmin || lng > georaster.xmax ||
                lat < georaster.ymin || lat > georaster.ymax
            ) {
                L.popup()
                    .setLatLng([lat, lng])
                    .setContent("Fuera de los límites del raster")
                    .openOn(mapInstance);
                return;
            }

            // 2. Convertir coordenadas a posición de píxel
            const x = (lng - georaster.xmin) / georaster.pixelWidth;
            const y = (georaster.ymax - lat) / georaster.pixelHeight; // ¡Invertido por el sistema de coordenadas!
            const pixelX = Math.floor(x);
            const pixelY = Math.floor(y);

            // 3. Obtener valor (primera banda)
            const value = georaster.values[0][pixelY][pixelX];

            // 4. Mostrar popup
            let content;
            if (value === undefined || value === null) {
                content = "Sin datos en esta ubicación";
            } else if (isNaN(value)) {
                content = "Valor no numérico (NaN)";
            } else {
                content = `Valor ${layerName}: ${value.toFixed(3)}`;
            }

            L.popup()
                .setLatLng([lat, lng])
                .setContent(content)
                .openOn(mapInstance);

        } catch (error) {
            console.error("Error técnico:", error);
            L.popup()
                .setLatLng([lat, lng])
                .setContent("Error al leer el píxel")
                .openOn(mapInstance);
        }
    });
}


