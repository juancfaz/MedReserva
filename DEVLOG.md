# 🗓️ 24 de julio del 2025.

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

# 🗓️ 25 de julio del 2025.

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

# 🗓️ 25 de julio del 2025.

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

# 🗓️ 25 de julio del 2025.

## 🎯 Objetivo: 
Crear un servidor básico con Node.js y Express para procesar el formulario de reservas y preparar conexión con una base de datos (ej: SQLite o MongoDB más adelante).

---

## ❓ Preguntas clave.

### ¿Qué es Node.js y para qué sirve?

    
### ¿Qué es Express.js?


### ¿Cómo se hace validación en el cliente?


Ejemplo: verificar que el campo de nombre no esté vacío.

## ✅ Tareas realizadas.

