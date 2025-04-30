// legendManagement.js

import { createSTLegendSVG, createSPLegendSVG } from './legends.js';

export function removeExistingLegends(currentMap, stLegend, spLegend) {
    if (stLegend) {
        currentMap.removeControl(stLegend);
        stLegend = null;
    }
    if (spLegend) {
        currentMap.removeControl(spLegend);
        spLegend = null;
    }
    return { stLegend, spLegend };
}

export function addLegendsToMap(map) {
    // Asignar la leyenda ST a la izquierda (bottomleft) y la leyenda SP a la derecha (bottomright)
    let stLegend = addLegendToMap(map, createSTLegendSVG(), 'bottomleft');  // Leyenda para ST
    let spLegend = addLegendToMap(map, createSPLegendSVG(), 'bottomright'); // Leyenda para SP
    return { stLegend, spLegend };
}


export function addLegendToMap(map, svgContent, position = 'bottomleft') {
    const legend = L.control({ position });

    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = svgContent;
        return div;
    };

    legend.addTo(map);
    return legend; // Devolver la referencia al control de la leyenda
}
