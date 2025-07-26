document.querySelector("#reservationForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("fname").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const date = document.getElementById("dtime").value;
    const reason = document.getElementById("reason").value.trim();
    const category = document.getElementById("category").value;

    if (name === "") {
        alert("Please enter your full name.");
        return;
    }

    // Validar teléfono (mínimo 7 a 15 dígitos, puede iniciar con +)
    const phoneRegex = /^\+?\d{7,15}$/;
    if (!phoneRegex.test(phone)) {
        alert("Please enter a valid phone number.");
        return;
    }

    // Validar email (ya valida el input type email, pero puede reforzarse)
    if (email === "" || !email.includes("@")) {
        alert("Please enter a valid email address.");
        return;
    }

    if (date === "") {
        alert("Please select a date and time.");
        return;
    }

    if (category === "") {
        alert("Please select a category.");
        return;
    }

    const now = new Date();
    const selected = new Date(date);

    if (selected <= now) {
        alert("The date must be in the future.");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in to make a reservation.");
        return;
    }

    fetch("/reserve", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ name, phone, email, date, reason, category })
    })
    .then(res => {
        if (!res.ok) throw new Error("Error submitting reservation");
        return res.json();
    })
    .then(data => {
        alert(data.message);
        document.querySelector("#reservationForm").reset();
    })
    .catch(err => {
        alert(err.message);
        console.error(err);
    });
});

function showUserInfo() {
  const token = localStorage.getItem("token");
  const adminLink = document.querySelector('nav a[href="/admin.html"]');
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
    if (user.role === "admin") {
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

  const email = document.getElementById('email').value.trim();
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
