// assets/js/chart.js
import * as d3 from 'https://cdn.skypack.dev/d3@7';

import { obtenerEscalaColor } from './color-ranges-chart.js'; // Importar la función de colores

// Variables globales necesarias
let svg, xScale, yScale, lineHistoric, lineCurrent;
let altoViewBox = 400; // Altura virtual del viewBox

// Función para aplicar el gradiente a una líne 
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


 // Función para generar la leyenda
 function generarLeyenda(svgLeyenda, capaSeleccionada, escalaColor) {
    svgLeyenda.selectAll("*").remove(); // Limpiar leyenda anterior

    const anchoLeyenda = 200;
    const altoLeyenda = 20;
    const margenLeyenda = { top: 10, right: 30, bottom: 30, left: 30 };
    const anchoGradiente = anchoLeyenda - margenLeyenda.left - margenLeyenda.right;

    // Título de la leyenda
    svgLeyenda.append("text")
        .attr("x", anchoLeyenda / 2)
        .attr("y", margenLeyenda.top)
        .style("text-anchor", "middle")
        .style("font-size", "0.9em")
        .text(capaSeleccionada.toUpperCase());

    // Crear el gradiente visual
    const gradiente = svgLeyenda.append("linearGradient")
        .attr("id", "leyenda-gradiente")
        .attr("x1", "0%")
        .attr("x2", "100%");

    const dominioEscala = escalaColor.domain();
    const rangoEscala = escalaColor.range();

    // Generar paradas basadas en el dominio de la escala
    const stops = dominioEscala.map((d, i) => ({
        offset: i / (dominioEscala.length - 1),
        color: escalaColor(d)
    }));

    gradiente.selectAll("stop")
        .data(stops)
        .enter().append("stop")
        .attr("offset", d => `${d.offset * 100}%`)
        .attr("stop-color", d => d.color);

    // Dibujar la barra del gradiente
    svgLeyenda.append("rect")
        .attr("x", margenLeyenda.left)
        .attr("y", margenLeyenda.top + 15)
        .attr("width", anchoGradiente)
        .attr("height", altoLeyenda)
        .style("fill", "url(#leyenda-gradiente)");

    // Añadir etiquetas numéricas
    const numTicksLeyenda = 5;
    const ticksLeyenda = d3.ticks(d3.min(dominioEscala), d3.max(dominioEscala), numTicksLeyenda);

    const escalaLeyenda = d3.scaleLinear()
        .domain([d3.min(dominioEscala), d3.max(dominioEscala)])
        .range([margenLeyenda.left, anchoLeyenda - margenLeyenda.right]);

    const ejeLeyenda = d3.axisBottom(escalaLeyenda)
        .tickValues(ticksLeyenda)
        .tickFormat(d3.format(".2f"));

    svgLeyenda.append("g")
        .attr("transform", `translate(0, ${margenLeyenda.top + 15 + altoLeyenda})`)
        .style("font-size", "0.7em")
        .call(ejeLeyenda);
}   

// Función para inicializar el gráfico (exportada)
export function inicializarGrafico() {
    // Limpiar SVG existente
    if (svg) svg.remove();

    // Configurar contenedor
    const contenedor = d3.select("#d3-chart");
    contenedor.html("");

    // Dimensiones del contenedor (solo para la escala X)
    const anchoContenedor = contenedor.node().getBoundingClientRect().width;
    const margenSuperior = 30;
    const margenDerecho = 20;
    const margenInferior = 50; // Asegúrate de usar este valor para el margen inferior
    const margenIzquierdo = 70; // Asegúrate de usar este valor para el margen izquierdo
    const anchoGrafico = anchoContenedor - margenIzquierdo - margenDerecho;
    const altoGrafico = altoViewBox - margenSuperior - margenInferior;

    // Crear SVG
    svg = contenedor.append("svg")
        .attr("width", "100%") // El ancho se controlará por CSS
        .attr("viewBox", `0 0 ${anchoContenedor} ${altoViewBox}`); // Ancho inicial del viewBox, altura virtual

    // Escalas
    xScale = d3.scaleLinear()
        .domain([1, 52])
        .range([margenIzquierdo, anchoGrafico + margenIzquierdo]); // Aplicar márgenes

    yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([altoGrafico + margenSuperior, margenSuperior]); // Aplicar márgenes (invertido)

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
        .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => `Sem ${d}`)); // Reducir número de ticks

    svg.append("g")
        .attr("transform", `translate(${margenIzquierdo}, 0)`)
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(5)); // Reducir número de ticks

    // Título del eje X
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", anchoContenedor / 2)
        .attr("y", altoGrafico + margenSuperior + margenInferior - 10) // Posición ajustada
        .style("text-anchor", "middle")
        .style("font-size", "1em")
        .text("Semana del Año");

    // Título del eje Y
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", margenIzquierdo / 2 - 10) // Posición ajustada
        .attr("x", 0 - (altoGrafico + margenSuperior) / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "1em")
        .text("Valor del Índice");
}


