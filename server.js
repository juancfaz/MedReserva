const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.use(express.static("public"));
app.use(express.json());

const JWT_SECRET = "tu_clave_secreta_super_segura";

// Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token });
    });
});

// Registro / Signup
app.post("/signup", (req, res) => {
    const { name, email, password, role, phone, birthdate, gender, specialty } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "Missing required fields (name, email, password, role)" });
    }

    if (!["admin", "doctor", "patient"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }

    // ✅ Validación anticipada de fecha de nacimiento
    if (role === "patient") {
        if (!birthdate || !gender) {
            return res.status(400).json({ error: "Missing patient fields: birthdate, gender" });
        }

        const birthdates = new Date(birthdate);
        const today = new Date();

        // Quitar horas, minutos y segundos de ambas fechas
        birthdates.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (birthdates.getFullYear() <= 1900 || birthdates >= today) {
            return res.status(400).json({ error: "La fecha debe ser entre 1900 y hoy" });
        }
    }

    // Validar campos de doctor si aplica
    if (role === "doctor" && !specialty) {
        return res.status(400).json({ error: "Missing doctor field: specialty" });
    }

    // 🔒 Verificar que email no esté en uso
    db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (row) return res.status(409).json({ error: "Email already registered" });

        // ✅ Solo ahora se inserta el usuario
        db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, password, role], function (err) {
            if (err) return res.status(500).json({ error: "Error creating user" });

            const userId = this.lastID;

            // Insertar datos adicionales según el rol
            if (role === "patient") {
                db.run("INSERT INTO patients (user_id, name, email, phone, birthdate, gender) VALUES (?, ?, ?, ?, ?, ?)",
                    [userId, name, email, phone || null, birthdate, gender], (err) => {
                        if (err) return res.status(500).json({ error: "Error creating patient record" });
                        return res.json({ message: "Patient registered successfully" });
                    });

            } else if (role === "doctor") {
                db.run("INSERT INTO doctors (user_id, name, email, specialty, phone) VALUES (?, ?, ?, ?, ?)",
                    [userId, name, email, specialty, phone || null], (err) => {
                        if (err) return res.status(500).json({ error: "Error creating doctor record" });
                        return res.json({ message: "Doctor registered successfully" });
                    });

            } else {
                return res.json({ message: "Admin registered successfully" });
            }
        });
    });
});

// Middleware para autenticar token
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized, token missing" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
}

// Obtener datos del usuario autenticado
app.get("/api/me", authenticateToken, (req, res) => {
    res.json(req.user);
});

