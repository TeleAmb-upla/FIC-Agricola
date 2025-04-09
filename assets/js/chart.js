// chart.js
function initChart() {
    const data = [0.5, 0.7, 0.8, 0.6, 0.9, 1.0, 0.4, 0.3, 0.2, 0.1];
    const width = 500;
    const height = 200;

    const svg = d3.select("#d3-chart")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`);

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 70)
        .attr("y", d => height - d)
        .attr("width", 65)
        .attr("height", d => d)
        .attr("fill", "#4CAF50");
    
    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font-family", "Arial")
        .text("Índice de Vegetación de Diferencia Normalizada (NDVI) (datos de ejemplo) ");
}

document.addEventListener('DOMContentLoaded', initChart);