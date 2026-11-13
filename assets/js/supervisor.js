// Archivo: assets/js/supervisor.js

document.addEventListener('DOMContentLoaded', function() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
    if (!usuario || !usuario.acceso_codebase) {
        window.location.href = 'https://fic-agro.chompipes.com/login';
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

// Cargar los JSON de usuarios, localidad y cultivos
let usuariosData = [];
let localidadData = {};
let cultivosData = {};

fetch('./assets/basa_data/user.json')
  .then(resp => resp.json())
  .then(data => { usuariosData = data; });
fetch('./assets/basa_data/localidad.json')
  .then(resp => resp.json())
  .then(data => { localidadData = data; window.localidadData = data; });
fetch('./assets/basa_data/cultivo.json')
  .then(resp => resp.json())
  .then(data => { cultivosData = data; window.cultivosData = data; });

function getLocalidadCultivoPorCodBase(cod_base) {
    const usuario = usuariosData.find(u => u.codigo_base === cod_base);
    if (!usuario) return { localidad: '', cultivo: '' };
    const localidad = (localidadData[usuario.localidad] && localidadData[usuario.localidad].nombre) || '';
    const cultivo = (cultivosData[usuario.cultivo] && cultivosData[usuario.cultivo].nombre) || '';
    return { localidad, cultivo };
}

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
    let botones = indices.map(indice => `<button class='btn-indice' onclick=\"cargarCapaIndice('${cod_base}','${indice}')\">${indice}</button>`).join(' ');
    contenedor.innerHTML += `<div style='margin-bottom:10px;'>${botones}</div><div id='info-indice'></div>`;
    // --- Simular doble click automático: primero EVI, luego NDVI ---
    setTimeout(() => {
        const btns = contenedor.querySelectorAll(".btn-indice");
        if (btns && btns.length > 1) {
            btns[1].click(); // EVI
            setTimeout(() => {
                btns[0].click(); // NDVI
            }, 300);
        } else if (btns && btns.length > 0) {
            btns[0].click(); // fallback: solo NDVI
        }
    }, 100);
}

function cargarCapaIndice(cod_base, indice) {
    const mapa = window.mapaSupervisor;
    if (!mapa) return;
    // Eliminar capas anteriores
    if (window.capaIndiceSupervisor) {
        mapa.removeLayer(window.capaIndiceSupervisor);
        window.capaIndiceSupervisor = null;
    }
    // Obtener localidad y cultivo dinámicamente
    const { localidad, cultivo } = getLocalidadCultivoPorCodBase(cod_base);
    if (!localidad || !cultivo) {
        document.getElementById('info-indice').innerHTML = `<h5>${indice}</h5><p>No se encontró localidad o cultivo</p>`;
        return;
    }
    const rutaCsv = `./assets/csv/Localidades/${localidad.toLowerCase().replace(/\s+/g, '')}_${cultivo.toLowerCase().replace(/\s+/g, '')}_${indice.toUpperCase()}.csv`;
    fetch(rutaCsv)
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
    window.location.href = 'https://fic-agro.chompipes.com/login';
}

// Exportar función para obtener los códigos base válidos para el supervisor
window.getCodigosBaseSupervisor = function() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
    return usuario && usuario.acceso_codebase ? usuario.acceso_codebase : [];
};
// Exportar función para obtener localidad y cultivo por código base
window.getLocalidadCultivoPorCodBase = getLocalidadCultivoPorCodBase;
// Exportar función para obtener localidad y cultivo del supervisor activo
window.getLocalidadCultivoSupervisor = function() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
    return usuario && usuario.localidad && usuario.cultivo
        ? { localidad: usuario.localidad, cultivo: usuario.cultivo }
        : { localidad: '', cultivo: '' };
};
