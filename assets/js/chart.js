// assets/js/chart.js
import * as d3 from 'https://cdn.skypack.dev/d3@7';
import { obtenerEscalaColor } from './color-ranges-chart.js';

// Variables globales
let svg, xScale, yScale, lineHistoric, lineCurrent;
let altoViewBox = 400;

// Función para aplicar gradiente
function aplicarGradiente(svg, datos, escalaColor, idGradiente, valorAccessor) {
    const gradiente = svg.append("linearGradient")
        .attr("id", idGradiente)
        .attr("x1", "0%")
        .attr("x2", "100%");

    gradiente.selectAll("stop")
        .data(datos)
        .enter().append("stop")
        .attr("offset", (d, i) => i / (datos.length - 1))
        .attr("stop-color", d => escalaColor(valorAccessor(d)));

    return `url(#${idGradiente})`;
}

// Función para generar leyenda
function generarLeyenda(svgLeyenda, capaSeleccionada, escalaColor, minVal, maxVal) {
    svgLeyenda.selectAll("*").remove();

    const anchoLeyenda = 200;
    const altoLeyenda = 20;
    const margenLeyenda = { top: 10, right: 30, bottom: 30, left: 30 };
    const anchoGradiente = anchoLeyenda - margenLeyenda.left - margenLeyenda.right;

    // Título
    svgLeyenda.append("text")
        .attr("x", anchoLeyenda / 2)
        .attr("y", margenLeyenda.top)
        .style("text-anchor", "middle")
        .style("font-size", "0.9em")
        .text(capaSeleccionada.toUpperCase());

    // Gradiente
    const gradiente = svgLeyenda.append("linearGradient")
        .attr("id", "leyenda-gradiente")
        .attr("x1", "0%")
        .attr("x2", "100%");

    const stops = escalaColor.range().map((color, i, arr) => ({
        offset: i / (arr.length - 1),
        color: color
    }));

    gradiente.selectAll("stop")
        .data(stops)
        .enter().append("stop")
        .attr("offset", d => `${d.offset * 100}%`)
        .attr("stop-color", d => d.color);

    // Barra de color
    svgLeyenda.append("rect")
        .attr("x", margenLeyenda.left)
        .attr("y", margenLeyenda.top + 15)
        .attr("width", anchoGradiente)
        .attr("height", altoLeyenda)
        .style("fill", "url(#leyenda-gradiente)");

    // Eje numérico
    const escalaLeyenda = d3.scaleLinear()
        .domain([minVal, maxVal])
        .range([margenLeyenda.left, anchoLeyenda - margenLeyenda.right]);

    const numTicksLeyenda = 6;
    const ticksLeyenda = d3.ticks(minVal, maxVal, numTicksLeyenda);

    const ejeLeyenda = d3.axisBottom(escalaLeyenda)
        .tickValues(ticksLeyenda)
        .tickFormat(d3.format(".2f"));

    svgLeyenda.append("g")
        .attr("transform", `translate(0, ${margenLeyenda.top + 15 + altoLeyenda})`)
        .style("font-size", "0.7em")
        .call(ejeLeyenda);
}

// Función para inicializar el gráfico
export function inicializarGrafico() {
    if (svg) svg.remove();
    
    const contenedor = d3.select("#d3-chart");
    contenedor.html("");

    const anchoContenedor = contenedor.node().getBoundingClientRect().width;
    const margenSuperior = 30;
    const margenDerecho = 20;
    const margenInferior = 50;
    const margenIzquierdo = 70;
    const anchoGrafico = anchoContenedor - margenIzquierdo - margenDerecho;
    const altoGrafico = altoViewBox - margenSuperior - margenInferior;

    svg = contenedor.append("svg")
        .attr("width", "100%")
        .attr("viewBox", `0 0 ${anchoContenedor} ${altoViewBox}`);

    // Escalas iniciales
    xScale = d3.scaleLinear()
        .domain([1, 52])
        .range([margenIzquierdo, anchoGrafico + margenIzquierdo]);

    yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([altoGrafico + margenSuperior, margenSuperior]);

    // Líneas
    lineHistoric = d3.line()
        .x(d => xScale(d.week))
        .y(d => yScale(d.historic));

    lineCurrent = d3.line()
        .defined(d => d.current !== null)
        .x(d => xScale(d.week))
        .y(d => yScale(d.current));

    // Ejes
    svg.append("g")
        .attr("transform", `translate(0, ${altoGrafico + margenSuperior})`)
        .attr("class", "x-axis")
        .call(d3.axisBottom(xScale).ticks(7).tickFormat(d => `Sem ${d}`));

    svg.append("g")
        .attr("transform", `translate(${margenIzquierdo}, 0)`)
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(5));

    // Etiquetas ejes
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", anchoContenedor / 2)
        .attr("y", altoGrafico + margenSuperior + margenInferior - 10)
        .style("text-anchor", "middle")
        .text("Semana del Año");

    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", margenIzquierdo / 2 - 10)
        .attr("x", 0 - (altoGrafico + margenSuperior) / 2)
        .style("text-anchor", "middle")
        .text("Valor del Índice");
}

