/**************************************
 * Elementos DOM
 **************************************/
// Botones y contenedores visibles en UI
const loginButton = document.querySelector('nav button[onclick="openLoginModal()"]');
const signupButton = document.getElementById("signupButton");
const userInfoDiv = document.getElementById("userInfo");
const reservationContainer = document.getElementById("reservationContainer");

/**************************************
 * Utilidades
 **************************************/
// Manejo del token JWT en localStorage
function getToken() {
    return localStorage.getItem("token");
}

function setToken(token) {
    localStorage.setItem("token", token);
}

function removeToken() {
    localStorage.removeItem("token");
}

/**************************************
 * Gestión de la Interfaz
 **************************************/
// Mostrar/Ocultar UI según estado y rol del usuario
function showUserInfo() {
    const token = getToken();
    const loggedSection = document.getElementById("howItWorksLogged");
    const patientDetails = document.getElementById("howItWorksPatient");
    const doctorDetails = document.getElementById("howItWorksDoctor");
    const adminDetails = document.getElementById("howItWorksAdmin");
    const heroSection = document.getElementById("heroSection");

    // Ocultar secciones específicas inicialmente
    if (loggedSection) loggedSection.style.display = "none";
    if (patientDetails) patientDetails.style.display = "none";
    if (doctorDetails) doctorDetails.style.display = "none";
    if (adminDetails) adminDetails.style.display = "none";

    if (!token) {
        // Usuario no autenticado
        userInfoDiv && (userInfoDiv.style.display = "none");
        loginButton && (loginButton.style.display = "inline-block");
        signupButton && (signupButton.style.display = "inline-block");
        reservationContainer && (reservationContainer.style.display = "none");
        if (heroSection) heroSection.style.display = "block";
        return;
    }

    // Con token, obtener datos del usuario
    fetch("/api/me", {
        headers: {
            "Authorization": "Bearer " + token
        },
    })
    .then((res) => {
        if (!res.ok) throw new Error("No autorizado");
        return res.json();
    })
    .then((user) => {
        // Mostrar saludo y esconder botones de login/signup
        if (userInfoDiv) {
            userInfoDiv.style.display = "flex";
            document.getElementById("userName").textContent = `Hola, ${user.name}`;
        }
        loginButton && (loginButton.style.display = "none");
        signupButton && (signupButton.style.display = "none");

        // Mostrar contenedor de reservaciones sólo para pacientes
        if (user.role === "patient") {
            reservationContainer && (reservationContainer.style.display = "block");
            loadDoctors();
        } else {
            reservationContainer && (reservationContainer.style.display = "none");
        }

        if (loggedSection) loggedSection.style.display = "block";

        // Mostrar detalles según rol
        if (user.role === "patient" && patientDetails) patientDetails.style.display = "block";
        if (user.role === "doctor" && doctorDetails) doctorDetails.style.display = "block";
        if (user.role === "admin" && adminDetails) adminDetails.style.display = "block";
        if (heroSection) heroSection.style.display = "none";

        // Dashboard admin
        if (user.role === "admin") {
            reservationContainer && (reservationContainer.style.display = "none");
            document.getElementById("adminDashboard").style.display = "block";
            loadAllUsersTable();
            loadDoctorsTable();
            loadPatientsTable();
            loadReservations();
            addClickEventsToAdminRows();
        } else {
            document.getElementById("adminDashboard").style.display = "none";
        }

        if (user.role === 'doctor') {
            document.getElementById('doctorAppointmentsSection').style.display = 'block';
            loadDoctorAppointments();
        } else {
            document.getElementById('doctorAppointmentsSection').style.display = 'none';
        }
    })
    .catch(() => {
        // Error: limpiar sesión y UI no autenticada
        //removeToken();
        userInfoDiv && (userInfoDiv.style.display = "none");
        loginButton && (loginButton.style.display = "inline-block");
        signupButton && (signupButton.style.display = "inline-block");
        reservationContainer && (reservationContainer.style.display = "none");
        if (heroSection) heroSection.style.display = "block";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    showUserInfo();
});

/**************************************
 * Autenticación
 **************************************/
// Cerrar sesión
function logout() {
    removeToken();
    
    // Ocultar UI sensible
    const sections = [
        "adminDashboard",
        "patientSection",
        "doctorAppointmentsSection",
        "howItWorksLogged",
        "howItWorksPatient",
        "howItWorksDoctor",
        "howItWorksAdmin"
    ];
    
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    if (userInfoDiv) userInfoDiv.style.display = "none";
    if (loginButton) loginButton.style.display = "inline-block";
    if (signupButton) signupButton.style.display = "inline-block";
    if (reservationContainer) reservationContainer.style.display = "none";
    
    const heroSection = document.getElementById("heroSection");
    if (heroSection) heroSection.style.display = "block";
}

// Abrir/Cerrar modales Login y Signup
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

// Login: enviar formulario
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
        alert('Error al iniciar sesión.');
    }
});

