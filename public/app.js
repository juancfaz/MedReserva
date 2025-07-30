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
 * Funciones de Edición
 **************************************/

// Función principal para editar cualquier entidad
function editEntity(tableId, id) {
    switch(tableId) {
        case 'usersTable':
            editUser(id);
            break;
        case 'doctorsTable':
            editDoctor(id);
            break;
        case 'patientsTable':
            editPatient(id);
            break;
        case 'reservationsTable':
            editReservation(id);
            break;
        default:
            alert('Edición no implementada para esta tabla');
    }
}

async function editPatient(patientId) {
    try {
        // Obtener datos del paciente
        const res = await fetch(`/api/patients/${patientId}`, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        
        if (!res.ok) throw new Error('Error al obtener paciente');
        const patient = await res.json();
        
        // Crear modal de edición
        const modalContent = `
            <h2>Editar Paciente</h2>
            <form id="editPatientForm">
                <input type="hidden" name="id" value="${patientId}">
                
                <label for="editPatientName">Nombre:</label>
                <input type="text" id="editPatientName" name="name" value="${patient.name || ''}" required>
                
                <label for="editPatientEmail">Email:</label>
                <input type="email" id="editPatientEmail" name="email" value="${patient.email || ''}" required>
                
                <label for="editPatientPhone">Teléfono:</label>
                <input type="text" id="editPatientPhone" name="phone" value="${patient.phone || ''}">
                
                <label for="editPatientBirthdate">Fecha de Nacimiento:</label>
                <input type="date" id="editPatientBirthdate" name="birthdate" value="${patient.birthdate || ''}" required>
                
                <label for="editPatientGender">Género:</label>
                <select id="editPatientGender" name="gender" required>
                    <option value="male" ${patient.gender === 'male' ? 'selected' : ''}>Masculino</option>
                    <option value="female" ${patient.gender === 'female' ? 'selected' : ''}>Femenino</option>
                    <option value="other" ${patient.gender === 'other' ? 'selected' : ''}>Otro</option>
                </select>
                
                <button type="submit">Guardar Cambios</button>
            </form>
        `;
        
        showEditModal(modalContent);
        
        // Manejar envío del formulario
        document.getElementById('editPatientForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('editPatientName').value,
                email: document.getElementById('editPatientEmail').value,
                phone: document.getElementById('editPatientPhone').value,
                birthdate: document.getElementById('editPatientBirthdate').value,
                gender: document.getElementById('editPatientGender').value
            };
            
            try {
                const updateRes = await fetch(`/api/patients/${patientId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + getToken()
                    },
                    body: JSON.stringify(formData)
                });
                
                if (updateRes.ok) {
                    alert('Paciente actualizado correctamente');
                    closeEditModal();
                    // Recargar datos
                    loadPatientsTable();
                    loadAllUsersTable();
                    loadReservations();
                } else {
                    const error = await updateRes.json();
                    throw new Error(error.error || 'Error al actualizar');
                }
            } catch (err) {
                console.error(err);
                alert('Error al actualizar paciente: ' + err.message);
            }
        });
        
    } catch (err) {
        console.error(err);
        alert('Error: ' + err.message);
    }
}

async function editReservation(reservationId) {
    try {
        // Obtener datos de la reservación
        const res = await fetch(`/api/reservations/${reservationId}`, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        
        if (!res.ok) throw new Error('Error al obtener reservación');
        const reservation = await res.json();
        
        // Formatear fecha para el input datetime-local
        const date = new Date(reservation.date);
        const formattedDate = date.toISOString().slice(0, 16);
        
        // Crear modal de edición
        const modalContent = `
            <h2>Editar Reservación</h2>
            <form id="editReservationForm">
                <input type="hidden" name="id" value="${reservationId}">
                
                <label for="editReservationDate">Fecha y Hora:</label>
                <input type="datetime-local" id="editReservationDate" name="date" value="${formattedDate}" required>
                
                <label for="editReservationReason">Motivo:</label>
                <textarea id="editReservationReason" name="reason" rows="3">${reservation.reason || ''}</textarea>
                
                <label for="editReservationStatus">Estado:</label>
                <select id="editReservationStatus" name="status" required>
                    <option value="pending" ${reservation.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                    <option value="confirmed" ${reservation.status === 'confirmed' ? 'selected' : ''}>Confirmada</option>
                    <option value="cancelled" ${reservation.status === 'cancelled' ? 'selected' : ''}>Cancelada</option>
                    <option value="attended" ${reservation.status === 'attended' ? 'selected' : ''}>Atendida</option>
                </select>
                
                <button type="submit">Guardar Cambios</button>
            </form>
        `;
        
        showEditModal(modalContent);
        
        // Manejar envío del formulario
        document.getElementById('editReservationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                date: document.getElementById('editReservationDate').value,
                reason: document.getElementById('editReservationReason').value,
                status: document.getElementById('editReservationStatus').value
            };
            
            try {
                const updateRes = await fetch(`/api/reservations/${reservationId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + getToken()
                    },
                    body: JSON.stringify(formData)
                });
                
                if (updateRes.ok) {
                    alert('Reservación actualizada correctamente');
                    closeEditModal();
                    // Recargar datos
                    loadReservations();
                    if (document.getElementById('doctorAppointmentsSection').style.display !== 'none') {
                        loadDoctorAppointments();
                    }
                } else {
                    const error = await updateRes.json();
                    throw new Error(error.error || 'Error al actualizar');
                }
            } catch (err) {
                console.error(err);
                alert('Error al actualizar reservación: ' + err.message);
            }
        });
        
    } catch (err) {
        console.error(err);
        alert('Error: ' + err.message);
    }
}

