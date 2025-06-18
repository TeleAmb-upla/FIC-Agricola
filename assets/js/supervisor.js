// Archivo: assets/js/supervisor.js

document.addEventListener('DOMContentLoaded', function() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
    if (!usuario || !usuario.acceso_codebase) {
        window.location.href = 'plataforma.html';
        return;
    }
    document.getElementById('supervisor-nombre').textContent = usuario.Nombre || usuario.usuario;
    const select = document.getElementById('select-codebase');
    usuario.acceso_codebase.forEach(cod => {
        const option = document.createElement('option');
        option.value = cod;
        option.textContent = cod;
        select.appendChild(option);
    });
    select.addEventListener('change', function() {
        mostrarMapaHuerto(this.value);
    });
    if (usuario.acceso_codebase.length > 0) {
        mostrarMapaHuerto(usuario.acceso_codebase[0]);
    }
});

function mostrarMapaHuerto(cod_base) {
    const contenedor = document.getElementById('huerto-datos');
    contenedor.innerHTML = `<div id="mapa-supervisor" style="height: 500px; width: 100%; margin-bottom: 20px;"></div>`;
    // Cargar Leaflet y mostrar el mapa centrado en una ubicación por defecto
    if (window.mapaSupervisor) {
        window.mapaSupervisor.remove();
    }
    window.mapaSupervisor = L.map('mapa-supervisor').setView([-33.036, -71.381], 12);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '© Esri, Earthstar Geographics'
    }).addTo(window.mapaSupervisor);
    // Mostrar los índices disponibles como botones
    const indices = ['NDVI', 'EVI', 'GNDVI'];
    let botones = indices.map(indice => `<button onclick=\"cargarCapaIndice('${cod_base}','${indice}')\">${indice}</button>`).join(' ');
    contenedor.innerHTML += `<div style='margin-bottom:10px;'>${botones}</div><div id='info-indice'></div>`;
}

function cargarCapaIndice(cod_base, indice) {
    const mapa = window.mapaSupervisor;
    if (!mapa) return;
    // Eliminar capas anteriores
    if (window.capaIndiceSupervisor) {
        mapa.removeLayer(window.capaIndiceSupervisor);
        window.capaIndiceSupervisor = null;
    }
    // Cargar el archivo CSV y mostrarlo como popup (puedes adaptar para raster/GeoTIFF si lo deseas)
    fetch(`./assets/csv/${indice}/${cod_base}_${indice}.csv`)
        .then(resp => resp.ok ? resp.text() : Promise.reject('No encontrado'))
        .then(csv => {
            document.getElementById('info-indice').innerHTML = `<h5>${indice}</h5><pre style='overflow-x:auto;max-width:100%;white-space:pre-wrap;'>${csv.substring(0, 1000)}${csv.length > 1000 ? '\n... (truncado)' : ''}</pre>`;
        })
        .catch(() => {
            document.getElementById('info-indice').innerHTML = `<h5>${indice}</h5><p>No disponible</p>`;
        });
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'plataforma.html';
}
