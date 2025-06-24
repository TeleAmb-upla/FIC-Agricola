/**
 * Lee el JSON de min/max y retorna los valores para un predio y un índice.
 * @param {string} codigoBase - Ej: 'cod_0001'
 * @param {string} indice - Ej: 'NDVI', 'EVI', etc.
 * @returns {Promise<{min_historico, max_historico, min_actual, max_actual, min_absoluto, max_absoluto}>}
 */
export async function getMinMaxFromJson(codigoBase, indice) {
    const response = await fetch('./assets/basa_data/max_min_h.json');
    const data = await response.json();
    if (!data[codigoBase] || !data[codigoBase][indice] || !data[codigoBase][indice].absoluto) {
        throw new Error(`No se encontraron datos para ${codigoBase} y ${indice}`);
    }
    return data[codigoBase][indice].absoluto;
}


export function getAltPaletteMinMax(georasterHistorico) {
    // Función interna para obtener el mínimo y máximo de un raster
    function getMinMax(georaster) {
        let min = Infinity, max = -Infinity; // Inicializa min y max con valores extremos
        const noData = georaster.noDataValue; // Valor que representa "sin datos" en el raster
        const values = georaster.values[0]; // Accede a la primera banda de datos
        for (let y = 0; y < values.length; y++) { // Recorre filas
            for (let x = 0; x < values[0].length; x++) { // Recorre columnas
                const v = values[y][x]; // Valor del píxel actual
                if (v === null || v === undefined || isNaN(v) || v === noData) continue; // Ignora valores no válidos
                if (v < min) min = v; // Actualiza el mínimo si corresponde
                if (v > max) max = v; // Actualiza el máximo si corresponde
            }
        }
        return { min, max }; // Devuelve el mínimo y máximo encontrados
    }
    // Calcula min y max del raster recibido (o valores extremos si no hay raster)
    const minMax = georasterHistorico ? getMinMax(georasterHistorico) : { min: Infinity, max: -Infinity };
    const absMin = minMax.min; // Valor mínimo absoluto
    const absMax = minMax.max; // Valor máximo absoluto
    const d = (absMax - absMin) / 3; // Tamaño de cada tercio del rango
    const umbral_1 = absMin + d; // Primer umbral: fin del primer tercio
    const umbral_2 = absMin + 2 * d; // Segundo umbral: fin del segundo tercio
    // Mostrar por consola los valores calculados para depuración
    console.log('[getAltPaletteMinMax] min:', absMin, 'umbral_1:', umbral_1, 'umbral_2:', umbral_2, 'max:', absMax, );
    return {
        min: absMin, // Valor mínimo
        umbral_1,   // Primer umbral (MIN + d)
        umbral_2,   // Segundo umbral (MIN + 2d)
        max: absMax, // Valor máximo
        d           // Tamaño de cada tramo
    };
}

// Al final del archivo, expón la función al global para uso en otros scripts
window.getAltPaletteMinMax = getAltPaletteMinMax;
