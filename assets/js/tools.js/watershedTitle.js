// watershedTitle.js

export const watershedNames = {
    "010": "Altiplánica",
    "023": "Fronterizas salares Atacama-Socompa",
    "024": "Endorreica entre fronterizas y Salar Atacama",
    "030": "Endorreica entre frontera y vertiente del Pacifico",
    "038": "Río Huasco",
    "043": "Río Elqui",
    "045": "Río Limari",
    "047": "Río Choapa",
    "051": "Río Petorca",
    "052": "Río Ligua",
    "054": "Río Aconcagua",
    "057": "Río Maipo",
    "060": "Río Rapel",
    "071": "Río Mataquito",
    "073": "Río Maule",
    "081": "Río Itata",
    "083": "Río Bio-Bio",
    "091": "Río Imperial",
    "094": "Río Tolten",
    "101": "Río Valdivia",
    "103": "Río Bueno",
    "104": "Cuencas e islas entre ríos Buenos y río Puelo",
    "105": "Río Puelo",
    "106": "Costeras entre Río Puelo y Río Yelcho",
    "107": "Río Yelcho",
    "108": "Costeras entre Río Yelcho y límite regional",
    "110": "Río Palena y costeras límite decima region",
    "111": "Costeras e islas entre Río Palena y Río Aysen",
    "112": "Archipielago de las Guaitecas y de los Chonos",
    "113": "Río Aysen",
    "114": "Costeras e islas entre Río Aysen y Canal General Martínez",
    "115": "Río Baker",
    "116": "Costeras e islas entre Río Baker y Río Pascua",
    "117": "Río Pascua",
    "118": "Costeras entre Río Pascua y límite regional",
    "119": "Cuenca del Pacífico",
    "120": "Costaras entre límite regional y Seno Andrew",
    "121": "Islas entre límite regional y canal Ancho",
    "122": "Costeras entre Seno Andrew y Río Hollemberg",
    "123": "Islas entre Canales Concepción y Estrecho de Magallanes",
    "124": "Costeras e islas Río Hollemberg",
    "125": "Costeras entre Laguna Blanca y Estrecho de Magallanes",
    "126": "Vertiente del Atlántico",
    "127": "Islas del Sur Estrecho de Magallanes",
    "128": "Tierra del Fuego",
    "129": "Islas del sur Canal Beagle y Territorio Antartico"
};

export function addCenteredTitle(map, watershed) {
    // Crear un contenedor para el título si no existe
    let titleDiv = document.getElementById('map-title');
    if (!titleDiv) {
        titleDiv = document.createElement('div');
        titleDiv.id = 'map-title';
        titleDiv.style.position = 'absolute';
        titleDiv.style.top = '0%';
        titleDiv.style.left = '50%';
        titleDiv.style.transform = 'translate(-50%, 0)';
        titleDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        titleDiv.style.padding = '10px';
        titleDiv.style.borderRadius = '8px';
        titleDiv.style.zIndex = '1000';
        titleDiv.style.pointerEvents = 'none';
        titleDiv.style.fontFamily = 'Arial';
        titleDiv.style.fontSize = '18px';
        titleDiv.style.fontWeight = 'bold';

        map.getContainer().appendChild(titleDiv);
    }

    // Obtener el nombre completo de la cuenca basado en el código
    const watershedName = watershedNames[watershed] || "Nombre desconocido";

    // Actualizar el contenido del título
    titleDiv.innerHTML = `2. Mapa de persistencia de nieve y tendencia (2000-2024) Cuenca: ${watershed} - ${watershedName}`;
}
