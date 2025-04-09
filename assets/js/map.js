// Configuración Base del Mapa
const mapConfig = {
    center: [-33.04752000, -71.44249000],
    zoom: 11,
    tileLayer: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    tileOptions: {
        minZoom: 0,
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap, CARTO'
    }
};

// Inicialización del Mapa
function initMap() {
    const map = L.map('map').setView(mapConfig.center, mapConfig.zoom);
    
    L.tileLayer(mapConfig.tileLayer, mapConfig.tileOptions).addTo(map);
    
    return map;
}

// Función para agregar la leyenda
function addLegend(map) {
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'map-legend');
        div.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: #2ecc71"></div>
                <span>Alto</span>
            </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #f1c40f"></div>
            <span>Medio</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #e74c3c"></div>
            <span>Bajo</span>
        </div>
        `;
        return div;
    };
    
    legend.addTo(map);
}

// Inicializar todo al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const mainMap = initMap();
    addLegend(mainMap);
    
    // Aquí puedes añadir más funcionalidades
    console.log('Mapa inicializado correctamente!');
});