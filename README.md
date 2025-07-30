# MedReserva - Sistema de Gestión de Citas Médicas

## Visión General
MedReserva es una aplicación web full-stack para la gestión de citas médicas, diseñada como proyecto profesional. Permite a los usuarios registrarse como pacientes o doctores, autenticarse mediante JWT, gestionar citas médicas y ofrece dashboards personalizados según el rol del usuario.

## Características Principales

### Funcionalidades Clave
- **Sistema de autenticación seguro** con JWT y manejo de sesiones
- **Tres roles de usuarios**:
  - **Pacientes**: Pueden agendar, ver y cancelar citas
  - **Doctores**: Pueden gestionar sus citas (confirmar, cancelar, marcar como atendidas)
  - **Administradores**: Acceso completo al sistema

- **Dashboards inteligentes**:
  - **Panel de administración** con gestión completa de usuarios, doctores, pacientes y citas
  - **Vista para doctores** con filtros avanzados y acciones rápidas
  - **Panel para pacientes** con historial de citas y opción de cancelación

- **Sistema de reservas completo**:
  - Selección de doctores por especialidad
  - Validación de fechas y horarios
  - Estados de citas (pendiente, confirmada, cancelada, atendida)

- **Interfaz moderna y responsiva**:
  - Diseño limpio y accesible
  - Modales para formularios
  - Feedback visual claro

## Tecnologías Utilizadas

### Frontend
- HTML5 semántico
- CSS3 (Flexbox, Grid, Animaciones)
- JavaScript moderno (ES6+)
- Fetch API para comunicación con el backend

### Backend
- Node.js con Express
- SQLite3 como base de datos
- JWT para autenticación
- Sistema de rutas protegidas por roles

### Herramientas
- npm para gestión de paquetes
- SQLite CLI para administración de base de datos
- Git para control de versiones

## Instalación y Configuración

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/MedReserva.git
    cd MedReserva
    ```
2. Instalar dependencias:
    ```bash
    npm install
    ```
3. Iniciar el servidor:
    ```bash
    node server.js
    ```
4. Abre tu navegador en:
   ```bash
    http://localhost:3000/  
    ```
   
## Estructura del Proyecto

    /MedReserva
    │
    ├── /public
    │   ├── index.html          # Página principal
    │   ├── style.css           # Estilos principales
    │   └── app.js              # Lógica del frontend
    │
    ├── server.js               # Servidor principal y API
    ├── db.js                   # Configuración de la base de datos
    ├── package.json            # Configuración del proyecto
    └── README.md               # Documentación

## Guía de Uso

- **Para Pacientes**
1. Registro: Completa el formulario con tus datos personales.
2. Agendar cita: Selecciona un doctor y especialidad. Elige fecha y hora disponible. Describe el motivo de la consulta.
3. Gestionar citas: Visualiza tu historial de citas. Cancela citas futuras cuando sea necesario

- **Para Doctores**
1. Registro: Completa tu perfil profesional.
2. Panel de control: Visualiza todas tus citas agendadas. Filtra por estado (pendientes, confirmadas, etc.). Cambia el estado de las citas. Confirma o cancela citas según disponibilidad.

- **Para Administradores**
1. Dashboard completo: Gestión de usuarios (crear, editar, eliminar). Visualización de todas las citas del sistema. Estadísticas y reportes básicos. Administración de perfiles médicos.

## Créditos
Desarrollado por Juan Faz como proyecto profesional full-stack, combinando tecnologías modernas para crear una solución completa de gestión médica.
