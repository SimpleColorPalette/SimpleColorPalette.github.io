let palette = new Palette();
let matrix = new Matrix(palette);


let numberBuffer = "";
let numberTimer = null;

document.addEventListener("keydown", (e) => {
  if (e.key == "c" || e.key == "C") {
    palette.selectColor(-1);
    numberBuffer = "";
    return;
  }

  // Solo aceptar dígitos
  if (e.key < "0" || e.key > "9") return;

  numberBuffer += e.key;

  clearTimeout(numberTimer);

  numberTimer = setTimeout(() => {
    palette.selectColor(parseInt(numberBuffer));
    numberBuffer = "";
  }, 175); // Espera 300 ms por el siguiente dígito
});


const updateMatrix = () => {
  if (matrix != undefined || matrix != null) {
    matrix.updateMatrixSize();
  }
  else {
    console.log("matrix does not exist");
  }
}

const cleanMatrix = () => {
  if (matrix != undefined || matrix != null) {
    delete matrix;
  }
  matrix = new Matrix(palette);
}

const copyMatrix = () => {
  matrix.copyMatrix();
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

  /** @type {{w: number, h: number}} */
  let cellSize;

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
  matrix.getGrid().updateCellSize(cellSize.w, cellSize.h);
}

changeCellMode("CONSOLE", true);


// Show matrix by image
document.getElementById("image-input").addEventListener("change", loadImage);

function loadImage(e) {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();

  img.onload = () => processImage(img);
  img.src = URL.createObjectURL(file);
}


function processImage(img) {

  if (img.width > 256 || img.height > 128) {
    alert("Máximo permitido: 256 x 128");
    return;
  }

  const canvas = document.getElementById("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(img, 0, 0);

  const pixels = ctx.getImageData(
    0,
    0,
    img.width,
    img.height
  ).data;

  const colorMap = new Map();

  let newPalette = [];
  let newMatrix = [];

  for (let y = 0; y < img.height; y++) {

    const row = [];

    for (let x = 0; x < img.width; x++) {

      const p = (y * img.width + x) * 4;

      const r = pixels[p];
      const g = pixels[p + 1];
      const b = pixels[p + 2];
      const a = pixels[p + 3];

      const hex = a == 0 ? "#00000000" :
        "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0"); // +
        // a.toString(16).padStart(2, "0");

      if (!colorMap.has(hex)) {

        if (newPalette.length >= 32) {
          alert("La imagen tiene más de 32 colores.");
          return;
        }

        colorMap.set(hex, newPalette.length);
        newPalette.push(hex.substring(0, 7)); // ignorar alpha
      }

      row.push(colorMap.get(hex));
    }

    newMatrix.push(row);
  }

  palette.createPalette(newPalette);
  matrix.updateMatrix(newMatrix);
}