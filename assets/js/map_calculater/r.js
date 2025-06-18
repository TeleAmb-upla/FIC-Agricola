/*
#  Cargar la librería 'terra' para trabajar con archivos raster (como .tif)
library(terra)

#Establecer el directorio de trabajo donde están los archivos TIFF
setwd("C:/Users/RogStrixZ590E/Documents/GitHub/FIC-Agricola/assets/tiff")

#  Crear una lista con los nombres de los índices que se van a procesar
indices <- c("EVI", "GCI", "LAI", "MNDWI", "MSAVI", "NDMI", "NDVI", "NDWI", "SAVI", "GNDVI")

#  Bucle que recorre cada índice uno por uno
for (indice in indices) {
  
  # ️ Mostrar en consola cuál índice se está procesando
  cat("\n=== Índice:", indice, "===\n")
  
  #  Buscar los archivos TIFF históricos (años 2019 a 2024) para ese índice
  archivos_hist <- list.files(
    path = ".", 
    pattern = paste0("cod_0001_", indice, "_2019_2024_.*\\.tif$"),
    full.names = TRUE,
    recursive = TRUE
  )
  
  #  Buscar los archivos TIFF actuales (año 2025) para ese índice
  archivos_actual <- list.files(
    path = ".", 
    pattern = paste0("cod_0001_", indice, "_2025_2025_.*\\.tif$"),
    full.names = TRUE,
    recursive = TRUE
  )
  
  #  Función para calcular el valor mínimo y máximo de una lista de archivos TIFF
  calcular_min_max <- function(lista_archivos) {
    minimos <- c()
    maximos <- c()
    
    for (archivo in lista_archivos) {
      r <- tryCatch(rast(archivo), error = function(e) NULL)
      if (!is.null(r)) {
        valores <- values(r)
        if (!all(is.na(valores))) {
          minimos <- c(minimos, min(valores, na.rm = TRUE))
          maximos <- c(maximos, max(valores, na.rm = TRUE))
        }
      }
    }
    
    return(list(min = min(minimos, na.rm = TRUE), max = max(maximos, na.rm = TRUE)))
  }
  
  #  Si hay archivos históricos, calcular el mínimo y máximo
  if (length(archivos_hist) > 0) {
    res_hist <- calcular_min_max(archivos_hist)
    cat("Histórico (2019–2024)\n")
    cat("  Mínimo histórico:", res_hist$min, "\n")
    cat("  Máximo histórico:", res_hist$max, "\n")
  } else {
    cat("No se encontraron archivos históricos.\n")
    res_hist <- list(min = NA, max = NA)  # Agregado: establecer NA si no hay datos
  }
  
  #  Si hay archivos actuales (2025), calcular mínimo y máximo
  if (length(archivos_actual) > 0) {
    res_actual <- calcular_min_max(archivos_actual)
    cat("Actual (2025)\n")
    cat("  Mínimo actual:", res_actual$min, "\n")
    cat("  Máximo actual:", res_actual$max, "\n")
  } else {
    cat("No se encontraron archivos actuales.\n")
    res_actual <- list(min = NA, max = NA)  # Agregado: establecer NA si no hay datos
  }
  
  #  Agregado: calcular el mínimo absoluto y máximo absoluto si existen datos válidos
  if (!all(is.na(c(res_hist$min, res_actual$min))) && !all(is.na(c(res_hist$max, res_actual$max)))) {
    min_absoluto <- min(c(res_hist$min, res_actual$min), na.rm = TRUE)  # Mínimo entre históricos y actuales
    max_absoluto <- max(c(res_hist$max, res_actual$max), na.rm = TRUE)  # Máximo entre históricos y actuales
    
    # 🖨️ Imprimir los valores absolutos
    cat("🔴 Mínimo absoluto:", min_absoluto, "\n")
    cat("🟢 Máximo absoluto:", max_absoluto, "\n")
  } else {
    cat("⚠️ No se pudo calcular mínimo y máximo absolutos por falta de datos.\n")
  }
}


*/