// bounds.js

export function calculateBounds(georaster) {
    const xmin = georaster.xmin;
    const xmax = georaster.xmax;
    const ymin = georaster.ymin;
    const ymax = georaster.ymax;

    // Crear un objeto LatLngBounds que Leaflet pueda usar para ajustar el zoom
    const bounds = [[ymin, xmin], [ymax, xmax]];

    return bounds;
}