// Editar usuario (y su relación con doctor/patient si existe)
async function editUser(userId) {
    try {
        // Obtener datos del usuario y sus perfiles específicos
        const [userRes, patientRes, doctorRes] = await Promise.all([
            fetch(`/api/users/${userId}`, {
                headers: {
                    'Authorization': 'Bearer ' + getToken()
                }
            }),
            fetch(`/api/user-patient-info/${userId}`, {
                headers: {
                    'Authorization': 'Bearer ' + getToken()
                }
            }),
            fetch(`/api/user-doctor-info/${userId}`, {
                headers: {
                    'Authorization': 'Bearer ' + getToken()
                }
            })
        ]);
        
        if (!userRes.ok) throw new Error('Error al obtener usuario');
        const user = await userRes.json();
        
        let patientInfo = null;
        if (patientRes.ok) patientInfo = await patientRes.json();
        
        let doctorInfo = null;
        if (doctorRes.ok) doctorInfo = await doctorRes.json();

        // Crear modal de edición con campos dinámicos
        const modalContent = `
            <h2>Editar Usuario</h2>
            <form id="editUserForm">
                <input type="hidden" name="id" value="${userId}">
                
                <label for="editUserName">Nombre:</label>
                <input type="text" id="editUserName" name="name" value="${user.name || ''}" required>
                
                <label for="editUserEmail">Email:</label>
                <input type="email" id="editUserEmail" name="email" value="${user.email || ''}" required>
                
                <label for="editUserRole">Rol:</label>
                <select id="editUserRole" name="role" required disabled>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    <option value="doctor" ${user.role === 'doctor' ? 'selected' : ''}>Doctor</option>
                    <option value="patient" ${user.role === 'patient' ? 'selected' : ''}>Paciente</option>
                </select>
                
                <!-- Campos para pacientes -->
                <div id="patientFieldsContainer" style="${user.role === 'patient' ? '' : 'display: none;'}">
                    <label for="editPatientPhone">Teléfono:</label>
                    <input type="text" id="editPatientPhone" name="phone" 
                           value="${patientInfo?.phone || ''}">
                    
                    <label for="editPatientBirthdate">Fecha de Nacimiento:</label>
                    <input type="date" id="editPatientBirthdate" name="birthdate" 
                           value="${patientInfo?.birthdate || ''}" ${user.role === 'patient' ? 'required' : ''}>
                    
                    <label for="editPatientGender">Género:</label>
                    <select id="editPatientGender" name="gender" ${user.role === 'patient' ? 'required' : ''}>
                        <option value="">Seleccione</option>
                        <option value="male" ${patientInfo?.gender === 'male' ? 'selected' : ''}>Masculino</option>
                        <option value="female" ${patientInfo?.gender === 'female' ? 'selected' : ''}>Femenino</option>
                        <option value="other" ${patientInfo?.gender === 'other' ? 'selected' : ''}>Otro</option>
                    </select>
                </div>
                
                <!-- Campos para doctores -->
                <div id="doctorFieldsContainer" style="${user.role === 'doctor' ? '' : 'display: none;'}">
                    <label for="editDoctorSpecialty">Especialidad:</label>
                    <input type="text" id="editDoctorSpecialty" name="specialty" 
                           value="${doctorInfo?.specialty || ''}" ${user.role === 'doctor' ? 'required' : ''}>
                    
                    <label for="editDoctorPhone">Teléfono:</label>
                    <input type="text" id="editDoctorPhone" name="doctorPhone" 
                           value="${doctorInfo?.phone || ''}">
                </div>
                
                <button type="submit">Guardar Cambios</button>
            </form>
        `;
        
        showEditModal(modalContent);
        
        // Mostrar/ocultar campos según rol
        document.getElementById('editUserRole').addEventListener('change', function() {
            const role = this.value;
            document.getElementById('patientFieldsContainer').style.display = role === 'patient' ? 'block' : 'none';
            document.getElementById('doctorFieldsContainer').style.display = role === 'doctor' ? 'block' : 'none';
            
            // Actualizar requeridos
            document.getElementById('editPatientBirthdate').required = role === 'patient';
            document.getElementById('editPatientGender').required = role === 'patient';
            document.getElementById('editDoctorSpecialty').required = role === 'doctor';
        });

        // Manejar envío del formulario
        document.getElementById('editUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('editUserName').value,
                email: document.getElementById('editUserEmail').value,
                role: document.getElementById('editUserRole').value
            };
            
            // Agregar campos específicos según rol
            if (formData.role === 'patient') {
                formData.phone = document.getElementById('editPatientPhone').value;
                formData.birthdate = document.getElementById('editPatientBirthdate').value;
                formData.gender = document.getElementById('editPatientGender').value;
                
                if (!formData.birthdate || !formData.gender) {
                    alert('Fecha de nacimiento y género son requeridos para pacientes');
                    return;
                }
            } else if (formData.role === 'doctor') {
                formData.specialty = document.getElementById('editDoctorSpecialty').value;
                formData.phone = document.getElementById('editDoctorPhone').value;
                
                if (!formData.specialty) {
                    alert('Especialidad es requerida para doctores');
                    return;
                }
            }
            
            try {
                const updateRes = await fetch(`/api/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + getToken()
                    },
                    body: JSON.stringify(formData)
                });
                
                if (updateRes.ok) {
                    alert('Usuario actualizado correctamente');
                    closeEditModal();
                    // Recargar todas las tablas afectadas
                    loadAllUsersTable();
                    loadDoctorsTable();
                    loadPatientsTable();
                    loadReservations();
                } else {
                    const error = await updateRes.json();
                    throw new Error(error.error || 'Error al actualizar');
                }
            } catch (err) {
                console.error(err);
                alert('Error al actualizar usuario: ' + err.message);
            }
        });
        
    } catch (err) {
        console.error(err);
        alert('Error: ' + err.message);
    }
}

// Editar doctor (y su usuario asociado)
async function editDoctor(doctorId) {
    try {
        // Obtener datos del doctor
        const res = await fetch(`/api/doctors/${doctorId}`, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        
        if (!res.ok) throw new Error('Error al obtener doctor');
        const doctor = await res.json();
        
        // Crear modal de edición
        const modalContent = `
            <h2>Editar Doctor</h2>
            <form id="editDoctorForm">
                <input type="hidden" name="id" value="${doctorId}">
                
                <label for="editDoctorName">Nombre:</label>
                <input type="text" id="editDoctorName" name="name" value="${doctor.name || ''}" required>
                
                <label for="editDoctorEmail">Email:</label>
                <input type="email" id="editDoctorEmail" name="email" value="${doctor.email || ''}" required>
                
                <label for="editDoctorSpecialty">Especialidad:</label>
                <input type="text" id="editDoctorSpecialty" name="specialty" value="${doctor.specialty || ''}" required>
                
                <label for="editDoctorPhone">Teléfono:</label>
                <input type="text" id="editDoctorPhone" name="phone" value="${doctor.phone || ''}">
                
                <button type="submit">Guardar Cambios</button>
            </form>
        `;
        
        showEditModal(modalContent);
        
        // Manejar envío del formulario
        document.getElementById('editDoctorForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('editDoctorName').value,
                email: document.getElementById('editDoctorEmail').value,
                specialty: document.getElementById('editDoctorSpecialty').value,
                phone: document.getElementById('editDoctorPhone').value
            };
            
            try {
                const updateRes = await fetch(`/api/doctors/${doctorId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + getToken()
                    },
                    body: JSON.stringify(formData)
                });
                
                if (updateRes.ok) {
                    alert('Doctor actualizado correctamente');
                    closeEditModal();
                    // Recargar datos
                    loadDoctorsTable();
                    loadAllUsersTable();
                } else {
                    const error = await updateRes.json();
                    throw new Error(error.error || 'Error al actualizar');
                }
            } catch (err) {
                console.error(err);
                alert('Error al actualizar doctor: ' + err.message);
            }
        });
        
    } catch (err) {
        console.error(err);
        alert('Error: ' + err.message);
    }
}

