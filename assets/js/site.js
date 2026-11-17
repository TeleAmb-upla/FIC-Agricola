/**
 * Comportamientos propios del sitio (Inicio).
 * - Lista de cultivos desde cultivo.json (con respaldo en el HTML).
 * - Mapa de provincias con alcance (Leaflet) dentro del modal.
 */
(function () {
  "use strict";

  /* ---------- Fotos rotativas del hero ---------- */
  (function heroRotator() {
    const root = document.getElementById("heroVisual");
    if (!root) return;
    const slides = Array.from(root.querySelectorAll(".hero-slide"));
    const dotsBox = document.getElementById("heroDots");
    const capBox = root.querySelector(".hero-caption");
    const capTitle = document.getElementById("heroCapTitle");
    const capSub = document.getElementById("heroCapSub");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const INTERVAL = 6500;
    let cur = 0, timer = null, paused = false;

    const dots = slides.map(function (s, i) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "hero-dot";
      b.setAttribute("aria-label", "Foto " + (i + 1) + " de " + slides.length);
      b.addEventListener("click", function () { go(i, true); });
      dotsBox.appendChild(b);
      return b;
    });

    function go(i, user) {
      i = (i + slides.length) % slides.length;
      if (i === cur && slides[i].classList.contains("is-active")) return;
      slides[cur].classList.remove("is-active");
      cur = i;
      slides[cur].classList.add("is-active");
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === cur); });
      capBox.classList.add("swap");
      setTimeout(function () {
        capTitle.textContent = slides[cur].dataset.title || "";
        capSub.textContent = slides[cur].dataset.sub || "";
        capBox.classList.remove("swap");
      }, 280);
      if (user) restart();
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() { if (reduce || paused || timer || document.hidden) return; timer = setInterval(function () { go(cur + 1); }, INTERVAL); }
    function restart() { stop(); start(); }

    document.getElementById("heroPrev").addEventListener("click", function () { go(cur - 1, true); });
    document.getElementById("heroNext").addEventListener("click", function () { go(cur + 1, true); });
    root.addEventListener("mouseenter", function () { paused = true; stop(); });
    root.addEventListener("mouseleave", function () { paused = false; start(); });
    root.addEventListener("focusin", function () { paused = true; stop(); });
    root.addEventListener("focusout", function () { paused = false; start(); });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    // Gesto táctil: deslizar para cambiar de foto
    let x0 = null;
    root.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1), true);
    });

    dots[0].classList.add("is-active");
    start();
  })();

  /* ---------- Cultivos ---------- */
  const cropGrid = document.getElementById("cropGrid");
  if (cropGrid && window.fetch) {
    fetch("./assets/basa_data/cultivo.json?v=20261116")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const nombres = Object.values(data).map((c) => c.nombre);
        if (!nombres.length) return;
        cropGrid.innerHTML = nombres
          .map((n) => {
            const t = n.charAt(0).toUpperCase() + n.slice(1);
            return '<div class="crop-chip"><i class="bi bi-flower2"></i> ' + t + "</div>";
          })
          .join("");
      })
      .catch(function () { /* se mantiene el listado estático */ });
  }

  /* ---------- Mapa de provincias ---------- */
  const mapModal = document.getElementById("modalProvincias");
  let map = null;

  // Seis provincias de la Región de Valparaíso con alcance del proyecto
  const provincias = [
    { nombre: "Los Andes", coords: [-32.8337, -70.5984] },
    { nombre: "San Felipe de Aconcagua", coords: [-32.7497, -70.7258] },
    { nombre: "Petorca", coords: [-32.2517, -70.9306] },
    { nombre: "Quillota", coords: [-32.8795, -71.2488] },
    { nombre: "Marga-Marga", coords: [-33.0472, -71.4425] },
    { nombre: "San Antonio", coords: [-33.5947, -71.6073] }
  ];

  function initMap() {
    if (map || typeof L === "undefined") return;
    map = L.map("mapSuperficie", { scrollWheelZoom: false }).setView([-32.9, -71.15], 8);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 17, attribution: "Imágenes &copy; Esri, Maxar, Earthstar Geographics" }
    ).addTo(map);

    const group = [];
    provincias.forEach(function (c) {
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
