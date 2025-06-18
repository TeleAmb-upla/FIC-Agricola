// assets/js/user-files.js

import { cargarDatosEnGrafico } from './chart.js';
import { initMap, loadGeoRasterLayer, calculateBounds, enableRasterValuePopup, initSideBySide, renderDualLegends, getActivePalette, syncRastersAndLegend, setDefaultPalette, updateSideBySideWithPalette } from './map.js';

document.addEventListener("DOMContentLoaded", () => {
    // Mostrar el nombre del usuario autenticado
    const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (usuario && usuario.Nombre) {
        const userNameSpan = document.getElementById('user-name');
        if (userNameSpan) userNameSpan.textContent = usuario.Nombre;
    }

    // Mostrar la localidad del usuario autenticado
    if (usuario && usuario.localidad) {
        fetch('./assets/basa_data/localidad.json')
            .then(res => res.json())
            .then(localidades => {
                const localidadId = usuario.localidad;
                const localidadNombre = localidades[localidadId]?.nombre;
                if (localidadNombre) {
                    const locationSpan = document.getElementById('locationSelector');
                    if (locationSpan) locationSpan.textContent = localidadNombre + ',';
                }
            });
    }

    // Mostrar el nombre del cultivo como texto fijo
    if (usuario && usuario.cultivo) {
        fetch('./assets/basa_data/cultivo.json')
            .then(res => res.json())
            .then(cultivos => {
                const cultivoId = usuario.cultivo;
                const cultivoNombre = cultivos[cultivoId]?.nombre;
                if (cultivoNombre) {
                    // Mostrar en el span fijo
                    const cropSelectorSpan = document.getElementById('cropSelector');
                    if (cropSelectorSpan) cropSelectorSpan.textContent = cultivoNombre;
                    // También actualizar en la tarjeta de usuario si existe
                    const cropTypeSpan = document.getElementById('crop-type');
                    if (cropTypeSpan) cropTypeSpan.textContent = cultivoNombre;
                }
            });
    }

    const mapContainer = document.getElementById('map-container');
    let miMapa;
    let currentRasterLayerLeft;
    let currentRasterLayerRight;

    // Inicializar el mapa (solo una vez al cargar la página)
    miMapa = initMap('map');
    setDefaultPalette(); // <-- Fuerza la paleta original SIEMPRE al iniciar

    const layerSelector = document.getElementById("layerSelector");
    const weekSelector = document.getElementById("weekSelector");

    // Nueva función para actualizar visualizaciones con índice y semana
    const actualizarVisualizaciones = async () => {
        setDefaultPalette(); // <-- Fuerza la paleta original cada vez que se actualiza
        const capaSeleccionada = layerSelector.value;
        const semanaSeleccionada = weekSelector.value;

        // Actualizar el título del gráfico según el índice seleccionado
        const chartTitle = document.querySelector('.chart-title');
        if (chartTitle) {
            chartTitle.textContent = capaSeleccionada;
        }

        try {
            // Rutas TIFF: histórico (2024) y actual (2025)
            const rutas = {
                tiffLeft: `./assets/tiff/${capaSeleccionada.toUpperCase()}/${usuario.codigo_base}_${capaSeleccionada.toUpperCase()}_2019_2024_${semanaSeleccionada}.tif`,
                tiffRight: `./assets/tiff/${capaSeleccionada.toUpperCase()}/${usuario.codigo_base}_${capaSeleccionada.toUpperCase()}_2025_2025_${semanaSeleccionada}.tif`,
                csv: `./assets/csv/${capaSeleccionada.toUpperCase()}/${usuario.codigo_base}_${capaSeleccionada.toUpperCase()}.csv`
            }; 

            console.log("🔍 Rutas generadas:", rutas);

            // Verificar existencia de ambos tiff y csv
            const [tiffLeftExiste, tiffRightExiste, csvExiste] = await Promise.all([
                fetch(rutas.tiffLeft).then(res => {
                    console.log(`📦 TIFF Historico (${semanaSeleccionada}):`, res.ok ? "EXISTE ✅" : "NO EXISTE ❌");
                    return res.ok;
                }),
                fetch(rutas.tiffRight).then(res => {
                    console.log(`📦 TIFF Actual (${semanaSeleccionada}):`, res.ok ? "EXISTE ✅" : "NO EXISTE ❌");
                    return res.ok;
                }),
                fetch(rutas.csv).then(res => {
                    console.log(`📊 CSV (${semanaSeleccionada}):`, res.ok ? "EXISTE ✅" : "NO EXISTE ❌");
                    return res.ok;
                })
            ]);

            if (!tiffLeftExiste) throw new Error(`TIFF izquierdo no encontrado: ${rutas.tiffLeft}`);
            if (!tiffRightExiste) throw new Error(`TIFF derecho no encontrado: ${rutas.tiffRight}`);
            if (!csvExiste) throw new Error(`CSV no encontrado: ${rutas.csv}`);

            console.log("🚀 Archivos verificados. Cargando visualizaciones...");

            // Eliminar capas anteriores si existen
            if (currentRasterLayerLeft) miMapa.removeLayer(currentRasterLayerLeft);
            if (currentRasterLayerRight) miMapa.removeLayer(currentRasterLayerRight);

            // Cargar ambos TIFF como georaster
            const [georasterHistorico, georasterActual] = await Promise.all([
                loadGeoRasterLayer(rutas.tiffLeft),   // Histórico (2024)
                loadGeoRasterLayer(rutas.tiffRight)   // Actual (2025)
            ]);

            // Sincronizar ambos rasters, leyenda, textos y side-by-side
            updateSideBySideWithPalette(
                miMapa,
                capaSeleccionada,
                georasterActual,
                georasterHistorico,
                semanaSeleccionada,
                semanaSeleccionada,
                usuario.codigo_base // <-- PASA EL CODIGO BASE CORRECTO
            );

            // Ajustar el mapa y popups para ambos raster
            const bounds = calculateBounds(georasterHistorico);

            enableRasterValuePopup(
                miMapa,
                miMapa.rasterLayerRight, "Actual", georasterActual,
                miMapa.rasterLayerLeft, "Histórico", georasterHistorico,
                capaSeleccionada
            );

            miMapa.fitBounds(bounds);

            cargarDatosEnGrafico(rutas.csv, capaSeleccionada); // Usar capaSeleccionada aquí también
        } catch (error) {
            console.error("🔥 Error crítico:", error.message);
            alert(`🚨 Error: ${error.message}`);
        }
    };

    // Listeners para ambos selectores
    layerSelector.addEventListener("change", actualizarVisualizaciones);
    weekSelector.addEventListener("change", actualizarVisualizaciones);

    // Seleccionar automáticamente "NDVI" y semana 01 al cargar
    layerSelector.value = "EVI";
    weekSelector.value = "01";
    actualizarVisualizaciones();
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