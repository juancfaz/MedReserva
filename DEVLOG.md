# 1 🗓️ 24 de julio del 2025.

## 🎯 Objetivo:
Aprender a estructurar contenido con HTML y aplicar estilos básicos con CSS en una página web.

---

## ❓ Preguntas clave.

### ¿Qué es HTML y cuál es su propósito?
HTML (HyperText Markup Language) es el lenguaje estándar para crear páginas web. 

Su propósito es **definir la estructura y el contenido** de una página, organizando elementos como encabezados, párrafos, listas, formularios, enlaces, imágenes, etc.

### ¿Qué etiquetas se usan para encabezados, formularios y navegación?

- **Encabezados:** `<h1>` a `<h6>`, siendo `<h1>` el más importante y `<h6>` el menos importante.

- **Formularios:** `<form>`, `<input>`, `<label>`, `<textarea>`, `<select>`, `<option>`, `<button>`, `<fieldset>`, `<legend>`. Estas etiquetas permiten recolectar datos del usuario.

- **Navegación:** `<nav>` para la sección de navegación, y `<a>` para enlaces internos o externos.

### ¿Cómo se hace que una página sea responsive?

1. Usar una meta etiqueta viewport:  
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```
2. Aplicar estilos flexibles con CSS (porcentaje, flexbox, grid, etc.).

3. Usar media queries para adaptar el diseño a distintos tamaños de pantalla.

4. Probar el diseño en dispositivos móviles y escritorio.

## ✅ Tareas realizadas.

1. Crear index.html con estructura básica.
    ```html
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mi primera página web</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <h1>Hola Mundo!</h1>
        <p>Este es un párrafo de ejemplo.</p>
    </body>
    </html>
    ```

2. Crear style.css y probar estilos simples.
    ```css
    h1 {
        color: red;
    }

    p {
        color: blue;
    }
    ```

3. Añadir formulario básico de reservas.
    ```html
    <h1>Reservation Form</h1>
    <form>
        <label for="fname">Full name:</label>
        <input type="text" id="fname" name="fname"><br><br>

        <label for="dtime">Datetime:</label>
        <input type="datetime-local" id="dtime" name="dtime"><br><br>

        <button type="submit">Reserve</button>
    </form>
    ```

# 2 🗓️ 25 de julio del 2025.

## 🎯 Objetivo:
Adaptar la interfaz para diferentes tamaños de pantalla.

---

## ❓ Preguntas clave.

### ¿Qué es Flexbox y Grid?
Flexbox: Es una herramienta de CSS que te ayuda a organizar y alinear elementos en una fila o en una columna, fácilmente.

Grid: Como su nombre lo dice es una cuadricula que permite organizar elementos.

### ¿Cómo se aplican media queries?
Las media queries en CSS te permiten adaptar el diseño de una página web según el tamaño de la pantalla del dispositivo.

## ✅ Tareas realizadas.

1. Hacer que el formulario se vea bien en móvil y escritorio.
Usamos Flexbox y agregamos un <div class="container"> ya que Flexbox se aplica sobre contenedores.

En style.css aplicamos propiedades como display: flex, flex-direction: column, align-items: center y justify-content: center para centrar el contenido.

También se usó max-width en el formulario para limitar su tamaño en pantallas grandes y width: 100% para adaptarlo en móviles.

2. Añadir elementos de navegación (menú, footer).
El menú se colocó al inicio del <body> dentro de una etiqueta <nav>, usando una lista de enlaces (<ul><li><a>).

Se usó Flexbox para alinearlos horizontalmente con display: flex, justify-content: center y gap para separarlos.

El footer se añadió al final del <body>, dentro de una etiqueta <footer>. 

Contiene un mensaje simple de derechos reservados y se estilizó para quedar centrado y con fondo gris claro.

# 3 🗓️ 25 de julio del 2025.

## 🎯 Objetivo:
Agregar interactividad básica al formulario usando JavaScript. Validar que los datos no estén vacíos y que la fecha/hora sea válida.

---

## ❓ Preguntas clave.

### ¿Qué es el DOM?
Es como si tomaramos el HTML y lo trasformaramos a un archivo de JavaScript. Te permite acceder y modificar el contenido, estructura y estilo de la pagina.

Ejemplo:
    ```JS
    document.getElementById("fname") te da acceso al input de nombre.
    ```
    
### ¿Cómo se capturan eventos del formulario?
Con codigo JavaScript podemos decirle al navegador que ejecute una funcion cuando se interactue con el HTML.

Ejemplo:
    ```JS
    form.addEventListener("submit", function(e) {
        e.preventDefault(); // evita que el formulario se envíe automáticamente
    });
    ```

### ¿Cómo se hace validación en el cliente?
La validacion se hace con un condicional if y verifica los datos antes de enviarlos al servidor.

Ejemplo: verificar que el campo de nombre no esté vacío.

## ✅ Tareas realizadas.

1. Crear el archivo app.js y enlazarlo.
Una vez creado el archivo app.js agregue <script src="app.js"></script> a mi html entre <body>... </body> para enlazarlo.

2. Validar nombre y fecha.
Agregamos la captura de un evento del formulario al mandar la reservacion se pregunta si el nombre no esta vacio y si la fecha no este vacia y que la fecha sea actual.

# 4 🗓️ 25 de julio del 2025.

## 🎯 Objetivo:
Crear un servidor básico con Node.js y Express para procesar el formulario de reservas y preparar conexión con una base de datos (ej: SQLite o MongoDB más adelante).

---

## ❓ Preguntas clave.

### ¿Qué es Node.js y para qué sirve?
Es un entorno de ejecucion para JavaScript del lado del servidor. Permite crear servidores web, manejar archivos, conectarse a bases de datos, etc.
    
### ¿Qué es Express.js?
Es un framework (estructura estandarizada que proporciona un conjunto de herramientas, bibliotecas y convenciones para desarrollar software) para Node.js que simplifica la creacion de servidores HTTP. 

## ✅ Tareas realizadas.

1. Inicializar proyecto Node.

Desde la terminal (en la carpeta del proyecto):
    ```bash
    npm init -y
    ```

2. Instalar Express.
    ```bash
    npm install express
    ```

3. Crear server.js
El archivo server.js funciona como el backend del sistema, usando Node.js y Express para recibir datos del formulario, validar la información y responder al cliente. Además, sirve archivos estáticos y está preparado para conectarse a una base de datos en futuras mejoras.

4. Estructura del proyecto.
Actualizamos el directorio de los archivos para darle una forma mas formal a mi proyecto.

5. Modificar el HTML.
En el formulario HTML añadi <form action="/reserve" method="POST">

# 5 🗓️ 25 de julio del 2025.

## 🎯 Objetivo:
Guardar las reservas realizadas en una base de datos real para que no se pierdan al reiniciar el servidor.

---

## 🔧 Elección del motor de base de datos

### Vamos a usar SQLite, porque:

- **Es ligero y local (no necesitas instalar un servidor externo).**

- **Guarda los datos en un solo archivo .db.**

- **Ideal para aprender.**

- **Se puede migrar fácilmente a MySQL o PostgreSQL después.**


## ✅ Tareas realizadas.

1. Instalar SQLite y librería para Node.js
Abrimos la terminal en el proyecto y ejecutamos:
    ```bash
    npm install sqlite3
    ```

2. Crear archivo db.js
Este archivo manejará la conexión y las operaciones de base de datos.

3. Conectar server.js con la base de datos
Modificamos el archivo server.js para usar db.js.

# 6 🗓️ 25 de julio del 2025.

## 🎯 Objetivo:
Crear una página tipo panel administrativo donde puedas ver todas las reservas guardadas en la base de datos.

---

## ❓ Preguntas clave.

### ¿Cómo puedo obtener los datos almacenados en SQLite desde el navegador?
Usando una API en Node.js que consulte SQLite y devuelva JSON.

### ¿Cómo muestro los datos en una tabla HTML de forma dinámica?
Con JS, recorres el JSON y creas filas dinámicamente en la tabla.

### ¿Cómo conecto el servidor (Node.js) con el frontend (HTML + JS)?
Con fetch() en JS consumes la API del servidor Node.js.

### ¿Qué pasa si no hay reservas aún? ¿Se puede manejar sin errores?
Sí, verifica si el array está vacío y muestra un mensaje.

## ✅ Tareas realizadas.

1. Crear admin.html:
Se hizo una nueva página dentro del directorio public/ para el panel administrativo, con estructura HTML y diseño consistente.

2. Agregar tabla HTML:
Se creó una tabla con encabezados (ID, Full Name, Date and Time) para mostrar los registros.

3. Programar script en admin.html:
Se hizo una petición fetch a la API /api/reservations para recuperar los datos desde el backend y mostrarlos en la tabla de forma automática.

4. Agregar nueva ruta en el servidor:
Se implementó una ruta GET /api/reservations en server.js que consulta todos los registros de la base de datos y los devuelve en formato JSON.

5. Conectar backend y frontend:
Se integró la respuesta JSON con el DOM para mostrar cada reserva como una fila en la tabla HTML.

6. Estilizar la tabla en style.css:
Se añadió diseño visual para las tablas: colores, bordes, espaciado, encabezados azules y filas alternadas.

7. Verificación funcional completa:
Se verificó que al agregar reservas en el formulario (index.html), estas aparecen automáticamente en el panel (admin.html) sin recargar el servidor.

# 7 🗓️ 25 de julio del 2025.

## 🎯 Objetivo:
Permitir que un administrador elimine reservas directamente desde la interfaz.

---

## ❓ Preguntas clave.

### ¿Cómo envío una solicitud para eliminar un registro específico?
Se utiliza fetch() con el método HTTP DELETE, enviando como parámetro el id del registro. Ejemplo:
    ```JS
    fetch(`/api/reservations/${id}`, {
    method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
    if (data.success) {
        // Eliminar fila del DOM, etc.
    }
    });
    ```

### ¿Qué método HTTP se usa para eliminar datos?
El método DELETE es el que se usa para indicarle al servidor que debe borrar un recurso identificado (por ejemplo, una reserva con cierto id).

### ¿Cómo actualizo la tabla automáticamente tras eliminar una fila?
Después de recibir la confirmación de que la reserva fue eliminada con éxito desde el servidor, usamos JavaScript para eliminar la fila del DOM. Ejemplo:
    ```JS
    row.remove(); // Donde 'row' es la fila correspondiente al botón presionado
    ```

### ¿Cómo evito eliminaciones accidentales?
Antes de enviar la solicitud de eliminación, se muestra un mensaje de confirmación al usuario usando confirm():
    ```JS
    if (confirm("Are you sure you want to delete this reservation?")) {
        // Proceder con eliminación
    }
    ```

## ✅ Tareas realizadas.

1. Agregar botón "Delete" a cada fila:
En admin.html, se actualizó el código JS que genera las filas para añadir una nueva celda con un botón de eliminar.

2. Programar evento click en cada botón:
Al presionar "Delete", se muestra una confirmación (confirm("Are you sure?")) y si el usuario acepta, se envía una solicitud DELETE al servidor.

3. Implementar ruta DELETE en server.js:
Se agregó una nueva ruta:
    ```JS
    app.delete("/api/reservations/:id", (req, res) => {
        const id = req.params.id;  // Obtener id de la URL
        db.run("DELETE FROM reservations WHERE id = ?", id, function(err) {
            if (err) {
                console.error("Error deleting reservation:", err.message);
                return res.status(500).json({ error: "Failed to delete reservation" });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "Reservation not found" });
            }
            res.json({ success: true });
        });
    });
    ```

4. Actualizar frontend tras eliminar:
Después de una eliminación exitosa, se remueve la fila correspondiente del DOM sin necesidad de recargar toda la tabla.

5. Estilo visual para botón:
El botón se estilizó con CSS (.delete-btn) para hacerlo rojo y visualmente claro como una acción peligrosa.

# 8 🗓️ 25 de julio del 2025.

## 🎯 Objetivo:
Permitir que el administrador pueda buscar reservas o editar la información de una reserva existente.

---

## ❓ Preguntas clave.

### ¿Cómo se puede buscar una reserva en una tabla HTML?
Hay varias formas, pero la más sencilla es usar JavaScript para filtrar filas de una tabla en base a lo que el usuario escriba en un campo de búsqueda (input). Por ejemplo: buscar por nombre.

### ¿Cómo se edita una fila en una tabla HTML?
Hay dos métodos comunes:

Hacer que los campos de la fila se vuelvan editables directamente (inline editing).

O bien, al hacer clic en "Editar", mostrar un formulario modal o emergente para modificar los datos y luego actualizar la tabla y la base de datos.

### ¿Cómo se actualizan los datos en el servidor?
Se usa una petición PUT o PATCH con fetch() o axios para enviar los datos modificados al servidor.

El servidor actualiza la base de datos (por ejemplo, MongoDB), y devuelve una respuesta indicando si fue exitoso.


## ✅ Tareas realizadas.

### Implementar búsqueda en la tabla de reservas.
1. Añadir un campo <input> sobre la tabla para escribir el nombre a buscar.

2. Escribir una función JavaScript que escuche cuando el usuario escriba y filtre las filas de la tabla según lo que escriba.

### Habilitar edición de reservas.
1. Agregar un botón “Edit” junto al botón “Delete” en cada fila.

2. Al hacer clic en “Edit”, mostrar un formulario para modificar los datos de esa fila (puede ser un formulario emergente o que se auto-rellene arriba).

3. Cuando el usuario guarde los cambios, se debe:
    - **Validar los datos.**

    - **Enviar una petición PUT al backend para actualizar la reserva.**

    - **Refrescar la tabla para mostrar los nuevos datos.**