// Carga y grafica el CSV solo por localidad y cultivo, siempre grafica P25, P50, P75 y solo los cod_base permitidos
// --- Diccionario para mostrar nombres de usuario en vez de cod_XXXX ---
let codBaseToNombre = {};
function cargarDiccionarioCodBaseNombre(callback) {
    d3.json('./assets/basa_data/user.json').then(usuarios => {
        codBaseToNombre = {};
        usuarios.forEach(u => {
            if (u.codigo_base && u.Nombre) {
                const primeraPalabra = u.Nombre.trim().split(/\s+/)[0];
                codBaseToNombre[u.codigo_base.toLowerCase()] = primeraPalabra;
            }
        });
        if (callback) callback();
    }).catch(() => {
        codBaseToNombre = {};
        if (callback) callback();
    });
}

function cargarCsvYGraficarPorLocalidadCultivo(localidad, cultivo, indice) {
    cargarDiccionarioCodBaseNombre(() => cargarCsvYGraficarPorLocalidadCultivoInterno(localidad, cultivo, indice));
}
function cargarCsvYGraficarPorLocalidadCultivoInterno(localidad, cultivo, indice) {
    if (!localidad || !cultivo) {
        d3.select('#d3-chart').html('<p style="color:red">No se encontró localidad o cultivo</p>');
        return;
    }
    // Ruta principal (numérica)
    const rutaCsvNum = `./assets/csv/Localidades/${localidad.toLowerCase().replace(/\s+/g, '')}_${cultivo.toLowerCase().replace(/\s+/g, '')}_${indice.toUpperCase()}.csv`;
    // Ruta alternativa (descriptiva)
    let localidadNombre = localidad, cultivoNombre = cultivo;
    // Si localidad/cultivo son códigos, buscar su nombre en los JSON globales si existen
    if (window.localidadData && window.localidadData[localidad]) localidadNombre = window.localidadData[localidad].nombre || localidad;
    if (window.cultivosData && window.cultivosData[cultivo]) cultivoNombre = window.cultivosData[cultivo].nombre || cultivo;
    const rutaCsvAlt = `./assets/csv/Localidades/${localidadNombre.toLowerCase().replace(/\s+/g, '_')}_${cultivoNombre.toLowerCase().replace(/\s+/g, '_')}_${indice.toUpperCase()}.csv`;
    // Intentar cargar primero la ruta numérica, si falla intenta la alternativa
    d3.select('#d3-chart').html(`<div class='loader'>Cargando CSV: <code>${rutaCsvNum}</code></div>`);
    console.log('[D3] Leyendo CSV:', rutaCsvNum);
    d3.csv(rutaCsvNum).then(data => {
        procesarDatosCsv(data, rutaCsvNum, localidad, cultivo, indice);
    }).catch(() => {
        // Si falla, intenta la ruta alternativa
        d3.select('#d3-chart').html(`<div class='loader'>Cargando CSV alternativo: <code>${rutaCsvAlt}</code></div>`);
        console.log('[D3] Intentando CSV alternativo:', rutaCsvAlt);
        d3.csv(rutaCsvAlt).then(data => {
            procesarDatosCsv(data, rutaCsvAlt, localidad, cultivo, indice);
        }).catch(() => {
            d3.select('#d3-chart').html(`<p style='color:red'>No se pudo cargar el CSV<br><code>${rutaCsvNum}</code><br>ni<br><code>${rutaCsvAlt}</code></p>`);
        });
    });
}

