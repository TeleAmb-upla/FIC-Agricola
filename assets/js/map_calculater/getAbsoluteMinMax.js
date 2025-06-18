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
    function getMinMax(georaster) {
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
    const minMax = georasterHistorico ? getMinMax(georasterHistorico) : { min: Infinity, max: -Infinity };
    const absMin = minMax.min;
    const absMax = minMax.max;
    const diff = absMax - absMin;
    const step = diff / 3;
    const umbral_min = absMin + step;
    const umbral_max = absMax - step;
    return {
        min: absMin,
        umbral_min,
        step,
        umbral_max,
        max: absMax
    };
}
