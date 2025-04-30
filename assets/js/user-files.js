// assets/js/user-files.js

import { cargarDatosEnGrafico } from './chart.js';
import { initMap, loadGeoRasterLayer, calculateBounds } from './map.js';

document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!usuario) window.location.href = "plataforma.html";

    const mapContainer = document.getElementById('map-container');
    let miMapa;
    let currentRasterLayer;

    // Inicializar el mapa (solo una vez al cargar la página)
    miMapa = initMap('map');

    const layerSelector = document.getElementById("layerSelector");

    const actualizarVisualizaciones = async (capaSeleccionada) => {
        try {
            const rutas = {
                geoJSON: `./assets/tiff/${capaSeleccionada.toUpperCase()}/${usuario.codigo_base}_${capaSeleccionada.toUpperCase()}.tif`,
                csv: `./assets/csv/${capaSeleccionada.toUpperCase()}/${usuario.codigo_base}_${capaSeleccionada.toUpperCase()}.csv`
            };

            console.log("🔍 Rutas generadas:", rutas);

            const [geoJSONExiste, csvExiste] = await Promise.all([
                fetch(rutas.geoJSON).then(res => {
                    console.log(`📦 GeoJSON (${capaSeleccionada}):`, res.ok ? "EXISTE ✅" : "NO EXISTE ❌");
                    return res.ok;
                }),
                fetch(rutas.csv).then(res => {
                    console.log(`📊 CSV (${capaSeleccionada}):`, res.ok ? "EXISTE ✅" : "NO EXISTE ❌");
                    return res.ok;
                })
            ]);

            if (!geoJSONExiste) throw new Error(`GeoJSON no encontrado: ${rutas.geoJSON}`);
            if (!csvExiste) throw new Error(`CSV no encontrado: ${rutas.csv}`);

            console.log("🚀 Archivos verificados. Cargando visualizaciones...");

            // Si hay una capa raster anterior, la eliminamos
            if (currentRasterLayer) {
                miMapa.removeLayer(currentRasterLayer);
            }

            loadGeoRasterLayer(rutas.geoJSON, miMapa) // Ya no pasa la función de color
                .then(({ rasterLayer, georaster }) => {
                    currentRasterLayer = rasterLayer;
                    const bounds = calculateBounds(georaster);
                    miMapa.fitBounds(bounds);
                })
                .catch(error => {
                    console.error('Error al cargar la capa raster:', error);
                    alert(`🚨 Error al cargar la capa raster: ${error.message}`);
                });

            cargarDatosEnGrafico(rutas.csv, capaSeleccionada);

        } catch (error) {
            console.error("🔥 Error crítico:", error.message);
            alert(`🚨 Error: ${error.message}`);
        }
    };

    layerSelector.addEventListener("change", (e) => {
        console.log("🔄 El usuario seleccionó:", e.target.value);
        actualizarVisualizaciones(e.target.value);
    });
});