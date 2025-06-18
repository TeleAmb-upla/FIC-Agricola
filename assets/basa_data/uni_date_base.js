// Cargamos los datos de los archivos JSON
Promise.all([
  fetch('./cultivo.json').then(res => res.json()),
  fetch('./user.json').then(res => res.json()),
  fetch('./localidad.json').then(res => res.json()),
  fectch('./indicadores.json').then(res => res.json())
]).then(([cultivos, usuariosData, localidad, indicadores]) => {

  // Recorremos cada "Agro"
  usuariosData.forEach(agro => {
    console.log(`Agro: ${agro.usuario}`);
    
    agro.usuarios.forEach(usuario => {
      // Obtenemos el ID del cultivo y buscamos el nombre
      const idCultivo = usuario.cultivo;
      const nombreCultivo = cultivos[idCultivo]?.nombre || 'Cultivo no encontrado';
      const localidadNombre = localidad[idCultivo]?.nombre || 'Localidad no encontrada';
      const indicadoresCultivo = indicadores[idCultivo]?.nombre || 'Indicadores no encontrados';
      // Imprimimos la información
     
     
      console.log(`Localidad: ${localidadNombre}`);
      console.log(`Usuario: ${usuario.usuario}`);
      console.log(`Nombre: ${usuario.Nombre}`);
      console.log(`Cultivo ID: ${idCultivo}`);
      console.log(`Cultivo Nombre: ${nombreCultivo}`);
      console.log(`Indicadores: ${(indicadoresCultivo)}`);
      console.log('-------------------------');
    });
  });
});