// Signup: enviar formulario
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

    // Armar payload según rol
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
            headers: {
                "Content-Type": "application/json"
            },
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
        alert("Error al registrar usuario.");
    }
});

// Mostrar campos personalizados en signup según rol
document.getElementById("signupRole").addEventListener("change", function () {
    const role = this.value;
    document.getElementById("patientFields").style.display = role === "patient" ? "block" : "none";
    document.getElementById("doctorFields").style.display = role === "doctor" ? "block" : "none";
});

/**************************************
 * Reservaciones
 **************************************/
// Enviar formulario de reserva (solo pacientes)
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
            showUserInfo(); // Actualizar UI
        } else {
            alert(data.error || "Error al crear la reserva.");
        }
    } catch (err) {
        console.error(err);
        alert("Error del servidor.");
    }
});

// Cargar lista de doctores para select en reserva
async function loadDoctors() {
    try {
        const res = await fetch("/api/doctors");
        const doctors = await res.json();
        const select = document.getElementById("doctorSelect");
        select.innerHTML = '<option value="" disabled selected>Selecciona un médico</option>';

        doctors.forEach((doc) => {
            const opt = document.createElement("option");
            opt.value = doc.id;
            opt.textContent = `${doc.name} (${doc.specialty})`;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error("Error al cargar médicos", err);
        alert("Error al cargar la lista de médicos.");
    }
}

/**************************************
 * Tablas Admin
 **************************************/
// Cargar y mostrar tabla de doctores
async function loadDoctorsTable() {
    try {
        const res = await fetch("/api/doctorz", {
            headers: {
                "Authorization": "Bearer " + getToken()
            }
        });
        if (!res.ok) throw new Error("Error al obtener doctores");
        const doctors = await res.json();
        const tbody = document.querySelector("#doctorsTable tbody");
        tbody.innerHTML = "";

        doctors.forEach(doc => {
            const tr = document.createElement("tr");
            tr.setAttribute("data-id", doc.id); // <-- agregado
            tr.innerHTML = `
                <td>${doc.name}</td>
                <td>${doc.email || ""}</td>
                <td>${doc.specialty || ""}</td>
                <td>${doc.phone || ""}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        alert("Error al cargar doctores.");
    }
}

// Cargar y mostrar tabla de pacientes
async function loadPatientsTable() {
    try {
        const res = await fetch("/api/patients", {
            headers: {
                "Authorization": "Bearer " + getToken()
            }
        });
        if (!res.ok) throw new Error("Error al obtener pacientes");
        const patients = await res.json();
        const tbody = document.querySelector("#patientsTable tbody");
        tbody.innerHTML = "";

        patients.forEach(pat => {
            const tr = document.createElement("tr");
            tr.setAttribute("data-id", pat.id); // <-- agregado
            tr.innerHTML = `
                <td>${pat.name}</td>
                <td>${pat.email || ""}</td>
                <td>${pat.phone || ""}</td>
                <td>${pat.birthdate || ""}</td>
                <td>${pat.gender || ""}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        alert("Error al cargar pacientes.");
    }
}

// Cargar y mostrar tabla de reservas
async function loadReservations() {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/reservations', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) return;
    
    const reservations = await response.json();
    const tbody = document.querySelector('#reservationsTable tbody');
    tbody.innerHTML = '';
    
    for (const r of reservations) {
        const tr = document.createElement('tr');
        tr.setAttribute("data-id", r.id); // <-- agregado
        tr.innerHTML = `
            <td>${r.patient_name || 'Paciente desconocido'}</td>
            <td>${r.doctor_name || 'Médico desconocido'}</td>
            <td>${new Date(r.date).toLocaleString()}</td>
            <td>${r.reason || ''}</td>
            <td>${r.status || 'Pendiente'}</td>
        `;
        tbody.appendChild(tr);
    }
}

// Cargar y mostrar tabla de usuarios (admin)
async function loadAllUsersTable() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const users = await response.json();
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.setAttribute("data-id", user.id); // <-- agregado si tienes id en usuarios
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
}

async function loadDoctorAppointments() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const res = await fetch('/api/doctor/reservations', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        console.log('Respuesta completa de la API:', data);
        
        if (!Array.isArray(data)) {
            throw new Error('La respuesta no es un arreglo. Es: ' + JSON.stringify(data));
        }
        
        const table = document.getElementById('doctorAppointmentsTableBody');
        table.innerHTML = '';
        
        if (data.length === 0) {
            table.innerHTML = '<tr><td colspan="5">No hay citas registradas.</td></tr>';
            return;
        }
        
        data.forEach(app => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${app.patient_name}</td>
                <td>${app.patient_email}</td>
                <td>${app.reason}</td>
                <td>${app.date}</td>
                <td>${app.status}</td>
            `;
            table.appendChild(row);
        });
    } catch (err) {
        console.error('Error al cargar citas del doctor:', err.message);
    }
}

/**************************************
 * Cambiar y eliminar datos
 **************************************/
// Eliminar reserva
async function deleteReservation(id) {
    if (!confirm("¿Seguro que quieres eliminar esta reserva? Esta acción no se puede deshacer.")) return;
    
    try {
        const res = await fetch(`/api/reservations/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + getToken()
            }
        });
        const data = await res.json();
        
        if (res.ok) {
            alert("Reserva eliminada.");
            loadAllUsersTable();
            loadDoctorsTable();
            loadPatientsTable();
            loadReservations();
        } else {
            alert(data.error || "Error al eliminar reserva.");
        }
    } catch (err) {
        console.error(err);
        alert("Error del servidor al eliminar reserva.");
    }
}

