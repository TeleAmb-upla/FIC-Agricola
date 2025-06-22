// assets/js/user-files-supervisor.js
// Provee rutas de archivos TIFF/CSV para todos los predios del supervisor

function getRutasPorPredio(usuario, capaSeleccionada, semanaSeleccionada) {
    if (!usuario || !usuario.acceso_codebase) return [];
    return usuario.acceso_codebase.map(codigo_base => ({
        codigo_base,
        tiff: `./assets/tiff/${capaSeleccionada.toUpperCase()}/${codigo_base}_${capaSeleccionada.toUpperCase()}_2019_2024_${semanaSeleccionada}.tif`,
        // Nueva ruta para CSV en carpeta Localidades
        csv: null // Se debe obtener usando getRutaCsvLocalidades fuera de este mapeo
    }));
}

// Obtiene el nombre de localidad y cultivo a partir del usuario y los JSON de referencia
function getNombreLocalidad(usuario, localidad) {
    const loc = localidad[usuario.localidad];
    return loc ? loc.nombre : '';
}

function getNombreCultivo(usuario, cultivos) {
    if (!usuario || !usuario.cultivo) return '';
    const cult = cultivos[usuario.cultivo];
    return cult ? cult.nombre : '';
}

// Devuelve la ruta del CSV de la carpeta Localidades usando los nombres
function getRutaCsvLocalidades(usuario, localidad, cultivos, indice) {
    const nombreLocalidad = getNombreLocalidad(usuario, localidad);
    const nombreCultivo = cultivos[usuario.cultivo]?.nombre || '';
    const loc = nombreLocalidad.toLowerCase().replace(/\s+/g, '');
    const cult = nombreCultivo.toLowerCase().replace(/\s+/g, '');
    const ind = indice.toUpperCase();
    const ruta = `./assets/csv/Localidades/${loc}_${cult}_${ind}.csv`;
    console.log('[getRutaCsvLocalidades] Ruta generada:', ruta, 'Localidad:', nombreLocalidad, 'Cultivo:', nombreCultivo, 'Índice:', indice);
    return ruta;
}

// Devuelve { localidad, cultivo } del supervisor activo (siempre como nombres, nunca ids, o null si no puede traducir)
function getLocalidadCultivoSupervisor() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
    if (!usuario) return { localidad: null, cultivo: null };
    let localidadNombre = null;
    let cultivoNombre = null;
    if (window.localidadData && window.cultivosData) {
        localidadNombre = (window.localidadData[usuario.localidad] && window.localidadData[usuario.localidad].nombre) || null;
        cultivoNombre = (window.cultivosData[usuario.cultivo] && window.cultivosData[usuario.cultivo].nombre) || null;
    }
    return { localidad: localidadNombre, cultivo: cultivoNombre };
}

// --- GRAFICADO AUTOMÁTICO SOLO CUANDO LOS JSON ESTÉN LISTOS ---
window.localidadData = null;
window.cultivosData = null;

function graficarSupervisorAutoSiListo() {
    if (window.localidadData && window.cultivosData && window.getLocalidadCultivoSupervisor && window.cargarCsvYGraficarPorLocalidadCultivo) {
        const info = window.getLocalidadCultivoSupervisor();
        if (info && info.localidad && info.cultivo) {
            window.cargarCsvYGraficarPorLocalidadCultivo(info.localidad, info.cultivo, 'NDVI');
            console.log('[DEBUG] Graficado automático con:', info.localidad, info.cultivo, 'NDVI');
        } else {
            d3.select('#d3-chart').html('<p style="color:red">No se pudo obtener la información de localidad y cultivo del supervisor.</p>');
        }
    }
}

// Estos fetch deben estar en el archivo principal (ej: supervisor.js), pero si no, puedes ponerlos aquí:
fetch('./assets/basa_data/localidad.json')
  .then(resp => resp.json())
  .then(data => { window.localidadData = data; graficarSupervisorAutoSiListo(); });
fetch('./assets/basa_data/cultivo.json')
  .then(resp => resp.json())
  .then(data => { window.cultivosData = data; graficarSupervisorAutoSiListo(); });

window.getRutasPorPredio = getRutasPorPredio;
window.getNombreLocalidad = getNombreLocalidad;
window.getNombreCultivo = getNombreCultivo;
window.getRutaCsvLocalidades = getRutaCsvLocalidades;
window.getLocalidadCultivoSupervisor = getLocalidadCultivoSupervisor;
