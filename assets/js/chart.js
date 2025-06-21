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
        .domain([1, 53])
        .range([margenIzquierdo, anchoGrafico + margenIzquierdo]);

    yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([altoGrafico + margenSuperior, margenSuperior]);

    // Líneas
    lineHistoric = d3.line()
        .x(d => xScale(d.week))
        .y(d => yScale(d.historic))
        .curve(d3.curveMonotoneX); // suaviza la línea histórica

    lineCurrent = d3.line()
        .defined(d => d.current !== null)
        .x(d => xScale(d.week))
        .y(d => yScale(d.current))
        .curve(d3.curveMonotoneX); // suaviza la línea actual

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
        .text("Tiempo (Semanas)");

    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", margenIzquierdo / 2 - 10)
        .attr("x", 0 - (altoGrafico + margenSuperior) / 2)
        .style("text-anchor", "middle")
        .text("Valor del Índice");
}



function weekToDate(year, week) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = new Date(simple);
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}


function getWeekStartEnd(year, week) {
    const d = weekToDate(year, week);
    const start = new Date(d);
    const end = new Date(d);
    end.setDate(end.getDate() + 6);
    return { start, end };
}

const year = 2025;

// Función principal para cargar datos
export function cargarDatosEnGrafico(rutaCSV, capaSeleccionada, cultivo, indice, localidad, semanaSeleccionada) {
    d3.csv(rutaCSV).then(datosCrudos => {
        const datos = datosCrudos.map(d => {
            const { start, end } = getWeekStartEnd(year, +d.Week);
            return {
                week: +d.Week,
                historic: +d.P50,
                current: d.Current ? +d.Current : null,
                Last: (
                    d.Last !== undefined &&
                    d.Last !== null &&
                    d.Last !== "" &&
                    d.Last !== " " &&
                    d.Last.toLowerCase?.() !== "na" &&
                    d.Last.toLowerCase?.() !== "null" &&
                    d.Last.toLowerCase?.() !== "undefined" &&
                    !isNaN(+d.Last)
                ) ? +d.Last : null,
                P25: +d.P25,
                P75: +d.P75,
                dateStart: start,
                dateEnd: end,
                month: start.getMonth(1) // 0 = enero, 1 = febrero, etc.
            };
        });

        if (!svg) inicializarGrafico();

        const margenSuperior = 30;
        const margenDerecho = 20;
        const margenInferior = 50;
        const margenIzquierdo = 70;

        const allValues = datos.reduce((acc, d) => {
            acc.push(d.historic, d.P25, d.P75);
            if (d.current !== null) acc.push(d.current);
            return acc;
        }, []);

        const minVal = d3.min(allValues);
        const maxVal = d3.max(allValues);
        const yMargin = (maxVal - minVal) * 0.1;

        const contenedor = d3.select("#d3-chart");
        const anchoContenedor = contenedor.node().getBoundingClientRect().width;
        const anchoGrafico = anchoContenedor - margenIzquierdo - margenDerecho;
        const altoGrafico = altoViewBox - margenSuperior - margenInferior;

        xScale.range([margenIzquierdo, anchoGrafico + margenIzquierdo]);
        yScale.domain([minVal - yMargin, maxVal + yMargin])
            .range([altoGrafico + margenSuperior, margenSuperior]);

        // --- AQUÍ SE DEFINEN LAS LETRAS DE LOS MESES PARA EL EJE X ---
        // E = Enero, F = Febrero, M = Marzo, A = Abril, M = Mayo, J = Junio,
        // J = Julio, A = Agosto, S = Septiembre, O = Octubre, N = Noviembre, D = Diciembre
        const meses = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
        // -------------------------------------------------------------

        // Calcular la semana de inicio de cada mes (aproximado, semana que contiene el día 1 de cada mes)
        function getWeeksInicioMes(year) {
            const weeks = []; // Array donde se guardarán los números de semana de inicio de cada mes
            for (let m = 0; m < 12; m++) { // Itera sobre los 12 meses (0=enero, 11=diciembre)
                const firstDay = new Date(year, m, 1); // Crea un objeto Date para el primer día del mes m
                // Calcular número de semana ISO:
                const temp = new Date(firstDay.getTime()); // Copia la fecha para no modificar firstDay
                temp.setHours(0, 0, 0, 0); // Asegura que la hora sea 00:00:00.000
                // Jueves en la semana ISO: ajusta la fecha al jueves de esa semana
                temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
                // Encuentra el jueves de la primera semana del año (ISO)
                const week1 = new Date(temp.getFullYear(), 0, 4);
                // Calcula el número de semana ISO para temp:
                // - Diferencia de días entre temp y week1
                // - Ajusta por desfase de días
                // - Divide por 7 para obtener semanas
                // - Suma 1 porque las semanas ISO empiezan en 1
                const weekNumber = 1 + Math.round(((temp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
                weeks.push(weekNumber); // Guarda el número de semana de inicio de ese mes
            }
            return weeks; // Devuelve un array de 12 elementos, uno por mes
        }

        const weeksInicioMes = getWeeksInicioMes(year);

        svg.select(".x-axis")
            .call(
                d3.axisBottom(xScale)
                    .ticks(53)
                    .tickFormat(function(d) {
                        // Mostrar la letra del mes solo en la semana de inicio de cada mes, el resto vacío
                        const idx = weeksInicioMes.indexOf(d);
                        if (idx !== -1) {
                            return meses[idx];
                        }
                        // No mostrar nada para los demás ticks
                        return "";
                    })
            );

        svg.select(".y-axis").call(d3.axisLeft(yScale).ticks(6));

        // Define colores fijos para cada línea (mover aquí, antes de cualquier uso)
        const COLOR_HISTORIC = "#1f77b4";   // azul
        const COLOR_CURRENT  = "#ff7f0e";   // naranja
        const COLOR_LAST     = "#2ca02c";   // verde
        const COLOR_IQR      = "#999";      // gris para banda intercuartílica

        // --- NUEVA LEYENDA EN EL CONTENEDOR legend-container ---
        // Limpia el contenedor y crea un SVG para la leyenda
        const legendData = [
           { label: "Histórico MD", color: COLOR_HISTORIC, style: "solid" },
            { label: "Actual", color: COLOR_CURRENT, style: "dash" },
             { label: "Último Valor", color: COLOR_CURRENT, style: "circle" },
       //   { label: "Último Año", color: COLOR_LAST, style: "solid" },
          { label: "IQR (P25-P75)", color: COLOR_IQR, style: "area" },
          { label: "Semana", color: "#d32f2f", style: "circle" }
         //   
        ];

        const legendContainer = d3.select("#legend-container");
        legendContainer.html(""); // Limpia contenido previo

        const legendWidth = 150; // Más ancho para evitar corte de texto
        const legendHeight = legendData.length * 24 + 28; // Espacio extra para el título
        const legendSvg = legendContainer.append("svg")
            .attr("width", legendWidth)
            .attr("height", legendHeight);

        const legendGroup = legendSvg.append("g")
            .attr("class", "custom-legend")
            .attr("transform", `translate(0,27)`); // Deja espacio arriba para el título

        // Título de la leyenda
        legendSvg.append("text")
            .attr("x", legendWidth / 2)
            .attr("y", 18)
            .attr("text-anchor", "middle")
            .attr("font-size", "1em")
            .attr("fill", "#222")
            .text("Leyenda");

        legendData.forEach((item, i) => {
            const entry = legendGroup.append("g")
                .attr("class", "legend-entry")
                .attr("transform", `translate(0,${i * 24})`);
            if (item.style === "area") {
                entry.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 32)
                    .attr("height", 8)
                    .attr("fill", item.color)
                    .attr("opacity", 0.3);
            } else if (item.style === "circle") {
                entry.append("circle")
                    .attr("cx", 16)
                    .attr("cy", 6)
                    .attr("r", 6)
                    .attr("fill", item.label === "Semana Seleccionada" ? "none" : item.color)
                    .attr("stroke", item.label === "Semana Seleccionada" ? item.color : "#fff")
                    .attr("stroke-width", 1.5);
            } else {
                entry.append("line")
                    .attr("x1", 0)
                    .attr("y1", 5)
                    .attr("x2", 32)
                    .attr("y2", 5)
                    .attr("stroke", item.color)
                    .attr("stroke-width", 3)
                    .attr("stroke-dasharray",
                        item.style === "dash" ? "7,4" :
                        item.style === "dot" ? "2,2" : "0"
                    );
            }
            entry.append("text")
                .attr("x", 40)
                .attr("y", 12)
                .attr("font-size", "0.8em")
                .attr("fill", "#333")
                .text(item.label);
        });

        // Banda intercuartílica (P25 - P75)
        svg.select(".area-iqr").remove();
        const areaIQR = d3.area()
            .x(d => xScale(d.week))
            .y0(d => yScale(d.P25))
            .y1(d => yScale(d.P75))
            .curve(d3.curveMonotoneX); // suaviza el área IQR
        
           // banda intercuartílica
        svg.append("path")
            .datum(datos)
            .attr("class", "area-iqr")
            .attr("fill", COLOR_IQR)
            .attr("opacity", 0.3)
            .attr("d", areaIQR);

        // Línea histórica
        svg.select(".linea-historic").remove();
        const lineaHistoric = svg.append("path")
            .datum(datos)
            .attr("class", "linea-historic")
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .style("stroke", COLOR_HISTORIC)
            .attr("d", lineHistoric);

        // Animación del trazo de la línea histórica
        const totalLengthHistoric = lineaHistoric.node().getTotalLength();
        lineaHistoric
            .attr("stroke-dasharray", totalLengthHistoric + " " + totalLengthHistoric)
            .attr("stroke-dashoffset", totalLengthHistoric)
            .transition()
            .duration(1200)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        // Línea actual
        svg.select(".linea-current").remove();
        const datosActual = datos.filter(d => d.current !== null);
        svg.append("path")
            .datum(datosActual)
            .attr("class", "linea-current")
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .style("stroke", COLOR_CURRENT)
            .attr("d", lineCurrent);

        // Punto final de la línea actual
        if (datosActual.length > 0) {
            const ultimo = datosActual[datosActual.length - 1];
            svg.selectAll(".punto-final-actual").remove();
            svg.append("circle")
                .attr("class", "punto-final-actual")
                .attr("cx", xScale(ultimo.week))
                .attr("cy", yScale(ultimo.current))
                .attr("r", 7)
                .attr("fill", COLOR_CURRENT)
                .attr("stroke", "#fff")
                .attr("stroke-width", 2);
        }
/*
        // Línea Last
        svg.select(".linea-last").remove();
        // Usar d3.line() con .defined() para saltar valores nulos y conectar los puntos válidos
        const lineLast = d3.line()
            .defined(d => !isNaN(d.Last) && d.Last !== null)
            .x(d => xScale(d.week))
            .y(d => yScale(d.Last))
            .curve(d3.curveMonotoneX); // suaviza la línea Last

        const lineaLast = svg.append("path")
            .datum(datos)
            .attr("class", "linea-last")
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5") // igual que la línea "current"
            .attr("stroke", COLOR_LAST)
            .attr("d", lineLast);

        // Animación del trazo de la línea Last (más lenta)
        const totalLengthLast = lineaLast.node().getTotalLength();
        lineaLast
            .attr("stroke-dasharray", totalLengthLast + " " + totalLengthLast)
            .attr("stroke-dashoffset", totalLengthLast)
            .transition()
            .duration(1800) // más lento que la histórica
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
*/
        // ------------------ NUEVO TOOLTIP DE LÍNEA --------------------
        svg.selectAll(".hover-line-group").remove();

        const focusGroup = svg.append("g").attr("class", "hover-line-group").style("display", "none");

        // Línea vertical
        focusGroup.append("line")
            .attr("class", "hover-line")
            .attr("y1", yScale.range()[1])
            .attr("y2", yScale.range()[0])
            .attr("stroke", "#999")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3");

        // Caja de información
        const tooltipBox = d3.select("#tooltip");
        svg.on("mousemove", (event) => {
            const [mouseX] = d3.pointer(event);
            const weekX = Math.round(xScale.invert(mouseX));
            const closest = datos.find(d => d.week === weekX);

            // Formato a máximo 3 caracteres (ej: 1.03, 0.99, etc.)
            function formatShort(val) {
                if (val === null || isNaN(val)) return "N/A";
                return Number(val).toFixed(2);
            }

            if (closest) {
                focusGroup.style("display", null);
                focusGroup.select(".hover-line")
                    .attr("x1", xScale(weekX))
                    .attr("x2", xScale(weekX));

                tooltipBox
                    .style("opacity", 1)
.html(`
    <strong>Semana ${closest.week}</strong><br>
    Actual: ${closest.current !== null ? formatShort(closest.current) : "N/A"}<br>
    Histórico: ${formatShort(closest.historic)}<br>
    P25: ${formatShort(closest.P25)}<br>
    P75: ${formatShort(closest.P75)}<br>
`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 30) + "px");
            }
        }).on("mouseleave", () => {
            focusGroup.style("display", "none");
            tooltipBox.style("opacity", 0);
        });



        // Título del gráfico
        let titulo = svg.select(".chart-title-svg");
        // Construir título dinámico
        const tituloDinamico = (cultivo && indice && localidad)
            ? `Estado actual del cultivo en comparación con la evolución local: ${cultivo} en ${localidad} - 2025`
            : `${capaSeleccionada} Actual (2025)`;
        if (titulo.empty()) {
            titulo = svg.append("text")
                .attr("class", "chart-title-svg")
                .attr("x", anchoContenedor / 2)
                .attr("y", margenSuperior / 2 + 10)
                .attr("text-anchor", "middle")
                .style("font-size", "1.2em")
                .text(tituloDinamico);
        } else {
            titulo.text(tituloDinamico);
        }

        // Línea de subrayado bajo el título (mismo ancho que el texto)
        svg.selectAll(".chart-title-underline").remove();
        // Esperar a que el texto esté en el DOM para medirlo
        const tituloNode = titulo.node();
        let textWidth = 200;
        if (tituloNode && typeof tituloNode.getComputedTextLength === 'function') {
            textWidth = tituloNode.getComputedTextLength();
        }
        svg.append("line")
            .attr("class", "chart-title-underline")
            .attr("x1", anchoContenedor / 2 - textWidth / 2)
            .attr("x2", anchoContenedor / 2 + textWidth / 2)
            .attr("y1", margenSuperior / 2 + 16)
            .attr("y2", margenSuperior / 2 + 16)
            .attr("stroke", "#4CAF50")
            .attr("stroke-width", 2);

        // Título del eje Y
        svg.select(".y-axis-label").text(`Valores de ${capaSeleccionada.toUpperCase()}`);

        // --- CÍRCULO DE SEMANA SELECCIONADA (solo si hay valor current) ---
        svg.selectAll('.semana-seleccionada-circle').remove();
        if (semanaSeleccionada) {
            const semanaNum = parseInt(semanaSeleccionada, 10);
            const puntoSemana = datos.find(d => d.week === semanaNum);
            if (puntoSemana && puntoSemana.current !== null && !isNaN(puntoSemana.current)) {
                svg.append('circle')
                    .attr('class', 'semana-seleccionada-circle')
                    .attr('cx', xScale(puntoSemana.week))
                    .attr('cy', yScale(puntoSemana.current))
                    .attr('r', 10)
                    .attr('fill', 'none')
                    .attr('stroke', '#d32f2f')
                    .attr('stroke-width', 3)
                    .attr('pointer-events', 'none');
            }
        }

    }).catch(error => console.error("Error al cargar datos:", error));
}
