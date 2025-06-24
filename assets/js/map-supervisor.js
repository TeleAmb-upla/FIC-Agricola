// assets/js/map-supervisor.js
// Lógica exclusiva para el perfil supervisor

// Usar window para evitar doble declaración
window.maxMinHData = window.maxMinHData || {};

// Declarar select y cultivoSelector en window para evitar dobles declaraciones
window.select = window.select || document.getElementById('select-codebase');
window.cultivoSelector = window.cultivoSelector || document.getElementById('cultivoSelector');

async function cargarMaxMinH() {
    // Cargar la base completa
    const allData = await fetch('./assets/basa_data/max_min_h.json').then(r => r.json());
    const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
    // Filtrar solo los predios asignados
    const filtered = {};
    if (usuario && usuario.acceso_codebase) {
        usuario.acceso_codebase.forEach(cod => {
            if (allData[cod]) filtered[cod] = allData[cod];
        });
    }
    window.maxMinHData = filtered;
    // Guardar en localStorage para acceso seguro
    localStorage.setItem('maxMinHData', JSON.stringify(filtered));
}

document.addEventListener('DOMContentLoaded', async function() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
    if (!usuario || usuario.tipo !== 'supervisor' || !usuario.acceso_codebase) {
        window.location.href = 'plataforma.html';
        return;
    }
    // Mostrar nombre del supervisor
    const supervisorNombre = document.getElementById('supervisor-nombre');
    if (supervisorNombre) supervisorNombre.textContent = usuario.Nombre || usuario.usuario;

    // Mostrar nombre y localidad del supervisor en la sección de Datos del Usuario
    const userNameSpan = document.getElementById('user-name');
    const locationSelector = document.getElementById('locationSelector');
    if (userNameSpan) userNameSpan.textContent = usuario.Nombre || usuario.usuario;
    if (locationSelector) {
        // Buscar nombre de la localidad
        const localidadData = await fetch('./assets/basa_data/localidad.json').then(r => r.json());
        let localidadSupervisor = usuario.localidad;
        if (!localidadSupervisor && usuario.acceso_codebase) {
            const usuarios = await fetch('./assets/basa_data/user.json').then(r => r.json());
            localidadSupervisor = [...new Set(usuario.acceso_codebase.map(cod => {
                const u = usuarios.find(u => u.codigo_base === cod);
                return u?.localidad;
            }).filter(Boolean))].join(', ');
        }
        locationSelector.textContent = localidadData[localidadSupervisor]?.nombre || '-';
    }

    // Cargar datos de usuarios y cultivos
    const usuarios = await fetch('./assets/basa_data/user.json').then(r => r.json());
    const cultivosData = await fetch('./assets/basa_data/cultivo.json').then(r => r.json());

    // Obtener predios y cultivos únicos
    const predios = usuario.acceso_codebase.map(cod => usuarios.find(u => u.codigo_base === cod)).filter(Boolean);
    const cultivosSupervisor = [...new Set(predios.map(u => u.cultivo))];

    // Llenar select de predios (nombre agricultor) - SIEMPRE mostrar todos los predios a cargo
    function llenarSelectTodosPredios() {
        if (!window.select) return;
        window.select.innerHTML = '';
        predios.forEach(u => {
            const option = document.createElement('option');
            option.value = u.codigo_base;
            option.textContent = u.Nombre || u.usuario;
            window.select.appendChild(option);
        });
    }
    llenarSelectTodosPredios();

    // Llenar select de cultivos
    if (window.cultivoSelector) {
        window.cultivoSelector.innerHTML = '';
        cultivosSupervisor.forEach(cid => {
            const option = document.createElement('option');
            option.value = cid;
            option.textContent = cultivosData[cid]?.nombre || '-';
            window.cultivoSelector.appendChild(option);
        });
    }

    // Función para actualizar la info mostrada (solo en la lista, no duplicar)
    async function actualizarInfo() {
        // Ya no mostrar info individual aquí, solo en la lista
        const cont = document.getElementById('huerto-datos');
        if (cont) cont.innerHTML = '';
    }

    // Guardar predios y cultivos globalmente para fácil acceso
    window._prediosSupervisor = predios;
    window._cultivosSupervisor = cultivosSupervisor;

    // Función para actualizar el select de predios según cultivo
    function actualizarSelectPrediosPorCultivo(cultivoId) {
        select.innerHTML = '';
        const prediosFiltrados = predios.filter(u => u.cultivo === cultivoId);
        prediosFiltrados.forEach(u => {
            const option = document.createElement('option');
            option.value = u.codigo_base;
            option.textContent = u.Nombre || u.usuario;
            select.appendChild(option);
        });
        // Seleccionar el primero si existe
        if (prediosFiltrados.length > 0) {
            select.value = prediosFiltrados[0].codigo_base;
        }
    }

    // Mostrar lista de usuarios/predios del cultivo seleccionado
    async function mostrarListaPrediosCultivo(cultivoId) {
        const prediosFiltrados = predios.filter(u => u.cultivo === cultivoId);
        const cont = document.getElementById('lista-predios-cultivo');
        if (cont) {
            cont.innerHTML = prediosFiltrados.map(u => `
                <div style="margin-bottom:8px;">
                    <strong>${u.Nombre || u.usuario}</strong>
                </div>
                <hr style="margin:4px 0; border:0; border-top:1px solid #ccc;">
            `).join('');
        }
    }

    // Listener para el selector de cultivo
    if (window.cultivoSelector) {
        window.cultivoSelector.addEventListener('change', async function() {
            await mostrarListaPrediosCultivo(this.value);
            // Limpiar info individual
            const cont = document.getElementById('huerto-datos');
            if (cont) cont.innerHTML = '';
        });
        // Inicializar con el primer cultivo
        if (window.cultivoSelector.value) {
            await mostrarListaPrediosCultivo(window.cultivoSelector.value);
        }
    }

    // Listener para el selector de predios (sincroniza cultivo)
    if (window.select) {
        window.select.addEventListener('change', async function() {
            const cod = window.select.value;
            const user = predios.find(u => u.codigo_base === cod);
            if (window.cultivoSelector && user) {
                window.cultivoSelector.value = user.cultivo;
            }
            // Mostrar solo la info individual
            const cont = document.getElementById('huerto-datos');
            const cultivosData = await fetch('./assets/basa_data/cultivo.json').then(r => r.json());
            const localidad = await fetch('./assets/basa_data/localidad.json').then(r => r.json());
            if (cont && user) {
                cont.innerHTML = `
                    <div style='margin-bottom:8px;'>
                        <strong>${user.Nombre || user.usuario}</strong><br>
                        <span style="font-size:0.95em;">Cultivo: ${cultivosData[user.cultivo]?.nombre || '-'}<br>Localidad: ${localidad[user.localidad]?.nombre || '-'}</span>
                    </div>
                `;
            }
            // Limpiar la lista de todos los predios
            const lista = document.getElementById('lista-predios-cultivo');
            if (lista) lista.innerHTML = '';
        });
    }

    // Inicializar info
    if (select.value && cultivoSelector && cultivoSelector.value) {
        await actualizarInfo();
        await mostrarListaPrediosCultivo(cultivoSelector.value);
    }

    await cargarMaxMinH(); // Cargar la base al inicio
});

