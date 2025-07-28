// Elementos DOM
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

  const loggedSection = document.getElementById("howItWorksLogged");
  const patientDetails = document.getElementById("howItWorksPatient");
  const doctorDetails = document.getElementById("howItWorksDoctor");
  const adminDetails = document.getElementById("howItWorksAdmin");
  const heroSection = document.getElementById("heroSection");

  if (loggedSection) loggedSection.style.display = "none";
  if (patientDetails) patientDetails.style.display = "none";
  if (doctorDetails) doctorDetails.style.display = "none";
  if (adminDetails) adminDetails.style.display = "none";

  if (!token) {
    userInfoDiv && (userInfoDiv.style.display = "none");
    loginButton && (loginButton.style.display = "inline-block");
    signupButton && (signupButton.style.display = "inline-block");
    reservationContainer && (reservationContainer.style.display = "none");
    loginReminder && (loginReminder.style.display = "block");
    
    if (heroSection) heroSection.style.display = "block";
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
      if (userInfoDiv) {
        userInfoDiv.style.display = "flex";
        document.getElementById("userName").textContent = `Hola, ${user.name}`;
      }

      loginButton && (loginButton.style.display = "none");
      signupButton && (signupButton.style.display = "none");

      if (user.role === "patient") {
        reservationContainer && (reservationContainer.style.display = "block");
        loadDoctors();
      } else {
        reservationContainer && (reservationContainer.style.display = "none");
      }

      if (user.role === "admin" || user.role === "doctor" || user.role === "patient") {
        loginReminder && (loginReminder.style.display = "none");
      }
      else {
        loginReminder && (loginReminder.style.display = "block");
      }
      if (loggedSection) loggedSection.style.display = "block";
      if (user.role === "patient" && patientDetails) patientDetails.style.display = "block";
      if (user.role === "doctor" && doctorDetails) doctorDetails.style.display = "block";
      if (user.role === "admin" && adminDetails) adminDetails.style.display = "block";

      if (heroSection) heroSection.style.display = "none";

      if (user.role === "admin") {
        reservationContainer && (reservationContainer.style.display = "none");
        document.getElementById("adminDashboard").style.display = "block";
        loadDoctorsTable();
        loadPatientsTable();
      } else {
        document.getElementById("adminDashboard").style.display = "none";
      }
    })
    .catch(() => {
      removeToken();
      userInfoDiv && (userInfoDiv.style.display = "none");
      loginButton && (loginButton.style.display = "inline-block");
      signupButton && (signupButton.style.display = "inline-block");
      reservationContainer && (reservationContainer.style.display = "none");
      loginReminder && (loginReminder.style.display = "block");
      if (heroSection) heroSection.style.display = "block";
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

async function loadDoctorsTable() {
  try {
    const res = await fetch("/api/doctorz", {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    if (!res.ok) throw new Error("Error al obtener doctores");
    const doctors = await res.json();
    const tbody = document.querySelector("#doctorsTable tbody");
    tbody.innerHTML = "";
    doctors.forEach(doc => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${doc.name}</td>
        <td>${doc.email || ""}</td>
        <td>${doc.specialty || ""}</td>
        <td>${doc.phone || ""}</td>
        <td><button onclick="deleteDoctor(${doc.id})">Eliminar</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
  }
}

async function loadPatientsTable() {
  try {
    const res = await fetch("/api/patients", {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    if (!res.ok) throw new Error("Error al obtener pacientes");
    const patients = await res.json();
    const tbody = document.querySelector("#patientsTable tbody");
    tbody.innerHTML = "";
    patients.forEach(pat => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${pat.name}</td>
        <td>${pat.email || ""}</td>
        <td>${pat.phone || ""}</td>
        <td>${pat.birthdate || ""}</td>
        <td>${pat.gender || ""}</td>
        <td><button onclick="deletePatient(${pat.id})">Eliminar</button></td>
      `;

      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
  }
}

async function deleteDoctor(id) {
  if (!confirm("¿Seguro que quieres eliminar este doctor? Esta acción no se puede deshacer.")) return;

  try {
    const res = await fetch(`/api/doctors/${id}`, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + getToken() }
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || "Doctor eliminado.");
      loadDoctorsTable();
    } else {
      alert(data.error || "Error al eliminar doctor.");
    }
  } catch (err) {
    console.error(err);
    alert("Error del servidor al eliminar doctor.");
  }
}

async function deletePatient(id) {
  if (!confirm("¿Seguro que quieres eliminar este paciente? Esta acción no se puede deshacer.")) return;

  try {
    const res = await fetch(`/api/patients/${id}`, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + getToken() }
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || "Paciente eliminado.");
      loadPatientsTable();
    } else {
      alert(data.error || "Error al eliminar paciente.");
    }
  } catch (err) {
    console.error(err);
    alert("Error del servidor al eliminar paciente.");
  }
}

