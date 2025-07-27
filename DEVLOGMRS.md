# Fase 1 – Rediseño de base de datos (27 de julio del 2025)

## Tareas a realizar:
1. Crear tabla patients.

2. Crear tabla doctors.

3. Rediseñar tabla reservations para referenciar pacientes y doctores.

3. Añadir campo status en reservas.

4. Insertar datos de prueba (1 paciente, 1 doctor, 1 cita).

5. Actualizar db.js.

# Fase 2 – Registro y autenticación con roles (27 de julio del 2025)

## Tareas a realizar:

1. Crear ruta /signup para registro de usuarios con roles: admin, doctor, patient.

2. Validar datos obligatorios en el registro según el rol: Paciente: name, email, password, birthdate, gender. Médico: name, email, password, specialty. Admin: name, email, password.

3. Guardar usuario en tabla users.

4. Insertar datos extra en tabla patients o doctors según rol.

5. Implementar validación de duplicados por email.

6. Actualizar login para validar usuarios sin bcrypt (contraseña en texto plano).

7. Probar el flujo completo de registro y login.

