// rasterLoader.js

export async function loadGeoRasterLayer(url, map, colorFn) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    const georaster = await parseGeoraster(arrayBuffer);

    const rasterLayer = new GeoRasterLayer({
        georaster,
         resolution: 720,
        pixelValuesToColorFn: values => {
            const value = values[0];
            // Hacer transparente los valores 0 (que representan áreas fuera de la geometría)
            return value === 0 ? null : colorFn(value);
        }
    });

    return rasterLayer;
}