function mostrarMapaSupervisor(cod_base, cultivoId) {
    const contenedor = document.getElementById('huerto-datos');
    contenedor.innerHTML = `<div id="mapa-supervisor" style="height: 500px; width: 100%; margin-bottom: 20px;"></div>`;
    // Aquí puedes agregar la lógica para cargar el mapa y los datos del predio y cultivo seleccionado
    // Ejemplo: cargar un GeoTIFF, CSV, etc. según el código seleccionado
    // ...
}

// Mejorar visualización: solo mostrar nombre, localidad y cultivo
async function cargarDatosPrediosSupervisor(usuario, usuariosData, cultivoId) {
    const [cultivos, localidad] = await Promise.all([
        fetch('./assets/basa_data/cultivo.json').then(r => r.json()),
        fetch('./assets/basa_data/localidad.json').then(r => r.json())
    ]);
    const usuarios = usuariosData || await fetch('./assets/basa_data/user.json').then(r => r.json());
    const cod = document.getElementById('select-codebase')?.value;
    const user = usuarios.find(u => u.codigo_base === cod && (!cultivoId || u.cultivo === cultivoId));
    const cont = document.getElementById('huerto-datos');
    if (cont && user) {
        cont.innerHTML = `
            <div class="predio-info">
                <p><strong>Agricultor:</strong> ${user.Nombre || user.usuario}</p>
                <p><strong>Cultivo:</strong> ${cultivos[user.cultivo]?.nombre || '-'}</p>
                <p><strong>Localidad:</strong> ${localidad[user.localidad]?.nombre || '-'}</p>
            </div>
        `;
    }
}

// Actualizar datos al cambiar el select
if (window.select) {
    window.select.addEventListener('change', async function() {
        const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
        const usuarios = await fetch('./assets/basa_data/user.json').then(r => r.json());
        await cargarDatosPrediosSupervisor(usuario, usuarios);
    });
}
// Actualizar datos al cambiar el select de cultivos
if (window.cultivoSelector) {
    window.cultivoSelector.addEventListener('change', async function() {
        const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
        const usuarios = await fetch('./assets/basa_data/user.json').then(r => r.json());
        await cargarDatosPrediosSupervisor(usuario, usuarios, this.value);
    });
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'plataforma.html';
}

// --- Crear capa raster con borde del color correspondiente al cod_base ---
function crearGeoRasterLayerConColor(geoRaster, cod_base, opcionesExtra = {}) {
    return L.geoRasterLayer(geoRaster, {
        // ...otros estilos que ya usas...
        color: getColorForCodBase(cod_base), // borde igual al gráfico
        weight: 3, // o el valor que prefieras
        fill: true, // mantiene el relleno igual
        ...opcionesExtra
    });
}

// Utilidad: obtener color de cod_base desde window.codBaseColors (si existe), si no, usar dorado por defecto
function getColorForCodBase(cod_base) {
    if (!cod_base) return '#FFD700';
    const key = cod_base.toLowerCase();
    if (window.codBaseColors && window.codBaseColors[key]) {
        return window.codBaseColors[key];
    }
    // Fallback: dorado
    return '#FFD700';
}

// Ejemplo de uso: cuando dibujes el borde de un raster, usa getColorForCodBase(cod_base)
// Por ejemplo:
// rasterLayer.setStyle({ color: getColorForCodBase(cod_base), weight: 3 });
