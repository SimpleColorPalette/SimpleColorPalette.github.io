let palette = [];
let nColors = 16;
let currentColor = 1;
let lastColor = 1;
const paletteCont = document.getElementById("palette");

const consoleColors = [
    "#000000", // Black
    "#000080", // DarkBlue
    "#008000", // DarkGreen
    "#008080", // DarkCyan
    "#800000", // DarkRed
    "#800080", // DarkMagenta
    "#808000", // DarkYellow
    "#C0C0C0", // Gray
    "#808080", // DarkGray
    "#0000FF", // Blue
    "#00FF00", // Green
    "#00FFFF", // Cyan
    "#FF0000", // Red
    "#FF00FF", // Magenta
    "#FFFF00", // Yellow
    "#FFFFFF", // White
];

const isValidColor = (index) => {
    return index >= 0 && index < palette.length;
}

const getColor = (index) => {
    return palette[index];
}

/** @returns true if use black, false if white */
const getContrastColor = (hex) => {
    hex = hex.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Luminancia perceptual
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    // return luminance > 186;
    return luminance > 128;
}

generatePalette = () => {
    palette = [];
    // const nColors = Math.min(parseInt(document.getElementById("colors").value || 1), 254);

    for (let i = 0; i < nColors; i++) {
        if (i < consoleColors.length) {
            palette.push(consoleColors[i]);
        } else {
            palette.push(
                `hsl(${(i - consoleColors.length) * 360 / (nColors - consoleColors.length)},80%,60%)`
            );
        }
    }

    createPalette();
}

function createPalette() {
    paletteCont.innerHTML = "";

    palette.forEach((color, index) => {
        const btn = document.createElement("div");
        const textColorStyle = getContrastColor(color) ? "color-text-dark" : "color-text-light";

        btn.className = "btn color-btn " + textColorStyle;
        btn.style.background = color;

        btn.textContent = index;
        if (currentColor == index)
            btn.classList.add("selected");

        btn.onclick = () => {
            selectColor(index);
        };

        paletteCont.appendChild(btn);
    });
}

let isErasing = false;

/** @param index {number} */
const selectColor = (index) => {
    if (index < 0) {
        isErasing = !isErasing;
        index = isErasing ? 0 : lastColor;
    }

    if (!isValidColor(index)) return;
    currentColor = index;
    
    if (index > 0) lastColor = index;

    [...paletteCont.children].forEach((btn, i) => {
        if (i == index)
            btn.classList.add("selected");
        else
            btn.classList.remove("selected");
    });
}


generatePalette();