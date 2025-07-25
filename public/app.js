document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("fname").value.trim();
    const date = document.getElementById("dtime").value;

    if (name === "") {
        alert("Please enter your full name.");
        return;
    }

    if (date === "") {
        alert("Please select a date and time.");
        return;
    }

    const now = new Date();
    const selected = new Date(date);

    if (selected <= now) {
        alert("The date must be in the future.");
        return;
    }

    fetch("/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date })
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        document.querySelector("form").reset();
    })
    .catch(err => {
        alert("Error sending reservation.");
        console.error(err);
    });
});
