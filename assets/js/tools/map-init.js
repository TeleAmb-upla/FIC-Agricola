let map;

export function initMap(mapId, options = {}) {
 if (map) {
   map.remove();
 }

 const defaultOptions = {
   center: [-33.036, -71.381],
   zoom: 11
 };

 const mapOptions = { ...defaultOptions, ...options };

 map = L.map(mapId).setView(mapOptions.center, mapOptions.zoom);

 L.tileLayer(
   'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
   {
     minZoom: 0,
     maxZoom: 19,
     attribution:
       '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions"'
   }
 ).addTo(map);

 return map;
}