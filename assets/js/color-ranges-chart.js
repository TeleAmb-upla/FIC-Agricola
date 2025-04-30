
// assets/js/chart.js
import * as d3 from 'https://cdn.skypack.dev/d3@7';
// indicator-colors.js
export const colorRanges = {
    "NDVI": {
        domain: [0, 0.33, 0.66, 1],
        range: ["red", "sandybrown", "lightgreen", "forestgreen"]
    },
    "SAVI": {
        domain: [-1, 0, 0.5, 1], 
        range: ["darkred", "lightgray", "yellow", "darkgreen"]
    },
    "EVI": {
        domain: [-1, 0, 0.5, 1], // Ejemplo: ¡Reemplaza con los rangos reales!
        range: ["purple", "lightblue", "orange", "lime"]
    },
    // Aquí puedes añadir las definiciones para más indicadores en el futuro
};

// Función para obtener la escala de color basada en el indicador
export function obtenerEscalaColor(indicador) {
    const rangos = colorRanges[indicador];
    if (rangos) {
        return d3.scaleLinear()
            .domain(rangos.domain)
            .range(rangos.range);
    } else {
        // Escala de color por defecto si el indicador no se encuentra
        return d3.scaleLinear()
            .domain([-1, 0, 1])
            .range(["red", "lightgray", "green"]);
    }
}