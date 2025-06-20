const fs = require('fs');
const path = require('path');
const GeoTIFF = require('geotiff');

// Ajusta las rutas según la estructura real de tu proyecto
const tiffRoot = path.join(__dirname, '../../tiff');
const outputJson = path.join(__dirname, '../../basa_data/max_min_h.json');
const indices = ["NDVI", "NDMI"];
//const indices = ["EVI", "GCI", "LAI", "MNDWI", "MSAVI", "NDMI", "NDVI", "NDWI", "SAVI", "GNDVI"];
async function getMinMaxFromTiff(filePath) {
    try {
        const data = fs.readFileSync(filePath);
        const tiff = await GeoTIFF.fromArrayBuffer(data.buffer);
        const image = await tiff.getImage();
        const values = await image.readRasters();
        const noData = image.getGDALNoData();
        let min = Infinity, max = -Infinity;
        const arr = values[0];
        for (let i = 0; i < arr.length; i++) {
            const v = arr[i];
            if (v === null || v === undefined || isNaN(v) || v === noData) continue;
            if (v < min) min = v;
            if (v > max) max = v;
        }
        return { min, max };
    } catch (error) {
        console.warn(`Archivo ignorado por error de lectura: ${filePath}\nMotivo: ${error.message}`);
        return null;
    }
}

async function main() {
    const result = {};
    let totalProcesados = 0;
    for (const indice of indices) {
        const indicePath = path.join(tiffRoot, indice);
        if (!fs.existsSync(indicePath)) {
            console.log(`No existe la carpeta para el índice: ${indice}`);
            continue;
        }
        const files = fs.readdirSync(indicePath).filter(f => f.endsWith('.tif'));
        console.log(`Índice ${indice}: ${files.length} archivos encontrados.`);
        for (const file of files) {
            // Cambiado para aceptar semanas de 1 o 2 dígitos
            // y para que el código base sea siempre el nombre completo antes del primer guion bajo
            const match = file.match(/^([a-zA-Z0-9_]+)_([A-Z]+)_(\d{4}_\d{4})_(\d{1,2})\.tif$/);
            if (!match) {
                console.log(`Archivo ignorado por no coincidir con el patrón: ${file}`);
                continue;
            }
            const codigo = match[1]; // Ahora toma todo antes del primer _ como código base
            const indiceNombre = match[2];
            const yearRange = match[3];
            const semana = match[4].padStart(2, '0'); // Siempre guardar la semana con dos dígitos
            if (!result[codigo]) result[codigo] = {};
            if (!result[codigo][indiceNombre]) result[codigo][indiceNombre] = {};
            if (!result[codigo][indiceNombre][yearRange]) result[codigo][indiceNombre][yearRange] = {};
            // Calcula min/max por semana
            console.log(`Procesando: ${file}`);
            const minMax = await getMinMaxFromTiff(path.join(indicePath, file));
            if (minMax) {
                result[codigo][indiceNombre][yearRange][semana] = minMax;
                totalProcesados++;
            }
        }
    }
    // Calcula min/max globales y absolutos
    for (const codigo in result) {
        for (const indice in result[codigo]) {
            let min_hist = Infinity, max_hist = -Infinity, min_act = Infinity, max_act = -Infinity;
            let min_abs = Infinity, max_abs = -Infinity;
            // Históricos
            if (result[codigo][indice]['2019_2024']) {
                for (const semana in result[codigo][indice]['2019_2024']) {
                    const { min, max } = result[codigo][indice]['2019_2024'][semana];
                    if (min < min_hist) min_hist = min;
                    if (max > max_hist) max_hist = max;
                }
            }
            // Actuales
            if (result[codigo][indice]['2025_2025']) {
                for (const semana in result[codigo][indice]['2025_2025']) {
                    const { min, max } = result[codigo][indice]['2025_2025'][semana];
                    if (min < min_act) min_act = min;
                    if (max > max_act) max_act = max;
                }
            }
            // Absolutos
            min_abs = Math.min(min_hist, min_act);
            max_abs = Math.max(max_hist, max_act);
            result[codigo][indice]['absoluto'] = {
                min_historico: isFinite(min_hist) ? min_hist : null,
                max_historico: isFinite(max_hist) ? max_hist : null,
                min_actual: isFinite(min_act) ? min_act : null,
                max_actual: isFinite(max_act) ? max_act : null,
                min_absoluto: isFinite(min_abs) ? min_abs : null,
                max_absoluto: isFinite(max_abs) ? max_abs : null
            };
        }
    }
    fs.writeFileSync(outputJson, JSON.stringify(result, null, 2));
    console.log('JSON generado en', outputJson);
    console.log(`Total de archivos procesados: ${totalProcesados}`);
}

main();