
// assets/js/chart.js
import * as d3 from 'https://cdn.skypack.dev/d3@7';



// indicator-colors.js
export const colorRanges = {
    "NDVI": {
       
        range: ["red", "sandybrown", "lightgreen", "forestgreen"]
    },
    "SAVI": {
       
        range: ["darkred", "lightgray", "yellow", "darkgreen"]
    },
    "EVI": {
        // Ejemplo: ¡Reemplaza con los rangos reales!
        range: ["purple", "lightblue", "orange", "lime"]
    },
    "GNDVI": {
         // Ejemplo: ¡Reemplaza con los rangos reales!
        range: ["blue", "lightyellow", "orange", "green"]
    },
    "LAI": {
        // Ejemplo: ¡Reemplaza con los rangos reales!
        range: ["black", "lightgray", "yellow", "green"]
    },
    "GCI": {
         // Ejemplo: ¡Reemplaza con los rangos reales!
        range: ["darkblue", "lightblue", "orange", "green"]
    },
    "MSAVI": {
        // Ejemplo: ¡Reemplaza con los rangos reales!
        range: ["darkblue", "lightblue", "orange", "green"]
    },
    "NDWI": {
         // Ejemplo: ¡Reemplaza con los rangos reales!
        range: ["darkblue", "lightblue", "orange", "green"]
    },
    "MNDWI": {
         // Ejemplo: ¡Reemplaza con los rangos reales!
        range: ["darkblue", "lightblue", "orange", "green"]
    },
    "NDMI": {
         // Ejemplo: ¡Reemplaza con los rangos reales!
        range: ["darkblue", "lightblue", "orange", "green"]
    },
    // Aquí puedes añadir las definiciones para más indicadores en el futuro
};

export function obtenerEscalaColor(capaSeleccionada, minVal, maxVal) {
    const rangos = colorRanges[capaSeleccionada];
    
    if (rangos) {
        const numColores = rangos.range.length;
        const dominio = Array.from({length: numColores}, (_, i) => 
            minVal + (maxVal - minVal) * (i / (numColores - 1))
        );
        
        return d3.scaleLinear()
            .domain(dominio)
            .range(rangos.range);
    }
    
    return d3.scaleLinear()
        .domain([minVal, (minVal + maxVal)/2, maxVal])
        .range(["red", "lightgray", "green"]);
}