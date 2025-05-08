
import { getColorParams } from './map-colors.js'; // Importa la función de color


export async function loadGeoRasterLayer(url, mapInstance, capaSeleccionada) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener el archivo: ${response.status} ${response.statusText}`);
      }
  
      const arrayBuffer = await response.arrayBuffer();
      try {
        const georaster = await parseGeoraster(arrayBuffer);
        const params = getColorParams(capaSeleccionada);
  
        const pixelValuesToColorFn = values => {
          const value = values[0];
          if (value === null || isNaN(value)) {
            return null;
          }
  
          if (params && params.palette) {
            // Función de interpolación lineal para asignar colores
            const normalizedValue = (value - params.min) / (params.max - params.min);
            if (normalizedValue < 0 || normalizedValue > 1) {
              return null; // Valor fuera del rango de visualización
            }
  
            const palette = params.palette;
            const numColors = palette.length;
            const index = Math.floor(normalizedValue * (numColors - 1));
            return palette[index];
          } else {
            // Si no hay params definidos para la capa, usa una función de color por defecto o devuelve null
            console.warn(`No se encontraron parámetros de color para ${capaSeleccionada}`);
            return null; // O podrías usar una función de color por defecto aquí
          }
        };
  
        const rasterLayer = new GeoRasterLayer({
          georaster,
          resolution: 256,
          pixelValuesToColorFn: pixelValuesToColorFn,
          opacity: params ? params.opacity : 1 // Usa la opacidad si está definida
        });
  
        rasterLayer.addTo(mapInstance);
        return { rasterLayer, georaster };
      } catch (parseError) {
        console.error('Error al parsear el GeoTIFF:', parseError);
        throw new Error('Error al parsear el GeoTIFF');
      }
    } catch (fetchError) {
      console.error('Error al cargar el GeoTIFF:', fetchError);
      throw new Error('Error al cargar el GeoTIFF');
    }
  }