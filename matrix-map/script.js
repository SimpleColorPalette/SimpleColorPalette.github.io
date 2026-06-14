let matrix = [];
let isPainting = false;

let cellSize = {w: 8, h: 16};
    // const cw = parseInt(document.getElementById("cell-width").value);
    // const ch = parseInt(document.getElementById("cell-height").value);

function createMatrix() {
    const w = parseInt(document.getElementById("width").value);
    const h = parseInt(document.getElementById("height").value);

    matrix = Array.from(
        { length: h },
        () => Array(w).fill(0)
    );

    drawGrid();
    updateOutput();
}

document.addEventListener("pointerup", () => {
    isPainting = false;
});
document.addEventListener("pointercancel", () => {
    isPainting = false;
});

/** @param {number} x
 * @param {number} y
 * @param {HTMLElement} cell
 */
function paintCell(x, y, cell) {
    matrix[y][x] = currentColor;
    cell.style.background = getColor(currentColor);
    updateOutput();
}

function drawGrid() {
    const grid = document.getElementById("grid");

    grid.style.gridTemplateColumns = `repeat(${matrix[0].length}, ${cellSize.w}px)`;
    grid.innerHTML = "";

    for (let y = 0; y < matrix.length; y++) {

        for (let x = 0; x < matrix[y].length; x++) {

            const cell = document.createElement("div");

            cell.className = "cell";
            cell.style.background = getColor(matrix[y][x]);
            cell.style.width = cellSize.w + "px";
            cell.style.height = cellSize.h + "px";

            cell.dataset.x = x;
            cell.dataset.y = y;

            cell.onpointerdown = (e) => {
                e.preventDefault(); // Evita seleccionar texto
                isPainting = true;
                paintCell(x, y, cell);
            };

            cell.onpointerenter = (e) => {
                if (isPainting) {
                    paintCell(x, y, cell);
                }
            };

            cell.onpointerover = () => {
                if (isPainting) {
                    paintCell(x, y, cell);
                }
            };

            cell.onpointermove = () => {
                if (isPainting) {
                    paintCell(x, y, cell);
                }
            };

            grid.appendChild(cell);
        }
    }
}

grid.addEventListener("pointerdown", (e) => {
    isPainting = true;
    paintFromEvent(e);
});

grid.addEventListener("pointermove", (e) => {
    if (isPainting) {
        paintFromEvent(e);
    }
});

function paintFromEvent(e) {
    const cell = document.elementFromPoint(
        e.clientX,
        e.clientY
    );

    if (!cell || !cell.classList.contains("cell"))
        return;

    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);

    paintCell(x, y, cell);
    updateOutput();
}


function updateOutput() {
    const output = document.getElementById("output");

    const txt =
        "{" +
        matrix
            .map(row => "{" + row.join(",") + "}")
            .join(",\n")
        + "}";

    output.textContent = txt;
    
    let alpha = (matrix[0].length - 40) / (120 - 40);
    alpha = 1 - Math.max(0, Math.min(alpha, 1));
    const fs = alpha * 4 + 7;
    output.style.fontSize = fs + "pt";
}

createMatrix();

const copyMatrix = async () => {
    const text = document.getElementById("output").textContent;

    try {
        await navigator.clipboard.writeText(text);

        // Opcional: feedback visual
        const btn = document.getElementById("copy-btn");
        const oldText = btn.textContent;
        btn.textContent = "¡Copiado!";

        setTimeout(() => {
            btn.textContent = oldText;
        }, 1000);

    } catch (err) {
        console.error(err);
        alert("No se pudo copiar al portapapeles.");
    }
};

let numberBuffer = "";
let numberTimer = null;

document.addEventListener("keydown", (e) => {
    if (e.key == "c" || e.key == "C") {
        selectColor(-1);
        numberBuffer = "";
        return;
    }

    // Solo aceptar dígitos
    if (e.key < "0" || e.key > "9") return;

    numberBuffer += e.key;

    clearTimeout(numberTimer);

    numberTimer = setTimeout(() => {
        selectColor( parseInt(numberBuffer) );
        numberBuffer = "";
    }, 175); // Espera 300 ms por el siguiente dígito
});


const updateCellSize = () => {
    const grid = document.getElementById("grid");
    
    [...grid.children].forEach((cell, i) => {
        cell.style.width = cellSize.w + "px";
        cell.style.height = cellSize.h + "px";
    });
}

/** @type "CONSOLE" | "TILEMAP" */
let mode = "CONSOLE";

/** @param newMode {"CONSOLE" | "TILEMAP"} */
const changeCellMode = (newMode, force = false) => {
    if (!force && newMode == mode) return;

    /** @type HTMLButtonElement */
    const btnConsole = document.getElementById("btn-mode-console");
    /** @type HTMLButtonElement */
    const btnTilemap = document.getElementById("btn-mode-tilemap");

    if (newMode == "CONSOLE") {
        cellSize = { w: 8, h: 16 };
        btnConsole.classList.add("btn-selected");
        btnTilemap.classList.remove("btn-selected");
    }
    else if (newMode == "TILEMAP") {
        cellSize = { w: 12, h: 12 };
        btnTilemap.classList.add("btn-selected");
        btnConsole.classList.remove("btn-selected");
    }
    
    mode = newMode;
    updateCellSize();
}

changeCellMode("CONSOLE", true);