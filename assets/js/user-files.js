// assets/js/user-files.js

import { cargarDatosEnGrafico } from './chart.js';
import { initMap, loadGeoRasterLayer, calculateBounds,enableRasterValuePopup  } from './map.js';

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

            loadGeoRasterLayer(rutas.geoJSON, miMapa, capaSeleccionada) // Ya no pasa la función de color
                .then(({ rasterLayer, georaster }) => {
                    currentRasterLayer = rasterLayer;
                    const bounds = calculateBounds(georaster);
                    enableRasterValuePopup(miMapa, rasterLayer, capaSeleccionada, georaster);
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

    // Seleccionar automáticamente "NDVI" al cargar
    layerSelector.value = "NDVI";
    layerSelector.dispatchEvent(new Event("change"));
});


// En tu archivo JS (ej: user-files.js)
function initializeResize() {
    const chartContainer = document.getElementById('chart-container');
    const resizeHandle = chartContainer.querySelector('.resize-handle');
    let isResizing = false;
    let startY = 0;
    let startHeight = 0;

    // Eventos del mouse
    resizeHandle.addEventListener('mousedown', startResize);
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);

    // Eventos táctiles (para móviles)
    resizeHandle.addEventListener('touchstart', (e) => {
        startResize(e.touches[0]);
    });
    document.addEventListener('touchmove', (e) => {
        resize(e.touches[0]);
    });
    document.addEventListener('touchend', stopResize);

    function startResize(e) {
        isResizing = true;
        startY = e.clientY;
        startHeight = chartContainer.offsetHeight;
        chartContainer.style.transition = 'none'; // Desactiva transición durante el resize
    }

    function resize(e) {
        if (!isResizing) return;
        const deltaY = startY - e.clientY;
        const newHeight = startHeight + deltaY;
        
        // Limita la altura mínima y máxima
        const minHeight = 100; // Altura mínima del gráfico
        const maxHeight = window.innerHeight * 0.7; // 70% de la ventana
        
        chartContainer.style.height = `${Math.max(minHeight, Math.min(newHeight, maxHeight))}px`;
        
        // Ajusta el mapa dinámicamente
        const map = document.getElementById('map');
        map.style.height = `calc(100vh - ${newHeight}px)`;
    }

    function stopResize() {
        isResizing = false;
        chartContainer.style.transition = 'height 0.2s ease'; // Reactiva la transición
    }

}
   

// Llama a esta función al cargar la página
window.addEventListener('DOMContentLoaded', initializeResize);