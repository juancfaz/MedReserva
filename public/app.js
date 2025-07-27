function showUserInfo() {
  const token = localStorage.getItem("token");
  const adminLink = document.querySelector('nav a[href="/dashboard.html"]');
  const loginButton = document.querySelector("nav button");
  const userInfoDiv = document.getElementById("userInfo");
  const reservationContainer = document.getElementById("reservationContainer");
  const loginReminder = document.getElementById("loginReminder");

  if (!token) {
    // No token: ocultar admin, userInfo y formulario. Mostrar botón login y mensaje.
    if (adminLink) adminLink.style.display = "none";
    if (userInfoDiv) userInfoDiv.style.display = "none";
    if (loginButton) loginButton.style.display = "inline-block";

    if (reservationContainer) reservationContainer.style.display = "none";
    if (loginReminder) loginReminder.style.display = "block";

    return;
  }

  fetch("/api/me", {
    headers: {
      "Authorization": "Bearer " + token,
    },
  })
  .then((res) => {
    if (!res.ok) throw new Error("No autorizado");
    return res.json();
  })
  .then((user) => {
    // Mostrar u ocultar enlace admin según rol
    if (user.role === "admin" || user.role === "doctor" || user.role === "patient") {
      if (adminLink) adminLink.style.display = "inline-block";
    } else {
      if (adminLink) adminLink.style.display = "none";
    }

    if (userInfoDiv) {
      userInfoDiv.style.display = "block";
      document.getElementById("userName").textContent = `Hola, ${user.name}`;
    }
    if (loginButton) loginButton.style.display = "none";

    if (reservationContainer) reservationContainer.style.display = "block";
    if (loginReminder) loginReminder.style.display = "none";
  })
  .catch(() => {
    localStorage.removeItem("token");

    if (adminLink) adminLink.style.display = "none";
    if (userInfoDiv) userInfoDiv.style.display = "none";
    if (loginButton) loginButton.style.display = "inline-block";

    if (reservationContainer) reservationContainer.style.display = "none";
    if (loginReminder) loginReminder.style.display = "block";
  });
}

function logout() {
  localStorage.removeItem("token");
  showUserInfo();
}

showUserInfo();

document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Guardamos el token en localStorage
      localStorage.setItem('token', data.token);

      document.getElementById('loginMessage').style.color = 'green';
      document.getElementById('loginMessage').textContent = 'Login exitoso.';

      closeLoginModal();
      showUserInfo(); // actualizar interfaz después de login
    } else {
      document.getElementById('loginMessage').style.color = 'red';
      document.getElementById('loginMessage').textContent = data.message || 'Error al iniciar sesión.';
    }

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    document.getElementById('loginMessage').textContent = 'Ocurrió un error en el servidor.';
  }
});

function openLoginModal() {
  document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
}