// Función principal para cargar datos
export function cargarDatosEnGrafico(rutaCSV, capaSeleccionada) {
    d3.csv(rutaCSV).then(datosCrudos => {
        const datos = datosCrudos.map(d => ({
            week: +d.Week,
            historic: +d.Historic,
            current: d.Current ? +d.Current : null
        }));

        if (!svg) inicializarGrafico();
     // Añadir esta sección de márgenes dentro de la función
     const margenSuperior = 30;
     const margenDerecho = 20;
     const margenInferior = 50;
     const margenIzquierdo = 70;
        





        // Calcular valores mínimos y máximos
        const allValues = datos.reduce((acc, d) => {
            acc.push(d.historic);
            if (d.current !== null) acc.push(d.current);
            return acc;
        }, []);
        
        const minVal = d3.min(allValues);
        const maxVal = d3.max(allValues);
        const yMargin = (maxVal - minVal) * 0.1;

        // Actualizar escalas
        const contenedor = d3.select("#d3-chart");
        const anchoContenedor = contenedor.node().getBoundingClientRect().width;
        const anchoGrafico = anchoContenedor - margenIzquierdo - margenDerecho;
        const altoGrafico = altoViewBox - margenSuperior - margenInferior;
        
        xScale.range([margenIzquierdo, anchoGrafico + margenIzquierdo]);
        yScale.domain([minVal - yMargin, maxVal + yMargin])
                .range([altoGrafico + margenSuperior, margenSuperior]);

        // Actualizar ejes
        svg.select(".x-axis").call(d3.axisBottom(xScale).ticks(7).tickFormat(d => `Sem ${d}`));
        svg.select(".y-axis").call(d3.axisLeft(yScale).ticks(6));

        // Crear escala de color
        const escalaColor = obtenerEscalaColor(capaSeleccionada, minVal, maxVal);

        // Generar leyenda
        const svgLeyenda = d3.select("#legend-container").html("").append("svg")
            .attr("width", 200)
            .attr("height", 70);
        generarLeyenda(svgLeyenda, capaSeleccionada, escalaColor, minVal, maxVal);

        // Aplicar gradientes
        const idGradienteHistoric = `gradiente-historic-${capaSeleccionada.replace(/[^a-zA-Z0-9]/g, '')}`;
        const idGradienteCurrent = `gradiente-current-${capaSeleccionada.replace(/[^a-zA-Z0-9]/g, '')}`;

        // Línea histórica
        svg.select(".linea-historic").remove();
        svg.append("path")
            .datum(datos)
            .attr("class", "linea-historic")
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .style("stroke", aplicarGradiente(svg, datos, escalaColor, idGradienteHistoric, d => d.historic))
            .attr("d", lineHistoric);

        // Línea actual
        svg.select(".linea-current").remove();
        svg.append("path")
            .datum(datos.filter(d => d.current !== null))
            .attr("class", "linea-current")
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .style("stroke", aplicarGradiente(svg, datos.filter(d => d.current !== null), escalaColor, idGradienteCurrent, d => d.current))
            .attr("d", lineCurrent);
         
         // Tooltip
         const tooltip = d3.select("#tooltip");

         const puntosHistoricos = svg.selectAll(".tooltip-circle-historic")
             .data(datos)
             .join(
                 enter => enter.append("circle")
                     .attr("class", "tooltip-circle-historic")
                     .attr("cx", d => xScale(d.week))
                     .attr("cy", d => yScale(d.historic))
                     .attr("r", 6)
                     .style("fill", "transparent")
                     .style("pointer-events", "all")
.on("mouseover", (event, d) => {
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`
        Semana: ${d.week}<br>
        ${capaSeleccionada} Histórico: ${d3.format(".3f")(d.historic)}<br>
        ${capaSeleccionada} Actual: ${d.current !== null ? d3.format(".3f")(d.current) : "N/A"}
    `)
    .style("left", (event.pageX + 5) + "px")
    .style("top", (event.pageY - 28) + "px");
})
                     .on("mouseout", () => {
                         tooltip.transition().duration(500).style("opacity", 0);
                     }),
                 update => update
                     .attr("cx", d => xScale(d.week))
                     .attr("cy", d => yScale(d.historic)),
                 exit => exit.remove()
             );

         const puntosActuales = svg.selectAll(".tooltip-circle-current")
             .data(datos.filter(d => d.current !== null)) // Filtra los datos donde 'current' no es null
             .join(
                 enter => enter.append("circle")
                     .attr("class", "tooltip-circle-current")
                     .attr("cx", d => xScale(d.week))
                     .attr("cy", d => yScale(d.current))
                     .attr("r", 6)
                     .style("fill", "transparent")
                     .style("pointer-events", "all")
                     .on("mouseover", (event, d) => {
                         tooltip.transition().duration(200).style("opacity", 0.9);
                         tooltip.html(`Semana: ${d.week}<br>${capaSeleccionada} Histórico: ${d.historic}<br>${capaSeleccionada} Actual: ${d.current}`)
                             .style("left", (event.pageX + 5) + "px")
                             .style("top", (event.pageY - 28) + "px");
                     })
                     .on("mouseout", () => {
                         tooltip.transition().duration(500).style("opacity", 0);
                     }),
                 update => update
                     .attr("cx", d => xScale(d.week))
                     .attr("cy", d => yScale(d.current)),
                 exit => exit.remove()
             );


         // Título del gráfico
         let titulo = svg.select(".chart-title-svg");
         if (titulo.empty()) {
             titulo = svg.append("text")
                 .attr("class", "chart-title-svg")
                 .attr("x", anchoContenedor / 2)
                 .attr("y", margenSuperior / 2 + 10)
                 .attr("text-anchor", "middle")
                 .style("font-size", "1.2em")
                 .text(`${capaSeleccionada} - Histórico vs Actual`);
         } else {
             titulo.text(`${capaSeleccionada} - Histórico vs Actual`);
         }

         // Actualizar el título del eje Y
         svg.select(".y-axis-label").text(`Valores de ${capaSeleccionada.toUpperCase()}`);

     }).catch(error => console.error("Error al cargar datos:", error));
}