// Funciones similares para editPatient y editReservation...
// (Implementación similar a editDoctor pero para pacientes y reservaciones)

/**************************************
 * Modal de Edición Genérico
 **************************************/
function showEditModal(content) {
    const modal = document.createElement('div');
    modal.id = 'editModal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = content;
    
    const closeSpan = document.createElement('span');
    closeSpan.className = 'close';
    closeSpan.innerHTML = '&times;';
    closeSpan.onclick = closeEditModal;
    
    modalContent.prepend(closeSpan);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.remove();
    }
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

        tbody.addEventListener("contextmenu", function (event) {
            event.preventDefault();
            const row = event.target.closest("tr");
            if (!row || !tbody.contains(row)) {
                contextMenu.style.display = "none";
                return;
            }
            
            currentRow = row;
            currentTableId = tableId;
            
            contextMenu.style.top = event.pageY + "px";
            contextMenu.style.left = event.pageX + "px";
            contextMenu.style.display = "block";
        });
        
        tbody.dataset.listenerAdded = "true";
    });

    document.addEventListener("click", () => {
        if (contextMenu.style.display === "block") {
            contextMenu.style.display = "none";
            currentRow = null;
            currentTableId = null;
        }
    });

    contextMenu.addEventListener("click", (e) => {
        if (!e.target.classList.contains("context-menu-item")) return;
        const action = e.target.dataset.action;
        
        if (!currentRow || !currentTableId) return;
        
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
                editEntity(currentTableId, id);  // Cambiamos esta línea
                break;
            case "delete":
                // Mantenemos la lógica existente de eliminación
                if (currentTableId === "doctorsTable") {
                    deleteDoctor(id);
                } else if (currentTableId === "patientsTable") {
                    deletePatient(id);
                } else if (currentTableId === "reservationsTable") {
                    deleteReservation(id);
                } else if (currentTableId === "usersTable") {
                    deleteUser(id);
                }
                break;
        }
        
        contextMenu.style.display = "none";
        currentRow = null;
        currentTableId = null;
    });
}