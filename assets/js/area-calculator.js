
class AreaCalculator {
    constructor(tiffUrl) {
        this.tiffUrl = tiffUrl;
    }

    async getCoveredArea() {
        try {
            // 1. Cargar el archivo TIFF
            const response = await fetch(this.tiffUrl);
            if (!response.ok) throw new Error("Error al cargar el TIFF");
            const arrayBuffer = await response.arrayBuffer();
            
            // 2. Parsear el TIFF
            const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
            const image = await tiff.getImage();
            
            // 3. Obtener metadatos
            const metadata = image.getFileDirectory();
            
            // 4. Buscar el atributo "COVERED AREA"
            const coveredArea = this.extractCoveredArea(metadata);
            
            if (!coveredArea) throw new Error("Atributo COVERED AREA no encontrado");
            
            return {
                area: coveredArea.value,
                unit: "km²",
                inHectares: coveredArea.value * 100 // 1 km² = 100 ha
            };
            
        } catch (error) {
            console.error("Error:", error);
            return { error: "No se pudo obtener el área" };
        }
    }

    extractCoveredArea(metadata) {
        // Buscar en diferentes posibles ubicaciones de metadatos
        return [
            metadata.ImageDescription,       // Tag 270
            metadata.GDAL_METADATA,          // Metadatos GDAL
            metadata.COMMENT,                // Tag 316
            metadata.Software,               // Tag 305
            metadata.DocumentName            // Tag 269
        ].find(data => data?.includes("COVERED AREA"));
    }

    // Método para parsear diferentes formatos de metadatos
    parseMetadataValue(data) {
        // Caso 1: Formato clave=valor
        const keyValueMatch = data.match(/COVERED AREA\s*=\s*([\d.]+)/i);
        if (keyValueMatch) return parseFloat(keyValueMatch[1]);
        
        // Caso 2: Metadatos XML (GDAL)
        if (data.startsWith("<")) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            const item = xmlDoc.querySelector('Item[name="COVERED AREA"]');
            if (item) return parseFloat(item.textContent);
        }
        
        // Caso 3: Formato libre
        const freeTextMatch = data.match(/COVERED AREA:?\s*([\d.,]+)\s*km²/i);
        return freeTextMatch ? parseFloat(freeTextMatch[1].replace(",", ".")) : null;
    }
}

// Uso
const initAreaCalculator = async () => {
    const calculator = new AreaCalculator('/assets/tiff/NDVI/cod_0001_NDVI.tif');
    const result = await calculator.getCoveredArea();
    
    if (!result.error) {
        document.getElementById("total-area").textContent = 
            `${result.inHectares.toFixed(2)} ha (${result.area} km²)`;
    }
};

document.addEventListener("DOMContentLoaded", initAreaCalculator);