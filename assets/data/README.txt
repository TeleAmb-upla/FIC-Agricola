GeoJSON del mapa del cuartel
============================

Copia aquí tu archivo con el nombre exacto:

    cuartel.geojson

Se muestra en Metodología > "¿Cómo se muestra la información?" > "Distribución espacial".
Mientras no exista ese archivo, el mapa muestra datos de ejemplo (con la etiqueta "Datos de ejemplo").

Formato esperado
----------------
- FeatureCollection en WGS84 (EPSG:4326, longitud/latitud).
- Geometrías: Polygon / MultiPolygon (también admite puntos).
- Propiedades (se detectan automáticamente la primera que exista):
    * Valor del índice (colorea el mapa): ndvi, evi, savi, ndre, ndwi, ndmi, valor, value, indice, mean, media
      (si no hay ninguna, se usa la primera propiedad numérica).
    * Nombre del cuartel: cuartel, nombre, name, id_cuartel, cod_cuartel, codigo, id
    * Sector (opcional): sector, zona, id_sector
  Las demás propiedades se muestran como detalle adicional al pasar el cursor.

Ejemplo mínimo
--------------
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "cuartel": "C00105", "sector": "A", "ndvi": 0.62 },
      "geometry": { "type": "Polygon", "coordinates": [[[-70.72,-32.74],[-70.719,-32.74],[-70.719,-32.741],[-70.72,-32.741],[-70.72,-32.74]]] }
    }
  ]
}

Para cambiar el nombre/ruta del archivo o las propiedades buscadas, editar la parte superior de
assets/js/informacion.js (GEOJSON_URL, VALUE_PROPS, NAME_PROPS).
