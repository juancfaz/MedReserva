function showUserInfo() {
  const token = localStorage.getItem("token");
  const adminLink = document.querySelector('nav a[href="/dashboard.html"]');
  const loginButton = document.querySelector('nav button[onclick="openLoginModal()"]');
  const signupButton = document.getElementById("signupButton");
  const userInfoDiv = document.getElementById("userInfo");
  const reservationContainer = document.getElementById("reservationContainer");
  const loginReminder = document.getElementById("loginReminder");

  if (!token) {
    if (adminLink) adminLink.style.display = "none";
    if (userInfoDiv) userInfoDiv.style.display = "none";
    if (loginButton) loginButton.style.display = "inline-block";
    if (signupButton) signupButton.style.display = "inline-block";
    if (reservationContainer) reservationContainer.style.display = "none";
    if (loginReminder) loginReminder.style.display = "block";
    return;
  }

  fetch("/api/me", {
    headers: { "Authorization": "Bearer " + token },
  })
    .then((res) => {
      if (!res.ok) throw new Error("No autorizado");
      return res.json();
    })
    .then((user) => {
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
      if (signupButton) signupButton.style.display = "none";

      if (user.role === "patient") {
        if (reservationContainer) reservationContainer.style.display = "block";
        if (loginReminder) loginReminder.style.display = "none";
        loadDoctors(); // solo carga doctores si es paciente
      } else {
        if (reservationContainer) reservationContainer.style.display = "none";
        if (loginReminder) loginReminder.style.display = "block";
      }
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      document.getElementById('loginMessage').style.color = 'green';
      document.getElementById('loginMessage').textContent = 'Login exitoso.';
      closeLoginModal();
      showUserInfo();
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
  const modal = document.getElementById('loginModal');
  modal.style.display = 'flex';
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  modal.style.display = 'none';
}

// Formulario de reservación
document.getElementById("reservationForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const date = document.getElementById("dtime").value;
  const doctorId = document.getElementById("doctorSelect").value;
  const reason = document.getElementById("reason").value;

  try {
    const res = await fetch("/reserve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ doctorId, date, reason }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Reserva creada con éxito.");
      document.getElementById("reservationForm").reset();
    } else {
      alert(data.error || "Error al crear la reserva.");
    }
  } catch (err) {
    console.error(err);
    alert("Error del servidor.");
  }
});

// Cargar doctores al formulario
async function loadDoctors() {
  try {
    const res = await fetch("/api/doctors");
    const doctors = await res.json();
    const select = document.getElementById("doctorSelect");

    doctors.forEach(doc => {
      const opt = document.createElement("option");
      opt.value = doc.id;
      opt.textContent = `${doc.name} (${doc.specialty})`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Error al cargar médicos", err);
  }
}

function openSignupModal() {
  const modal = document.getElementById('signupModal');
  modal.style.display = 'flex'; // para centrar también
}

function closeSignupModal() {
  const modal = document.getElementById('signupModal');
  modal.style.display = 'none';
}

// Mostrar campos según el rol
document.getElementById("signupRole").addEventListener("change", function () {
  const role = this.value;
  document.getElementById("patientFields").style.display = role === "patient" ? "block" : "none";
  document.getElementById("doctorFields").style.display = role === "doctor" ? "block" : "none";
});

// Manejar envío del formulario de registro
document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const phone = document.getElementById("signupPhone").value;
  const role = document.getElementById("signupRole").value;

  const birthdate = document.getElementById("birthdate").value;
  const gender = document.getElementById("gender").value;
  const specialty = document.getElementById("specialty").value;

  const payload = {
    name, email, password, role, phone
  };

  if (role === "patient") {
    payload.birthdate = birthdate;
    payload.gender = gender;
  } else if (role === "doctor") {
    payload.specialty = specialty;
  }

  try {
    const res = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    const msg = document.getElementById("signupMessage");
    if (res.ok) {
      msg.style.color = "green";
      msg.textContent = "Registro exitoso. Ahora puedes iniciar sesión.";
      document.getElementById("signupForm").reset();
    } else {
      msg.style.color = "red";
      msg.textContent = data.error || "Error en el registro.";
    }
  } catch (error) {
    console.error("Error de red:", error);
    document.getElementById("signupMessage").textContent = "Error del servidor.";
  }
});
