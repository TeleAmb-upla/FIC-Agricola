// Archivo: js/auth.js

function iniciarSesion() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch('./assets/basa_data/user.json')
        .then(response => response.json())
        .then(data => {
            // Buscar usuario en todos los niveles
            let usuarioValido = null;
            let tipoUsuario = null;

            // Buscar en el primer nivel
            usuarioValido = data.find(u => u.usuario === username && u.password === password);
            if (usuarioValido) {
                tipoUsuario = usuarioValido.tipo || 'usuario';
            }

            // Si no se encuentra, buscar en los subusuarios
            if (!usuarioValido) {
                for (const grupo of data) {
                    if (grupo.usuarios && Array.isArray(grupo.usuarios)) {
                        const subUsuario = grupo.usuarios.find(
                            su => su.usuario === username && su.password === password
                        );
                        if (subUsuario) {
                            usuarioValido = subUsuario;
                            tipoUsuario = 'usuario';
                            break;
                        }
                    }
                }
            }

            // Si no se encuentra en user.json, buscar en access.json (supervisores)
            if (!usuarioValido) {
                fetch('./assets/basa_data/access.json')
                    .then(resp => resp.json())
                    .then(accessData => {
                        const supervisor = accessData.find(sup => sup.usuario === username && sup.password === password);
                        if (supervisor) {
                            usuarioValido = supervisor;
                            tipoUsuario = 'supervisor';
                        }
                        if (usuarioValido) {
                            localStorage.setItem("usuarioActivo", JSON.stringify(usuarioValido));
                            localStorage.setItem("tipoUsuario", tipoUsuario);
                            if (tipoUsuario === "supervisor") {
                                window.location.href = "supervisor.html";
                            } else {
                                window.location.href = "mapa.html";
                            }
                        } else {
                            alert("Credenciales incorrectas");
                        }
                    });
            } else {
                localStorage.setItem("usuarioActivo", JSON.stringify(usuarioValido));
                localStorage.setItem("tipoUsuario", tipoUsuario);
                if (tipoUsuario === "supervisor") {
                    window.location.href = "supervisor.html";
                } else {
                    window.location.href = "mapa.html";
                }
            }
        })
        .catch(error => {
            alert("Error al cargar usuarios");
            console.error(error);
        });
}