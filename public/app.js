// Elementos DOM
const adminLink = document.querySelector('nav a[href="/dashboard.html"]');
const loginButton = document.querySelector('nav button[onclick="openLoginModal()"]');
const signupButton = document.getElementById("signupButton");
const userInfoDiv = document.getElementById("userInfo");
const reservationContainer = document.getElementById("reservationContainer");
const loginReminder = document.getElementById("loginReminder");

// Utils de autenticación
function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function removeToken() {
  localStorage.removeItem("token");
}

// Mostrar/Ocultar UI según usuario
function showUserInfo() {
  const token = getToken();

  const guestSection = document.getElementById("howItWorksGuest");
  const loggedSection = document.getElementById("howItWorksLogged");
  const patientDetails = document.getElementById("howItWorksPatient");
  const doctorDetails = document.getElementById("howItWorksDoctor");
  const adminDetails = document.getElementById("howItWorksAdmin");

  if (guestSection) guestSection.style.display = "none";
  if (loggedSection) loggedSection.style.display = "none";
  if (patientDetails) patientDetails.style.display = "none";
  if (doctorDetails) doctorDetails.style.display = "none";
  if (adminDetails) adminDetails.style.display = "none";

  if (!token) {
    adminLink && (adminLink.style.display = "none");
    userInfoDiv && (userInfoDiv.style.display = "none");
    loginButton && (loginButton.style.display = "inline-block");
    signupButton && (signupButton.style.display = "inline-block");
    reservationContainer && (reservationContainer.style.display = "none");
    loginReminder && (loginReminder.style.display = "block");
    if (guestSection) guestSection.style.display = "block";
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
      if (["admin", "doctor", "patient"].includes(user.role)) {
        adminLink && (adminLink.style.display = "inline-block");
      } else {
        adminLink && (adminLink.style.display = "none");
      }

      if (userInfoDiv) {
        userInfoDiv.style.display = "flex";
        document.getElementById("userName").textContent = `Hola, ${user.name}`;
      }

      loginButton && (loginButton.style.display = "none");
      signupButton && (signupButton.style.display = "none");

      if (user.role === "patient") {
        reservationContainer && (reservationContainer.style.display = "block");
        loginReminder && (loginReminder.style.display = "none");
        loadDoctors();
      } else {
        reservationContainer && (reservationContainer.style.display = "none");
        loginReminder && (loginReminder.style.display = "block");
      }
      if (loggedSection) loggedSection.style.display = "block";
      if (user.role === "patient" && patientDetails) patientDetails.style.display = "block";
      if (user.role === "doctor" && doctorDetails) doctorDetails.style.display = "block";
      if (user.role === "admin" && adminDetails) adminDetails.style.display = "block";

    })
    .catch(() => {
      removeToken();
      adminLink && (adminLink.style.display = "none");
      userInfoDiv && (userInfoDiv.style.display = "none");
      loginButton && (loginButton.style.display = "inline-block");
      signupButton && (signupButton.style.display = "inline-block");
      reservationContainer && (reservationContainer.style.display = "none");
      loginReminder && (loginReminder.style.display = "block");
      if (guestSection) guestSection.style.display = "block";
    });
}

// Logout
function logout() {
  removeToken();
  showUserInfo();
}

// Modales: abrir y cerrar
function openLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
}

function openSignupModal() {
  document.getElementById('signupModal').style.display = 'flex';
}

function closeSignupModal() {
  document.getElementById('signupModal').style.display = 'none';
}

// Login form submit
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setToken(data.token);
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
    document.getElementById('loginMessage').textContent = 'Error en el servidor.';
  }
});

// Signup form submit
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const phone = document.getElementById("signupPhone").value;
  const role = document.getElementById("signupRole").value;
  const birthdate = document.getElementById("birthdate").value;
  const gender = document.getElementById("gender").value;
  const specialty = document.getElementById("specialty").value;

  const payload = { name, email, password, role, phone };

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
      body: JSON.stringify(payload),
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
    console.error("Error en el registro:", error);
    document.getElementById("signupMessage").textContent = "Error del servidor.";
  }
});

// Mostrar campos según rol en signup
document.getElementById("signupRole").addEventListener("change", function () {
  const role = this.value;
  document.getElementById("patientFields").style.display = role === "patient" ? "block" : "none";
  document.getElementById("doctorFields").style.display = role === "doctor" ? "block" : "none";
});

// Formulario de reservación
document.getElementById("reservationForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = getToken();
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

// Cargar lista de doctores para reserva
async function loadDoctors() {
  try {
    const res = await fetch("/api/doctors");
    const doctors = await res.json();
    const select = document.getElementById("doctorSelect");

    // Limpia antes para evitar duplicados
    select.innerHTML = '<option value="" disabled selected>Selecciona un médico</option>';

    doctors.forEach((doc) => {
      const opt = document.createElement("option");
      opt.value = doc.id;
      opt.textContent = `${doc.name} (${doc.specialty})`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Error al cargar médicos", err);
  }
}

// Inicializar la UI con usuario si hay token
showUserInfo();
