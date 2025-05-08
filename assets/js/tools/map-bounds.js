// assets/js/map-bounds.js

export function calculateBounds(georaster) {
    const xmin = georaster.xmin;
    const xmax = georaster.xmax;
    const ymin = georaster.ymin;
    const ymax = georaster.ymax;
   
    const bounds = [[ymin, xmin], [ymax, xmax]];
    return bounds;
   }