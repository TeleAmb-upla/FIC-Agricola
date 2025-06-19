// assets/js/user-files-supervisor.js
// Provee rutas de archivos TIFF/CSV para todos los predios del supervisor

function getRutasPorPredio(usuario, capaSeleccionada, semanaSeleccionada) {
    if (!usuario || !usuario.acceso_codebase) return [];
    return usuario.acceso_codebase.map(codigo_base => ({
        codigo_base,
        tiff: `./assets/tiff/${capaSeleccionada.toUpperCase()}/${codigo_base}_${capaSeleccionada.toUpperCase()}_2019_2024_${semanaSeleccionada}.tif`,
        csv: `./assets/csv/${capaSeleccionada.toUpperCase()}/${codigo_base}_${capaSeleccionada.toUpperCase()}.csv`
    }));
}

window.getRutasPorPredio = getRutasPorPredio;
