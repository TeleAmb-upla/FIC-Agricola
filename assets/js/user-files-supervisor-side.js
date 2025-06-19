// assets/js/user-files-supervisor-side.js
// Provee rutas de archivos TIFF left/right (histórico/actual) para side-by-side en el supervisor

function getRutasSideBySideSupervisor(codigo_base, capaSeleccionada, semanaHistorica, semanaActual) {
    // Ajusta los años según tu estructura de carpetas y nombres
    const anioHistorico = '2019_2024';
    const anioActual = '2025_2025';
    return {
        tiffLeft: `./assets/tiff/${capaSeleccionada.toUpperCase()}/${codigo_base}_${capaSeleccionada.toUpperCase()}_${anioHistorico}_${semanaHistorica}.tif`,
        tiffRight: `./assets/tiff/${capaSeleccionada.toUpperCase()}/${codigo_base}_${capaSeleccionada.toUpperCase()}_${anioActual}_${semanaActual}.tif`,
        codigo_base
    };
}

window.getRutasSideBySideSupervisor = getRutasSideBySideSupervisor;