// Función principal (exportada)
// Función principal (exportada)
export function cargarDatosEnGrafico(rutaCSV, capaSeleccionada) {
    d3.csv(rutaCSV).then(datosCrudos => {
        const datos = datosCrudos.map(d => ({ week: +d.Week, historic: +d.Historic, current: d.Current ? +d.Current : null }));

        if (!svg) inicializarGrafico();

        const contenedor = d3.select("#d3-chart");
        const anchoContenedor = contenedor.node().getBoundingClientRect().width;
        const margenSuperior = 30;
        const margenDerecho = 20;
        const margenInferior = 50; // Asegúrate de usar este valor (coincide con inicializarGrafico)
        const margenIzquierdo = 70; // Asegúrate de usar este valor (coincide con inicializarGrafico)
        const anchoGrafico = anchoContenedor - margenIzquierdo - margenDerecho;
        const altoGrafico = altoViewBox - margenSuperior - margenInferior;

        svg.attr("viewBox", `0 0 ${anchoContenedor} ${altoViewBox}`);
        xScale.range([margenIzquierdo, anchoGrafico + margenIzquierdo]);
        yScale.range([altoGrafico + margenSuperior, margenSuperior]);

        svg.select(".x-axis").call(d3.axisBottom(xScale).ticks(7).tickFormat(d => `Sem ${d}`)); // es el texto del axis del eje X
        svg.select(".y-axis").call(d3.axisLeft(yScale).ticks(6)); // es el texto del axis del eje Y
         // Encontrar el valor mínimo y máximo para el eje Y (dinámico)
         const allValues = [];
         datos.forEach(d => {
             allValues.push(d.historic);
             if (d.current !== null) {
                 allValues.push(d.current);
             }
         });
         const minValue = d3.min(allValues);
         const maxValue = d3.max(allValues);
         const yMargin = (maxValue - minValue) * 0.1;
         yScale.domain([minValue - yMargin, maxValue + yMargin]).range([altoGrafico + margenSuperior, margenSuperior]);
         svg.select(".y-axis").call(d3.axisLeft(yScale).ticks(6));

         // Obtener la escala de color para el indicador actual
         const escalaColor = obtenerEscalaColor(capaSeleccionada);

         // Generar la leyenda
         const svgLeyenda = d3.select("#legend-container").append("svg")
             .attr("width", 200)
             .attr("height", 70);
         generarLeyenda(svgLeyenda, capaSeleccionada, escalaColor);

         // Definir IDs únicos para los gradientes
         const idGradienteHistoric = `gradiente-historic-${capaSeleccionada.replace(/[^a-zA-Z0-9]/g, '')}`;
         const idGradienteCurrent = `gradiente-current-${capaSeleccionada.replace(/[^a-zA-Z0-9]/g, '')}`;

                 // Aplicar gradiente a la línea histórica
                 let historicLine = svg.select(".linea-historic");
                 if (historicLine.empty()) {
                     historicLine = svg.append("path")
                         .datum(datos)
                         .attr("class", "linea-historic")
                         .attr("fill", "none")
                         .attr("stroke-width", 2);
                 }
                 historicLine.style("stroke", aplicarGradiente(svg, datos, escalaColor, idGradienteHistoric, d => d.historic))
                     .attr("d", lineHistoric);
     
                 // Aplicar gradiente a la línea actual
                 let currentLine = svg.select(".linea-current");
                 if (currentLine.empty()) {
                     currentLine = svg.append("path")
                         .datum(datos)
                         .attr("class", "linea-current")
                         .attr("fill", "none")
                         .attr("stroke-width", 2)
                         .attr("stroke-dasharray", "5,5");
                 }
                 currentLine.style("stroke", aplicarGradiente(svg, datos.filter(d => d.current !== null), escalaColor, idGradienteCurrent, d => d.current))
                     .attr("d", lineCurrent);

         
         // Destacar el último valor de la línea actual
         const datosActualesValidos = datos.filter(d => d.current !== null);
         if (datosActualesValidos.length > 0) {
             const ultimoDatoActual = datosActualesValidos[datosActualesValidos.length - 1];

             const ultimoCirculoActual = svg.selectAll(".ultimo-valor-actual")
                 .data([ultimoDatoActual]); // Bind solo el último dato

             ultimoCirculoActual.join(
                 enter => enter.append("circle")
                     .attr("class", "ultimo-valor-actual")
                     .attr("cx", d => xScale(d.week))
                     .attr("cy", d => yScale(d.current))
                     .attr("r", 8) // Radio más grande
                     .style("fill", "#2196F3") // Color de la línea actual
                     .style("stroke", "white")
                     .style("stroke-width", 1.5),
                 update => update
                     .attr("cx", d => xScale(d.week))
                     .attr("cy", d => yScale(d.current))
             );
         } else {
             // Si no hay datos actuales válidos, removemos cualquier círculo anterior
             svg.selectAll(".ultimo-valor-actual").remove();
         }

         
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
                         tooltip.html(`Semana: ${d.week}<br>${capaSeleccionada} Histórico: ${d.historic}<br>${capaSeleccionada}Actual: ${d.current}`)
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
                         tooltip.html(`Semana: ${d.week}<br>${capaSeleccionada} Histórico: ${d.historic}<br>${capaSeleccionada}Actual: ${d.current}`)
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