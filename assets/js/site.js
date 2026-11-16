/**
 * Comportamientos propios del sitio (Inicio).
 * - Lista de cultivos desde cultivo.json (con respaldo en el HTML).
 * - Mapa de superficie monitoreada (Leaflet) dentro del modal.
 */
(function () {
  "use strict";

  /* ---------- Cultivos ---------- */
  const cropGrid = document.getElementById("cropGrid");
  if (cropGrid && window.fetch) {
    fetch("./assets/basa_data/cultivo.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const nombres = Object.values(data).map((c) => c.nombre);
        if (!nombres.length) return;
        cropGrid.innerHTML = nombres
          .map((n) => {
            const t = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
            return '<div class="crop-chip"><i class="bi bi-flower2"></i> ' + t + "</div>";
          })
          .join("");
      })
      .catch(() => { /* se mantiene el listado estático */ });
  }

  /* ---------- Mapa de superficie ---------- */
  const mapModal = document.getElementById("modalSuperficie");
  let map = null;

  // Cinco provincias de la Región de Valparaíso con predios monitoreados
  const provincias = [
    { nombre: "Petorca", coords: [-32.2517, -70.9306] },
    { nombre: "Quillota", coords: [-32.8795, -71.2488] },
    { nombre: "San Felipe de Aconcagua", coords: [-32.7497, -70.7258] },
    { nombre: "Los Andes", coords: [-32.8337, -70.5984] },
    { nombre: "Valparaíso", coords: [-33.0458, -71.6197] }
  ];

  function initMap() {
    if (map || typeof L === "undefined") return;
    map = L.map("mapSuperficie", { scrollWheelZoom: false }).setView([-32.75, -71.0], 8);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 17, attribution: "Imágenes &copy; Esri, Maxar, Earthstar Geographics" }
    ).addTo(map);

    const group = [];
    provincias.forEach((c) => {
      const m = L.circleMarker(c.coords, {
        radius: 11,
        color: "#ffffff",
        weight: 3,
        fillColor: "#34bf49",
        fillOpacity: 0.95
      }).addTo(map);
      m.bindTooltip(c.nombre, { direction: "top", offset: [0, -8] });
      group.push(c.coords);
    });
    map.fitBounds(L.latLngBounds(group), { padding: [40, 40] });
  }

  if (mapModal) {
    mapModal.addEventListener("shown.bs.modal", function () {
      initMap();
      if (map) map.invalidateSize();
    });
  }
})();
