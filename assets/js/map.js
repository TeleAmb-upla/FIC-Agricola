// assets/js/map.js

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

// Función para determinar el color del píxel basado en el valor de NDVI
export function colorFunction(value) {
    if (value === null || isNaN(value) || value < -1 || value > 1) {
        return null; // Transparente para valores nulos o fuera de rango
    }
    if (value < -0.2) return '#8B0000'; // Rojo oscuro
    if (value < 0) return '#FF0000';    // Rojo
    if (value < 0.2) return '#FFFF00';  // Amarillo
    if (value < 0.5) return '#ADFF2F';  // Verde claro
    return '#006400';                   // Verde oscuro
}

export async function loadGeoRasterLayer(url, mapInstance) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const georaster = await parseGeoraster(arrayBuffer);
        const rasterLayer = new GeoRasterLayer({
            georaster,
            resolution: 256,
            pixelValuesToColorFn: values => {
                const value = values[0];
                return colorFunction(value);
            }
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

    const bounds = [[ymin, xmin], [ymax, xmax]];
    return bounds;
}
export function enableRasterValuePopup(mapInstance, rasterLayer) {
    mapInstance.on("click", async function (e) {
        const { lat, lng } = e.latlng;

        // Verificamos que la capa raster esté definida
        if (rasterLayer && typeof rasterLayer.getValueAtLatLng === 'function') {
            try {
                const value = await rasterLayer.getValueAtLatLng(lat, lng);
                if (value !== undefined && value !== null && !isNaN(value)) {
                    const formattedValue = value.toFixed(3); // Ajusta la cantidad de decimales según necesites
                    L.popup()
                        .setLatLng([lat, lng])
                        .setContent(`Valor NDVI: ${formattedValue}`)
                        .openOn(mapInstance);
                } else {
                    L.popup()
                        .setLatLng([lat, lng])
                        .setContent("Sin datos en esta ubicación.")
                        .openOn(mapInstance);
                }
            } catch (error) {
                console.error("Error al obtener el valor del píxel:", error);
            }
        }
    });
}