// Eliminar doctor
async function deleteDoctor(id) {
    if (!confirm("¿Seguro que quieres eliminar este doctor? Esta acción no se puede deshacer.")) return;
    
    try {
        const res = await fetch(`/api/doctors/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + getToken()
            }
        });
        const data = await res.json();
        
        if (res.ok) {
            alert(data.message || "Doctor eliminado.");
            loadAllUsersTable();
            loadDoctorsTable();
            loadPatientsTable();
            loadReservations();
        } else {
            alert(data.error || "Error al eliminar doctor.");
        }
    } catch (err) {
        console.error(err);
        alert("Error del servidor al eliminar doctor.");
    }
}

// Eliminar paciente
async function deletePatient(id) {
    if (!confirm("¿Seguro que quieres eliminar este paciente? Esta acción no se puede deshacer.")) return;
    
    try {
        const res = await fetch(`/api/patients/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + getToken()
            }
        });
        const data = await res.json();
        
        if (res.ok) {
            alert(data.message || "Paciente eliminado.");
            loadAllUsersTable();
            loadDoctorsTable();
            loadPatientsTable();
            loadReservations();
        } else {
            alert(data.error || "Error al eliminar paciente.");
        }
    } catch (err) {
        console.error(err);
        alert("Error del servidor al eliminar paciente.");
    }
}

