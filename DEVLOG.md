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