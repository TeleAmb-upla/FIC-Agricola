// Script para calcular min, max y área (píxeles válidos) de todos los .tif en una carpeta y generar un JSON resumen
// Requiere: npm install geotiff

const fs = require('fs');
const path = require('path');
const GeoTIFF = require('geotiff');

const folder = path.join(__dirname, '../../tiff/NDVI'); // Cambia NDVI por el índice/carpeta que quieras

async function processTiff(filePath) {
    const tiff = await GeoTIFF.fromFile(filePath);
    const image = await tiff.getImage();
    const data = await image.readRasters({ interleave: true });
    const noData = image.getGDALNoData();
    let min = Infinity, max = -Infinity, validPixels = 0;
    for (let i = 0; i < data.length; i++) {
        const v = data[i];
        if (v !== noData && !isNaN(v)) {
            if (v < min) min = v;
            if (v > max) max = v;
            validPixels++;
        }
    }
    // Obtener tamaño de pixel en grados
    const [pixelWidth, pixelHeight] = image.getResolution();
    // Calcular área de pixel en m2 usando la latitud central del raster
    const bbox = image.getBoundingBox();
    const latCenter = (bbox[1] + bbox[3]) / 2;
    // 1 grado latitud ≈ 111320 m, 1 grado longitud ≈ 111320*cos(lat)
    const metersPerDegLat = 111320;
    const metersPerDegLon = 111320 * Math.cos(latCenter * Math.PI / 180);
    const pixelAreaM2 = Math.abs(pixelWidth * metersPerDegLon * pixelHeight * metersPerDegLat);
    const areaM2 = validPixels * pixelAreaM2;
    const areaHa = areaM2 / 10000;
    return { min, max, validPixels, pixelWidth, pixelHeight, areaM2, areaHa };
}

async function main() {
    const files = fs.readdirSync(folder).filter(f => f.endsWith('.tif') || f.endsWith('.tiff'));
    const result = {};
    const codsProcesados = new Set();
    for (const file of files) {
        // Extraer solo el cod_xxxx del nombre
        const match = file.match(/(cod_\d+)/i);
        if (!match) continue;
        const cod = match[1];
        if (codsProcesados.has(cod)) continue; // Solo el primer archivo de cada cod
        codsProcesados.add(cod);
        const filePath = path.join(folder, file);
        try {
            const stats = await processTiff(filePath);
            result[cod] = stats;
            console.log(`Procesado ${file} como ${cod}:`, stats);
        } catch (e) {
            console.error(`Error procesando ${file}:`, e);
        }
    }
    fs.writeFileSync(path.join(__dirname, '../../basa_data/max_min_ha.json'), JSON.stringify(result, null, 2));
    console.log('JSON generado: ../../basa_data/max_min_ha.json');
}

main();
