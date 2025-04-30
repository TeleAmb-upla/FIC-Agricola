// Archivo: js/auth.js
function iniciarSesion() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    const usuarioValido = usuarios.find(u => 
      u.usuario === username && u.password === password
    );
  
    if (usuarioValido) {
      localStorage.setItem("usuarioActivo", JSON.stringify(usuarioValido));
      window.location.href = "mapa.html";
    } else {
      alert("Credenciales incorrectas");
    }
  }