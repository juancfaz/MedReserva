document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("fname").value.trim();
    const date = document.getElementById("dtime").value;

    if (name === "") {
        alert("Please write your full name");
        return;
    }

    if (date === "") {
        alert("Please select a date and time");
        return;
    }

    const now = new Date();
    const selected = new Date(date);

    if (selected <= now) {
        alert("The date must be after the current time");
        return;
    }

    // Si todo está bien, enviar el formulario
    this.submit();

    alert("Booking successful!");
});