// Extraído la lógica de procesar y graficar para reutilizar
function procesarDatosCsv(data, rutaCsv, localidad, cultivo, indice) {
    const columnas = Object.keys(data[0] || {});
    const baseStats = ['P25', 'P50', 'P75'].filter(c => columnas.includes(c));
    let codBasePermitidos = [];
    try {
        const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
        if (usuarioActivo && Array.isArray(usuarioActivo.acceso_codebase)) {
            codBasePermitidos = usuarioActivo.acceso_codebase;
        }
    } catch (e) { console.warn('No se pudo leer usuarioActivo:', e); }
    const normalizar = s => {
        if (!s) return '';
        const match = s.toString().toLowerCase().replace(/[^a-z0-9]/g, '').match(/cod0*(\d+)/);
        if (match) return 'cod' + parseInt(match[1], 10);
        return s.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
    };
    const columnasNorm = columnas.map(normalizar);
    const codBaseEnCsv = codBasePermitidos.filter(cod => {
        const codNorm = normalizar(cod);
        return columnasNorm.includes(codNorm);
    });
    const codBaseFinal = codBaseEnCsv.map(cod => {
        const codNorm = normalizar(cod);
        const idx = columnasNorm.indexOf(codNorm);
        return idx !== -1 ? columnas[idx] : null;
    }).filter(Boolean);
    const columnasGraficar = [...baseStats, ...codBaseFinal];
    if (columnasGraficar.length === 0) {
        d3.select('#d3-chart').html(`<p style='color:red'>No hay datos para graficar<br><code>${rutaCsv}</code></p>`);
        return;
    }
    const codBaseFaltantes = codBasePermitidos.filter(cod => {
        const codNorm = normalizar(cod);
        return !columnasNorm.includes(codNorm);
    });
    if (codBaseFaltantes.length > 0) {
        const advertencia = `<div style='color:orange;font-size:0.95em;margin-bottom:8px'>⚠️ Advertencia: Los siguientes códigos base no se encontraron en el CSV y no serán graficados:<br><b>${codBaseFaltantes.join(', ')}</b></div>`;
        d3.select('#d3-chart').insert('div', ':first-child').html(advertencia);
        console.warn('[D3] Cod_base permitidos no encontrados en el CSV:', codBaseFaltantes);
    }
    console.log('[D3] Columnas a graficar:', columnasGraficar);
    dibujarGraficoD3(data, columnasGraficar, baseStats, codBaseFinal);
}

