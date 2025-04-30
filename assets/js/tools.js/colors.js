// colors.js

export function valueToSTColor(value) {
    const domain = [
        -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 
         0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10
    ];
    const range = [
        "#FF0000", "#fb3629", "#FF1E1F", "#FE393A", "#FE5456", "#FD6F72", "#FD8B8D", 
        "#FCA6A9", "#FCC1C5", "#FBDCE0", "#FBF7FC", "#FBF7FC", "#DFDEFC", "#C4C4FD", 
        "#A8ABFD", "#8D92FD", "#7178FE", "#565FFE", "#3A46FE", "#1F2CFF", 
        "#0313FF", "#0000FF"
    ];

    for (let i = 0; i < domain.length; i++) {
        if (value <= domain[i]) {
            return range[i];
        }
    }
    return range[range.length - 1];
}

export function valueToSPColor(value) {
    const ranges = [
        { max: 100, color: "#004C99" }, // Azul oscuro
        { max: 90, color: "#006EB5" },  // Azul intermedio
        { max: 80, color: "#0084A8" },  // Azul claro
        { max: 70, color: "#00A884" },  // Verde azulado
        { max: 60, color: "#70A800" },  // Verde medio
        { max: 50, color: "#E69800" },  // Amarillo oscuro
        { max: 40, color: "#FFAA00" },  // Amarillo
        { max: 30, color: "#FFD37F" },  // Amarillo claro
        { max: 20, color: "#FFEBBE" },  // Beige claro
        { max: 10, color: "#FFFFB4" },  // Amarillo muy claro
        { max: 0, color: "#FFFFE6" }    // Amarillo casi blanco
    ];

    for (const range of ranges) {
        if (value >= range.max) {
            return range.color;
        }
    }
    return ranges[ranges.length - 1].color;
}