// 🔄 Obtener todas las reservas (con JOIN)
app.get("/api/reservations", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const sql = `
        SELECT r.id, p.name AS patient_name, p.email AS patient_email,
               d.name AS doctor_name, d.specialty,
               r.date, r.reason, r.status
        FROM reservations r
        JOIN patients p ON r.patient_id = p.id
        JOIN doctors d ON r.doctor_id = d.id
        ORDER BY r.date ASC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Error fetching reservations" });
        res.json(rows);
    });
});

// 🆕 Crear nueva reserva
app.post("/reserve", authenticateToken, (req, res) => {
    if (req.user.role !== "patient") {
        return res.status(403).json({ error: "Solo los pacientes pueden hacer reservas" });
    }

    const { doctorId, date, reason } = req.body;
    const patientEmail = req.user.email;

    if (!doctorId || !date) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59,);

    if (selectedDate <= today) {
        return res.status(400).json({ error: "La fecha debe ser a partir de mañana" });
    }

    db.get("SELECT id FROM patients WHERE email = ?", [patientEmail], (err, patient) => {
        if (err || !patient) {
            return res.status(404).json({ error: "Paciente no encontrado" });
        }

        const stmt = db.prepare(`
            INSERT INTO reservations (patient_id, doctor_id, date, reason, status)
            VALUES (?, ?, ?, ?, 'pending')
        `);

        stmt.run(patient.id, doctorId, date, reason || "", function (err) {
            if (err) return res.status(500).json({ error: "Error al guardar la reserva" });
            res.json({ message: "Reserva exitosa", id: this.lastID });
        });
    });
});

app.get("/api/patients", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }

  db.all("SELECT id, name, email, phone, birthdate, gender FROM patients", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener pacientes" });
    res.json(rows);
  });
});

app.get('/api/doctor/reservations', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get('SELECT id FROM doctors WHERE user_id = ?', [userId], (err, doctor) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al buscar doctor' });
    }
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor no encontrado' });
    }

    const doctorId = doctor.id;

    db.all(`
      SELECT r.id, r.date, r.reason, r.status,
             p.name AS patient_name,
             p.phone AS patient_phone,
             u.email AS patient_email
      FROM reservations r
      JOIN patients p ON r.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE r.doctor_id = ?
      ORDER BY r.date DESC
    `, [doctorId], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al obtener reservas' });
      }
      // Enviar arreglo (puede estar vacío)
      return res.json(rows);
    });
  });
});

// Obtener un usuario específico
app.get('/api/users/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    });
});

// Obtener un doctor específico
app.get('/api/doctors/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    db.get(`
        SELECT d.*, u.role 
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        WHERE d.id = ?
    `, [req.params.id], (err, doctor) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
        res.json(doctor);
    });
});

// Actualizar un usuario
app.put('/api/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    const { name, email, role, phone, birthdate, gender, specialty } = req.body;
    
    if (!name || !email || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Verificar que el email no esté en uso por otro usuario
        const emailCheck = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ? AND id != ?', 
                  [email, req.params.id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (emailCheck) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        // Obtener el usuario actual para ver si cambia el rol
        const currentUser = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Iniciar transacción
        await new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION', (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        // 1. Actualizar usuario principal
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
                [name, email, role, req.params.id],
                function(err) {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        // 2. Manejar pacientes
        if (currentUser.role === 'patient' || role === 'patient') {
            if (currentUser.role === role) {
                // Mismo rol (patient), actualizar datos
                await new Promise((resolve, reject) => {
                    db.run(
                        'UPDATE patients SET name = ?, email = ?, phone = ?, birthdate = ?, gender = ? WHERE user_id = ?',
                        [name, email, phone || null, birthdate, gender, req.params.id],
                        function(err) {
                            if (err) reject(err);
                            resolve();
                        }
                    );
                });
            } else if (currentUser.role === 'patient' && role !== 'patient') {
                // Cambió de patient a otro rol, eliminar de patients
                await new Promise((resolve, reject) => {
                    db.run(
                        'DELETE FROM patients WHERE user_id = ?',
                        [req.params.id],
                        function(err) {
                            if (err) reject(err);
                            resolve();
                        }
                    );
                });
            } else if (role === 'patient') {
                // Cambió a patient, insertar en patients
                if (!birthdate || !gender) {
                    throw new Error('Missing patient fields: birthdate and gender are required');
                }
                
                await new Promise((resolve, reject) => {
                    db.run(
                        'INSERT INTO patients (user_id, name, email, phone, birthdate, gender) VALUES (?, ?, ?, ?, ?, ?)',
                        [req.params.id, name, email, phone || null, birthdate, gender],
                        function(err) {
                            if (err) reject(err);
                            resolve();
                        }
                    );
                });
            }
        }

        // 3. Manejar doctores (mantenemos la lógica anterior)
        if (currentUser.role === 'doctor' || role === 'doctor') {
            if (currentUser.role === role) {
                // Mismo rol (doctor), solo actualizar datos
                await new Promise((resolve, reject) => {
                    db.run(
                        'UPDATE doctors SET name = ?, email = ? WHERE user_id = ?',
                        [name, email, req.params.id],
                        function(err) {
                            if (err) reject(err);
                            resolve();
                        }
                    );
                });
            } else if (currentUser.role === 'doctor' && role !== 'doctor') {
                // Cambió de doctor a otro rol, eliminar de doctors
                await new Promise((resolve, reject) => {
                    db.run(
                        'DELETE FROM doctors WHERE user_id = ?',
                        [req.params.id],
                        function(err) {
                            if (err) reject(err);
                            resolve();
                        }
                    );
                });
            } else if (role === 'doctor') {
                // Cambió a doctor, insertar en doctors
                await new Promise((resolve, reject) => {
                    db.run(
                        'INSERT INTO doctors (user_id, name, email, specialty, phone) VALUES (?, ?, ?, ?, ?)',
                        [req.params.id, name, email, 'General', null], // Especialidad por defecto
                        function(err) {
                            if (err) reject(err);
                            resolve();
                        }
                    );
                });
            }
        }

        // Confirmar transacción
        await new Promise((resolve, reject) => {
            db.run('COMMIT', (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        res.json({ message: 'User updated successfully' });
    } catch (err) {
        // Revertir transacción
        await new Promise((resolve) => {
            db.run('ROLLBACK', () => resolve());
        });
        
        console.error('Error updating user:', err);
        res.status(500).json({ error: err.message || 'Error updating user' });
    }
});

// Actualizar un doctor
app.put('/api/doctors/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    const { name, email, specialty, phone } = req.body;
    
    if (!name || !email || !specialty) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Iniciar transacción
        await new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION', (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        // 1. Obtener el user_id del doctor
        const doctor = await new Promise((resolve, reject) => {
            db.get('SELECT user_id FROM doctors WHERE id = ?', [req.params.id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // 2. Actualizar info del doctor
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE doctors SET name = ?, email = ?, specialty = ?, phone = ? WHERE id = ?',
                [name, email, specialty, phone || null, req.params.id],
                function(err) {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        // 3. Actualizar el usuario asociado
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET name = ?, email = ?, role = "doctor" WHERE id = ?',
                [name, email, doctor.user_id],
                function(err) {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        // Confirmar transacción
        await new Promise((resolve, reject) => {
            db.run('COMMIT', (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        res.json({ message: 'Doctor updated successfully' });
    } catch (err) {
        // Revertir transacción en caso de error
        await new Promise((resolve) => {
            db.run('ROLLBACK', () => resolve());
        });
        
        console.error('Error updating doctor:', err);
        res.status(500).json({ error: 'Error updating doctor' });
    }
});

// Obtener información de doctor por user_id
app.get('/api/user-doctor-info/:userId', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    db.get(
        'SELECT specialty, phone FROM doctors WHERE user_id = ?',
        [req.params.userId],
        (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(row || {});
        }
    );
});

// Obtener información de paciente por user_id
app.get('/api/user-patient-info/:userId', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    db.get(
        'SELECT phone, birthdate, gender FROM patients WHERE user_id = ?',
        [req.params.userId],
        (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(row || {});
        }
    );
});

// Obtener un paciente específico
app.get('/api/patients/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    db.get(`
        SELECT p.*, u.role 
        FROM patients p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    `, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(404).json({ error: 'Patient not found' });
        res.json(row);
    });
});

// Actualizar un paciente
app.put('/api/patients/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    const { name, email, phone, birthdate, gender } = req.body;
    
    if (!name || !email || !birthdate || !gender) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Iniciar transacción
        await new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION', (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        // 1. Obtener el user_id del paciente
        const patient = await new Promise((resolve, reject) => {
            db.get('SELECT user_id FROM patients WHERE id = ?', [req.params.id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // 2. Actualizar info del paciente
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE patients SET name = ?, email = ?, phone = ?, birthdate = ?, gender = ? WHERE id = ?',
                [name, email, phone || null, birthdate, gender, req.params.id],
                function(err) {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        // 3. Actualizar el usuario asociado
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET name = ?, email = ?, role = "patient" WHERE id = ?',
                [name, email, patient.user_id],
                function(err) {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        // Confirmar transacción
        await new Promise((resolve, reject) => {
            db.run('COMMIT', (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        res.json({ message: 'Patient updated successfully' });
    } catch (err) {
        // Revertir transacción en caso de error
        await new Promise((resolve) => {
            db.run('ROLLBACK', () => resolve());
        });
        
        console.error('Error updating patient:', err);
        res.status(500).json({ error: 'Error updating patient' });
    }
});

// Obtener una reservación específica
app.get('/api/reservations/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    db.get(`
        SELECT r.id, r.date, r.reason, r.status,
               p.name AS patient_name,
               d.name AS doctor_name
        FROM reservations r
        LEFT JOIN patients p ON r.patient_id = p.id
        LEFT JOIN doctors d ON r.doctor_id = d.id
        WHERE r.id = ?
    `, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(404).json({ error: 'Reservation not found' });
        res.json(row);
    });
});

// Actualizar una reservación
app.put('/api/reservations/:id', authenticateToken, (req, res) => {

    if (req.user.role === 'admin') {
        const { date, reason, status } = req.body;
    
        if (!date || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!['pending', 'confirmed', 'cancelled', 'attended'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        db.run(
            'UPDATE reservations SET date = ?, reason = ?, status = ? WHERE id = ?',
            [date, reason || null, status, req.params.id],
            function(err) {
                if (err) {
                    console.error('Error updating reservation:', err);
                    return res.status(500).json({ error: 'Error updating reservation' });
                }
                res.json({ message: 'Reservation updated successfully' });
            }
        );
    } else if (req.user.role === 'doctor') {
        const doctorUserId = req.user.id;

        // Obtener ID interno del doctor
        db.get('SELECT id FROM doctors WHERE user_id = ?', [doctorUserId], (err, doctor) => {
            if (err || !doctor) {
                return res.status(500).json({ error: 'Doctor no encontrado' });
            }

            const doctorId = doctor.id;

            // Verificar si la reservación pertenece a ese doctor
            db.get('SELECT * FROM reservations WHERE id = ? AND doctor_id = ?', [req.params.id, doctorId], (err, resv) => {
                if (err || !resv) {
                    return res.status(403).json({ error: 'No tienes permiso para modificar esta reserva' });
                }

                const { status } = req.body;
                if (!['pending', 'confirmed', 'cancelled', 'attended'].includes(status)) {
                    return res.status(400).json({ error: 'Estado inválido' });
                }

                db.run(
                    'UPDATE reservations SET status = ? WHERE id = ?',
                    [status, req.params.id],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: 'Error actualizando estado' });
                        }
                        res.json({ message: 'Estado actualizado correctamente' });
                    }
                );
            });
        });
    } else {
        return res.status(403).json({ error: 'Solo doctores o administradores pueden actualizar reservas' });
    }
});

// Agregar endpoints similares para pacientes y reservaciones...

app.get("/api/doctors", (req, res) => {
    db.all("SELECT id, name, specialty FROM doctors", [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Error al obtener médicos" });
        res.json(rows);
    });
});

app.get("/api/doctorz", authenticateToken, (req, res) => {
  db.all("SELECT id, name, email, specialty, phone FROM doctors", [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Error al obtener médicos" });
        res.json(rows);
    });
});

// Eliminar doctor + usuario asociado
app.delete("/api/doctors/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }

  const doctorId = req.params.id;

  // Primero obtener el user_id del doctor
  db.get("SELECT user_id FROM doctors WHERE id = ?", [doctorId], (err, row) => {
    if (err) return res.status(500).json({ error: "Error en la base de datos" });
    if (!row) return res.status(404).json({ error: "Doctor no encontrado" });

    const userId = row.user_id;

    // Eliminar doctor
    db.run("DELETE FROM doctors WHERE id = ?", [doctorId], function (err) {
      if (err) return res.status(500).json({ error: "Error al eliminar doctor" });

      // Eliminar usuario
      db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
        if (err) return res.status(500).json({ error: "Error al eliminar usuario" });

        res.json({ message: "Doctor y usuario eliminados correctamente" });
      });
    });
  });
});

// Eliminar paciente + usuario asociado
app.delete("/api/patients/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }

  const patientId = req.params.id;

  // Primero obtener el user_id del paciente
  db.get("SELECT user_id FROM patients WHERE id = ?", [patientId], (err, row) => {
    if (err) return res.status(500).json({ error: "Error en la base de datos" });
    if (!row) return res.status(404).json({ error: "Paciente no encontrado" });

    const userId = row.user_id;

    // Eliminar paciente
    db.run("DELETE FROM patients WHERE id = ?", [patientId], function (err) {
      if (err) return res.status(500).json({ error: "Error al eliminar paciente" });

      // Eliminar usuario
      db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
        if (err) return res.status(500).json({ error: "Error al eliminar usuario" });

        res.json({ message: "Paciente y usuario eliminados correctamente" });
      });
    });
  });
});

// Eliminar usuario (por ID)
app.delete('/api/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }

  const userId = req.params.id;

  // Obtener el usuario para saber rol
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Función para eliminar de users
    const eliminarUsuario = () => {
      db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
        if (err) return res.status(500).json({ error: 'Error al eliminar usuario' });
        res.json({ message: 'Usuario eliminado correctamente.' });
      });
    };

    // Si es doctor, eliminar de doctors primero
    if (user.role === 'doctor') {
      db.run('DELETE FROM doctors WHERE user_id = ?', [userId], function (err) {
        if (err) return res.status(500).json({ error: 'Error al eliminar doctor' });
        eliminarUsuario();
      });
    } 
    // Si es paciente, eliminar de patients primero
    else if (user.role === 'patient') {
      db.run('DELETE FROM patients WHERE user_id = ?', [userId], function (err) {
        if (err) return res.status(500).json({ error: 'Error al eliminar paciente' });
        eliminarUsuario();
      });
    } 
    // Si es admin u otro rol, solo eliminar usuario
    else {
      eliminarUsuario();
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// ✅ Eliminar reserva (por ID)
app.delete('/api/reservations/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM reservations WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this); // `this.changes`
      });
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get("/api/users", (req, res) => {
    db.all("SELECT id, name, email, role FROM users", [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Error al obtener usuarios" });
        res.json(rows);
    });
});