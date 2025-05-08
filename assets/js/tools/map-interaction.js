export function enableRasterValuePopup(mapInstance, rasterLayer) {
    mapInstance.on("click", async function (e) {
      const { lat, lng } = e.latlng;
   
      if (rasterLayer && typeof rasterLayer.getValueAtLatLng === 'function') {
        try {
          const value = await rasterLayer.getValueAtLatLng(lat, lng);
          if (value !== undefined && value !== null && !isNaN(value)) {
            const formattedValue = value.toFixed(3);
            L.popup()
              .setLatLng([lat, lng])
              .setContent(`Valor NDVI: ${formattedValue}`)
              .openOn(mapInstance);
          } else {
            L.popup()
              .setLatLng([lat, lng])
              .setContent("Sin datos en esta ubicación.")
              .openOn(mapInstance);
          }
        } catch (error) {
          console.error("Error al obtener el valor del píxel:", error);
        }
      }
    });
   }