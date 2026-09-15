/*
====================================================

    THE MISSING PIECE

    Replace ??? with the 29 rows
    obtained from the previous challenge.

    Example:

    const qrData = [
        "1111111...",
        "1000001...",
        ...
    ];

====================================================
*/

const qrData = [
    "???"
];

const qr = document.getElementById("qr");

qrData.forEach(row => {

    [...row].forEach(bit => {

        const cell = document.createElement("div");

        cell.className =
            bit === "1"
            ? "cell black"
            : "cell";

        qr.appendChild(cell);

    });

});