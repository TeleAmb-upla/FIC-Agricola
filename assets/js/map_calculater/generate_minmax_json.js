// Script Node.js para generar un JSON con los min/max de todos los TIFF
// Requiere: npm install geotiff fs path

const fs = require('fs');
const path = require('path');
const GeoTIFF = require('geotiff');

const tiffRoot = path.join(__dirname, '../tiff'); // Ajusta si tu ruta es diferente
const outputJson = path.join(__dirname, 'minmax_tiffs.json');

// Utilidad para buscar archivos y calcular min/max
async function getMinMaxFromTiffSync(filePath) {
    const data = fs.readFileSync(filePath);
    const tiff = await GeoTIFF.fromArrayBuffer(data.buffer);
    const image = await tiff.getImage();
    const values = await image.readRasters();
    const noData = image.getGDALNoData();
    let min = Infinity, max = -Infinity;
    const arr = values[0];
    for (let y = 0; y < arr.length; y++) {
        for (let x = 0; x < arr[0].length; x++) {
            const v = arr[y][x];
            if (v === null || v === undefined || isNaN(v) || v === noData) continue;
            if (v < min) min = v;
            if (v > max) max = v;
        }
    }
    return { min, max };
}

async function processTiffs() {
    const result = {};
    const indices = fs.readdirSync(tiffRoot).filter(f => fs.statSync(path.join(tiffRoot, f)).isDirectory());
    for (const indice of indices) {
        const indicePath = path.join(tiffRoot, indice);
        const files = fs.readdirSync(indicePath).filter(f => f.endsWith('.tif'));
        // Agrupa por código base
        const codigos = {};
        for (const file of files) {
            const match = file.match(/^(.*?)_.*?_(\d{4})_(\d{4})_(\d+)\.tif$/);
            if (!match) continue;
            const codigo = match[1];
            const anioIni = match[2];
            const anioFin = match[3];
            const semana = match[4];
            if (!codigos[codigo]) codigos[codigo] = { historico: [], actual: [] };
            if (anioIni === '2019' && anioFin === '2024') {
                codigos[codigo].historico.push(path.join(indicePath, file));
            } else if (anioIni === '2025' && anioFin === '2025') {
                codigos[codigo].actual.push(path.join(indicePath, file));
            }
        }
        for (const codigo in codigos) {
            if (!result[codigo]) result[codigo] = {};
            result[codigo][indice] = { historico: { min: null, max: null }, actual: { min: null, max: null } };
            // Procesa históricos
            let minH = Infinity, maxH = -Infinity;
            for (const file of codigos[codigo].historico) {
                const { min, max } = await getMinMaxFromTiffSync(file);
                if (min < minH) minH = min;
                if (max > maxH) maxH = max;
            }
            if (minH !== Infinity && maxH !== -Infinity) {
                result[codigo][indice].historico = { min: minH, max: maxH };
            }
            // Procesa actuales
            let minA = Infinity, maxA = -Infinity;
            for (const file of codigos[codigo].actual) {
                const { min, max } = await getMinMaxFromTiffSync(file);
                if (min < minA) minA = min;
                if (max > maxA) maxA = max;
            }
            if (minA !== Infinity && maxA !== -Infinity) {
                result[codigo][indice].actual = { min: minA, max: maxA };
            }
        }
    }
    fs.writeFileSync(outputJson, JSON.stringify(result, null, 2));
    console.log('JSON generado en', outputJson);
}

processTiffs();