//Eliminar usuario (admin)
function deleteUser(id) {
    if (!confirm("¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer.")) {
        return;
    }
    
    fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    })
    .then((res) => res.json())
    .then((data) => {
        alert(data.message || "Usuario eliminado.");
        // Recargar tabla de usuarios
        loadAllUsersTable();
        loadDoctorsTable();
        loadPatientsTable();
        loadReservations();
    })
    .catch((err) => {
        console.error("Error al eliminar usuario:", err);
        alert("Error al eliminar el usuario.");
    });
}

/**************************************
 * Filtrado de tablas
 **************************************/
// Filtrar filas en tablas admin según texto
function filterTablesByText(text) {
    text = text.toLowerCase();
    const tableIds = ["usersTable", "doctorsTable", "patientsTable", "reservationsTable"];
    
    tableIds.forEach((tableId) => {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const tbody = table.querySelector("tbody");
        if (!tbody) return;
        
        Array.from(tbody.rows).forEach((row) => {
            const rowText = row.textContent.toLowerCase();
            row.style.display = rowText.includes(text) ? "" : "none";
        });
    });
}

// Evento input para filtro
document.getElementById("searchInput").addEventListener("input", (e) => {
    filterTablesByText(e.target.value.trim());
});

function addClickEventsToAdminRows() {
    const tables = ['usersTable', 'doctorsTable', 'patientsTable', 'reservationsTable'];
    const contextMenu = document.getElementById('contextMenu');
    let currentRow = null;
    let currentTableId = null;

    tables.forEach(tableId => {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const tbody = table.querySelector("tbody");
        if (!tbody || tbody.dataset.listenerAdded === "true") return;

        // Detectar clic derecho (contextmenu)
        tbody.addEventListener("contextmenu", function (event) {
            event.preventDefault();
            const row = event.target.closest("tr");
            if (!row || !tbody.contains(row)) {
                contextMenu.style.display = "none";
                return;
            }
            
            currentRow = row;
            currentTableId = tableId;
            
            // Mostrar menú en la posición del clic
            contextMenu.style.top = event.pageY + "px";
            contextMenu.style.left = event.pageX + "px";
            contextMenu.style.display = "block";
        });
        
        tbody.dataset.listenerAdded = "true";
    });

    // Ocultar menú al hacer clic fuera
    document.addEventListener("click", () => {
        if (contextMenu.style.display === "block") {
            contextMenu.style.display = "none";
            currentRow = null;
            currentTableId = null;
        }
    });

    // Manejar clic en opciones del menú
    contextMenu.addEventListener("click", (e) => {
        if (!e.target.classList.contains("context-menu-item")) return;
        const action = e.target.dataset.action;
        
        if (!currentRow || !currentTableId) return;
        
        // Obtener ID de la fila seleccionada
        const id = currentRow.getAttribute("data-id");
        if (!id) {
            alert("No se pudo determinar el ID de la fila.");
            contextMenu.style.display = "none";
            currentRow = null;
            currentTableId = null;
            return;
        }
        
        switch(action) {
            case "edit":
                alert(`Editar fila en tabla ${currentTableId} con ID ${id}`);
                // Aquí llama a tu función para editar según tabla
                // Ejemplo: editDoctor(id), editPatient(id), editReservation(id)
                break;
            case "delete":
                // Solo llama la función de eliminar, que ya tiene confirm
                if (currentTableId === "doctorsTable") {
                    deleteDoctor(id);
                } else if (currentTableId === "patientsTable") {
                    deletePatient(id);
                } else if (currentTableId === "reservationsTable") {
                    deleteReservation(id);
                } else if (currentTableId === "usersTable") {
                    deleteUser(id);
                } else {
                    alert("Eliminar no implementado para esta tabla.");
                }
                break;
        }
        
        contextMenu.style.display = "none";
        currentRow = null;
        currentTableId = null;
    });
}