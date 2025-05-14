
// assets/js/chart.js
import * as d3 from 'https://cdn.skypack.dev/d3@7';



// indicator-colors.js
// indicator-colors.js (actualizado)
export const colorRanges = {
    "NDVI": {
        range: ["#ffffff", "#ce7e45", "#df923d", "#f1b555", "#fcd163", "#99b718", "#74a901", "#66a000", "#529400", "#3e8601", "#207401", "#056201", "#004c00", "#023b01", "#012e01", "#011d01", "#011301"]
    },
    "EVI": {
        range: ["#ffffff", "#f7f7b0", "#e6f59b", "#c6ea7f", "#a6d96a", "#86c45d", "#66bd63", "#46a356", "#2e8b4a", "#1a753e", "#0a5c32"]
    },
    "SAVI": {
        range: ["#8b4513", "#a05a2c", "#b56f45", "#ca855e", "#df9a77", "#f4b090", "#d5c293", "#b6d496", "#97e699", "#60c67d", "#399565"]
    },
    "GNDVI": {
        range: ["#ff0000", "#ff4500", "#ff8c00", "#ffd700", "#ffff00", "#adff2f", "#69d500", "#32cd32", "#008000", "#006400"]
    },
    "LAI": {
        range: ["#ffffff", "#e0f3e0", "#c1e7c1", "#a2dba2", "#83cf83", "#64c364", "#45b745", "#26ab26", "#068b06", "#005c00"]
    },
    "NDMI": {
        range: ["#8b0000", "#ff0000", "#ffa07a", "#ffffff", "#add8e6", "#0000ff", "#00008b"]
    },
    "GCI": {
        range: ["#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#b5c6d0", "#5890b0", "#2166ac"]
    },
    "MSAVI": {
        range: ["#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#b9d9d4", "#80cdc1", "#35978f", "#01665e"]
    },
    "NDWI": {
        range: ["#d73027", "#fc8d59", "#fee090", "#e0f3f8", "#91bfdb", "#4575b4"]
    },
    "MNDWI": {
        range: ["#a50026", "#d75926", "#f46d43", "#fdae61", "#fee08b", "#e6f598", "#abdda4", "#66bd63", "#1a9850", "#006837"]
    },
    "NDMI": {
        range: ["#8b0000", "#ff0000", "#ffa07a", "#ffffff", "#add8e6", "#0000ff", "#00008b"]
    }
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