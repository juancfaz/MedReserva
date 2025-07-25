# 24 de julio del 2025

## Objetivo: Aprender a estructurar contenido y dar estilo básico a una página.

## Preguntas clave:

* ¿Qué es HTML y cuál es su propósito?
Es el lenguaje estándar para crear páginas web. Su proposito es estructurar el contenido de las páginas web.

* ¿Qué etiquetas se usan para encabezados, formularios y navegación?
Encabezados: <h1>, <h2>, ..., <h6>. Del mas al menos importante.
Formularios: <form>, <input>, <label>, <textarea>, <select>, <option>, <button>, <fieldset>, y <legend>.  Estas etiquetas permiten crear campos de entrada, listas desplegables, botones, áreas de texto y organizar los campos del formulario.
Navegación: <nav> (se usa para definir una sección de navegación) y <a> (crea enlaces).

* ¿Cómo se hace que una página sea responsive?
1. Planifica el sitio web.
2. Codifica con HTML y CSS.
3. Prueba tus versiones.

## Tareas:

* Crear el archivo index.html con estructura base.

```
<!DOCTYPE html>
<html>
<head>
    <title>Mi primera pagina web</title>
</head>
<body>
    <h1>Hola Mundo!</h1>
    <p>Este es un parrafo de ejemplo.</p>
</body>
</html>
```

* Crear style.css y probar estilos simples.

El encabezado <h1> color rojo y el parrafo <p> color azul.

```
<style>
    h1 {
        color: red;
    }

    p {
        color: blue;
    }
</style>
```

* Añadir un formulario básico para agendar una cita (nombre, fecha, hora).

```
<h1>Reservation Form</h1>
<label for="fname">Full name:</label>
<input type="text" id="fname" name="fname"><br><br>
<label for="dtime">Datetime:</label>
<input type="datetime-local" id="dtime" name="dtime"><br><br>
```