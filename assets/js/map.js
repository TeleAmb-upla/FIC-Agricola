// assets/js/map.js
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

// Función para determinar el color del píxel (MOVIDA DESDE user-files.js)
export function colorFunction(value) {
    if (value < -0.2) return '#8B0000';
    if (value < 0) return '#FF0000';
    if (value < 0.2) return '#FFFF00';
    if (value < 0.5) return '#ADFF2F';
    return '#006400';
}

export async function loadGeoRasterLayer(url, mapInstance) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const georaster = await parseGeoraster(arrayBuffer);
        const rasterLayer = new GeoRasterLayer({
            georaster,
            resolution: 720,
            pixelValuesToColorFn: values => {
                const value = values[0];
                return value === 0 ? null : colorFunction(value) ; // Usa la función de color
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