// Dibuja el gráfico de líneas usando D3 en el div #d3-chart, ahora con banda IQR, leyenda, tooltip, título, círculo semana, eje X meses
function dibujarGraficoD3(data, codigos, baseStats, codBaseFinal) {
    d3.select('#d3-chart').html('');
    if (!data || data.length === 0 || codigos.length === 0) {
        d3.select('#d3-chart').html('<p style="color:red">Sin datos para graficar</p>');
        return;
    }
    // --- Dimensiones y márgenes ---
    const contenedor = d3.select('#d3-chart');
    const anchoContenedor = contenedor.node().getBoundingClientRect().width;
    const altoViewBox = 400;
    const margin = {top: 40, right: 20, bottom: 50, left: 70};
    const width = anchoContenedor - margin.left - margin.right;
    const height = altoViewBox - margin.top - margin.bottom;
    // SVG responsivo
    const svg = contenedor
        .append('svg')
        .attr('width', '100%')
        .attr('viewBox', `0 0 ${anchoContenedor} ${altoViewBox}`);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // --- Eje X/Y y escalas base ---
    let x, y, xAxis, yAxis;
    const semanas = data.map(d => +d.week);
    const year = new Date().getFullYear();
    const meses = ['E','F','M','A','M','J','J','A','S','O','N','D'];
    function getWeeksInicioMes(year) {
        const weeks = [];
        for (let m = 0; m < 12; m++) {
            const firstDay = new Date(year, m, 1);
            const temp = new Date(firstDay.getTime());
            temp.setHours(0,0,0,0);
            temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
            const week1 = new Date(temp.getFullYear(), 0, 4);
            const weekNumber = 1 + Math.round(((temp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
            weeks.push(weekNumber);
        }
        return weeks;
    }
    const weeksInicioMes = getWeeksInicioMes(year);
    // --- Eje X ---
    x = d3.scaleLinear()
        .domain(d3.extent(semanas))
        .range([0, width]);
    xAxis = g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(53).tickFormat(d => {
            const idx = weeksInicioMes.indexOf(d);
            if (idx !== -1) return meses[idx];
            return '';
        }));
    // --- Título del eje X ---
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .style('text-anchor', 'middle')
        .text('Tiempo (Semanas)');
    // --- Eje Y ---
    // Calcular el mínimo y máximo global de todos los valores graficados (P25, P50, P75 y cod_base)
    let minVal = null, maxVal = null;
    const allVals = data.reduce((acc, d) => {
        codigos.forEach(c => {
            const v = +d[c];
            if (!isNaN(v)) acc.push(v);
        });
        return acc;
    }, []);
    minVal = d3.min(allVals);
    maxVal = d3.max(allVals);
    // Si todos los valores son iguales, forzar un rango mínimo
    if (minVal === maxVal) {
        minVal = minVal - 0.05;
        maxVal = maxVal + 0.05;
    }
    y = d3.scaleLinear()
        .domain([minVal - (maxVal-minVal)*0.03, maxVal + (maxVal-minVal)*0.1])
        .range([height, 0]);
    yAxis = g.append('g').attr('class', 'y-axis').call(d3.axisLeft(y));
    // --- Título del eje Y ---
    g.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', -55)
        .attr('x', -height / 2)
        .style('text-anchor', 'middle')
        .text(`Valores de ${document.getElementById('layerSelector')?.value?.toUpperCase() || ''}`);
    // --- Banda intercuartílica (área entre P25 y P75) ---
    let areaIQRPath = null;
    if (baseStats.includes('P25') && baseStats.includes('P75')) {
        const areaIQR = d3.area()
            .x(d => x(+d.week))
            .y0(d => y(+d.P25))
            .y1(d => y(+d.P75))
            .curve(d3.curveMonotoneX);
        areaIQRPath = g.append('path')
            .datum(data)
            .attr('class','area-iqr')
            .attr('fill', '#999')
            .attr('opacity', 0.3)
            .attr('d', areaIQR);
    }
    // --- Líneas ---
    const COLOR_P50 = '#1f77b4';
    const COLOR_P25 = '#999';
    const COLOR_P75 = '#999';
    const COLOR_SEMANA = '#d32f2f';
    const reservedColors = [COLOR_P50.toLowerCase(), COLOR_P25.toLowerCase(), COLOR_P75.toLowerCase(), COLOR_SEMANA.toLowerCase()];
    const codBasePalette = d3.schemeCategory10.filter(c => !reservedColors.includes(c.toLowerCase()));
    const color = c => {
        if (c === 'P25') return COLOR_P25;
        if (c === 'P50') return COLOR_P50;
        if (c === 'P75') return COLOR_P75;
        const idx = codigos.indexOf(c);
        return codBasePalette[idx % codBasePalette.length];
    };
    const linePaths = [];
    codigos.forEach((codigo, i) => {
        const isCodBase = codBaseFinal.includes(codigo);
        const lineGen = d3.line()
            .defined(d => d[codigo] !== undefined && d[codigo] !== null && d[codigo] !== '' && !isNaN(+d[codigo]))
            .x(d => x(+d.week))
            .y(d => y(+d[codigo]))
            .curve(d3.curveMonotoneX);
        const path = g.append('path')
            .datum(data)
            .attr('class',`line-codigo line-codigo-${i}`)
            .attr('fill', 'none')
            .attr('stroke', color(codigo))
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', isCodBase ? '7,4' : null)
            .attr('d', lineGen);
        if (isCodBase) {
            path.attr('stroke-dasharray', '7,4');
        }
        // Animación de trazo
        const totalLength = path.node().getTotalLength();
        if (isCodBase) {
            // Mantener dasharray siempre, incluso durante la animación
            path
                .attr('stroke-dasharray', '7,4,' + totalLength + ' ' + totalLength)
                .attr('stroke-dashoffset', totalLength)
                .transition()
                .duration(900)
                .ease(d3.easeCubic)
                .attr('stroke-dashoffset', 0)
                .attr('stroke-dasharray', '7,4'); // Fijar dash después de la animación
        } else {
            path
                .attr('stroke-dasharray', totalLength + ' ' + totalLength)
                .attr('stroke-dashoffset', totalLength)
                .transition()
                .duration(900)
                .ease(d3.easeCubic)
                .attr('stroke-dashoffset', 0)
                .attr('stroke-dasharray', null);
        }
        linePaths.push({codigo, path, lineGen});
    });
    // --- Círculo en el último valor de cada línea ---
    codBaseFinal.forEach((codigo, i) => {
        // Buscar el último punto válido
        let lastIdx = -1;
        for (let j = data.length - 1; j >= 0; j--) {
            const v = data[j][codigo];
            if (v !== undefined && v !== null && v !== '' && !isNaN(+v)) {
                lastIdx = j;
                break;
            }
        }
        if (lastIdx !== -1) {
            g.append('circle')
                .attr('cx', x(+data[lastIdx].week))
                .attr('cy', y(+data[lastIdx][codigo]))
                .attr('r', 5)
                .attr('fill', color(codigo))
                .attr('stroke', '#fff')
                .attr('stroke-width', 1.5)
                .attr('class', 'ultimo-valor-circulo');
        }
    });
    // --- Leyenda SVG en #legend-container ---
    const legendContainer = d3.select('#legend-container');
    legendContainer.html(''); // Limpia contenido previo
    // Leyenda: estilo dash para cod_base
    const legendData = [
        // Solo P50, renombrado a "Histórico Local"
        ...(baseStats.includes('P50') ? [{label: 'Histórico Local', color: COLOR_P50, style: 'solid'}] : []),
        ...codBaseFinal.map((c,i) => ({label: mostrarNombreCodBase(c), color: codBasePalette[i % codBasePalette.length], style: 'dash'})),
        {label: 'Semana seleccionada', color: COLOR_SEMANA, style: 'circle'}
    ];
    const legendWidth = 220;
    const legendHeight = legendData.length * 24 + 30;
    // Mayor desplazamiento horizontal para los ítems, pero no para el texto 'Leyenda'
    const legendOffsetX = 48; // más a la derecha
    const legendSvg = legendContainer.append('svg')
        .attr('width', legendWidth + legendOffsetX)
        .attr('height', legendHeight);
    legendSvg.append('text')
        .attr('x', (legendWidth + legendOffsetX) / 2)
        .attr('y', 12) // sube el texto 'Leyenda' más arriba
        .attr('text-anchor', 'middle')
        .attr('font-size', '1em')
        .attr('fill', '#222')
        .text('Leyenda');
    legendData.forEach((item,i) => {
        const y0 = 32 + i*24;
        if(item.style==='area'){
            legendSvg.append('rect')
                .attr('x',10+legendOffsetX).attr('y',y0-10).attr('width',32).attr('height',8)
                .attr('fill',item.color).attr('opacity',0.3);
        }else if(item.style==='dash'){
            legendSvg.append('line')
                .attr('x1',10+legendOffsetX).attr('y1',y0-5).attr('x2',42+legendOffsetX).attr('y2',y0-5)
                .attr('stroke',item.color).attr('stroke-width',3)
                .attr('stroke-dasharray','7,4');
        }else if(item.style==='circle'){
            legendSvg.append('circle')
                .attr('cx',26+legendOffsetX).attr('cy',y0-5).attr('r',8)
                .attr('fill','none')
                .attr('stroke',item.color)
                .attr('stroke-width',3);
        }else{
            legendSvg.append('line')
                .attr('x1',10+legendOffsetX).attr('y1',y0-5).attr('x2',42+legendOffsetX).attr('y2',y0-5)
                .attr('stroke',item.color).attr('stroke-width',3);
        }
        legendSvg.append('text')
            .attr('x',54+legendOffsetX).attr('y',y0+2)
            .attr('font-size','0.95em').attr('fill','#333')
            .text(item.label);
    });
    // --- Tooltip interactivo y línea vertical ---
    const focusGroup = g.append('g').attr('class','hover-line-group').style('display','none');
    focusGroup.append('line')
        .attr('class','hover-line')
        .attr('y1',0)
        .attr('y2',height)
        .attr('stroke','#999')
        .attr('stroke-width',1)
        .attr('stroke-dasharray','3,3');
    const tooltipBox = d3.select('#d3-tooltip');
    if(tooltipBox.empty()){
        d3.select('body').append('div').attr('id','d3-tooltip').style('position','absolute').style('pointer-events','none').style('background','#fff').style('border','1px solid #ccc').style('padding','7px 12px').style('border-radius','7px').style('font-size','0.95em').style('box-shadow','0 2px 8px rgba(0,0,0,0.12)').style('opacity',0);
    }
    // --- Tooltip personalizado ---
    svg.on('mousemove', function(event){
        const [mx] = d3.pointer(event, g.node());
        const weekX = Math.round(x.invert(mx));
        const closest = data.find(d => +d.week === weekX);
        if(closest){
            focusGroup.style('display',null);
            focusGroup.select('.hover-line')
                .attr('x1',x(weekX)).attr('x2',x(weekX));
            const tooltip = d3.select('#d3-tooltip');
            let html = `<strong>Semana ${closest.week}</strong><br>`;
            // Solo mostrar P50 (como Histórico Local), no P25 ni P75
            if (baseStats.includes('P50')) {
                html += `Histórico Local: ${closest['P50']!==undefined?Number(closest['P50']).toFixed(2):'N/A'}<br>`;
            }
            // Mostrar solo cod_base, pero con nombre
            codBaseFinal.forEach(c=>{html+=`${mostrarNombreCodBase(c)}: ${closest[c]!==undefined?Number(closest[c]).toFixed(2):'N/A'}<br>`});
            tooltip.html(html)
                .style('opacity',1)
                .style('left',(event.pageX+15)+'px')
                .style('top',(event.pageY-30)+'px');
        }
    }).on('mouseleave',function(){
        focusGroup.style('display','none');
        d3.select('#d3-tooltip').style('opacity',0);
    });
    // --- Título dinámico sobre el gráfico (arriba, texto personalizado) ---
    d3.select('#d3-chart-title').remove(); // Elimina título previo si existe
    let titulo = '';
    let info = null;
    if (window.getLocalidadCultivoSupervisor) {
        info = window.getLocalidadCultivoSupervisor();
    }
    const cultivo = info && info.cultivo ? info.cultivo : '';
    const localidad = info && info.localidad ? info.localidad : '';
    titulo = `Estado actual del cultivo en comparación con la evolución local: ${cultivo} en ${localidad} - 2025`;
    // Título centrado, subrayado solo bajo el texto y color verde
    d3.select('#d3-chart').insert('div', ':first-child')
        .attr('id', 'd3-chart-title')
        .style('font-size', '1.13em')
        .style('font-weight', null)
        .style('margin-bottom', '10px')
        .style('margin-top', '0')
        .style('text-align', 'center')
        .append('span')
        .style('display', 'inline-block')
        .style('border-bottom', '2.5px solid #43a047')
        .style('padding', '0 6px')
        .text(titulo);
    // --- Exponer los colores de cod_base en window para uso global (mapa, etc) ---
    window.codBaseColors = window.codBaseColors || {};
    codBaseFinal.forEach((codigo, i) => {
        window.codBaseColors[codigo] = color(codigo);
    });
}

// --- Modificar leyenda y tooltip para mostrar el nombre en vez de cod_XXXX ---
function mostrarNombreCodBase(cod) {
    // Busca el nombre usando el diccionario, si no existe, muestra el código original
    if (!cod) return cod;
    const key = cod.toLowerCase();
    return codBaseToNombre[key] || cod;
}

// Permite actualizar el gráfico al cambiar el índice desde un select con id 'layerSelector' o la semana desde 'weekSelector'
document.addEventListener('DOMContentLoaded', function() {
    const selectIndice = document.getElementById('layerSelector');
    if (selectIndice) {
        selectIndice.addEventListener('change', function() {
            const indiceNuevo = this.value;
            const info = window.getLocalidadCultivoSupervisor && window.getLocalidadCultivoSupervisor();
            if (info && info.localidad && info.cultivo) {
                window.cargarCsvYGraficarPorLocalidadCultivo(info.localidad, info.cultivo, indiceNuevo);
            }
        });
    }
    // Nuevo: actualizar gráfico al cambiar la semana
    const selectSemana = document.getElementById('weekSelector');
    if (selectSemana) {
        selectSemana.addEventListener('change', function() {
            const info = window.getLocalidadCultivoSupervisor && window.getLocalidadCultivoSupervisor();
            const indice = document.getElementById('layerSelector')?.value || '';
            if (info && info.localidad && info.cultivo && indice) {
                window.cargarCsvYGraficarPorLocalidadCultivo(info.localidad, info.cultivo, indice);
            }
        });
    }
});

window.cargarCsvYGraficarPorLocalidadCultivo = cargarCsvYGraficarPorLocalidadCultivo;