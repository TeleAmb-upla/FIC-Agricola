document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const button = this.querySelector('button');
    button.classList.add('loading');
    
    // Simular carga
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Credenciales válidas (¡Modifícalas!)
    const validCredentials = [
        { user: "Fic", pass: "Fic" }
    ];
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const isValid = validCredentials.some(cred => 
        cred.user === username && cred.pass === password
    );
    
    button.classList.remove('loading');
    
    if(isValid) {
        window.location.href = "mapa.html";
    } else {
        alert("Credenciales incorrectas\nPrueba con:\nUsuario: Fic\nContraseña: Fic");
    }
});