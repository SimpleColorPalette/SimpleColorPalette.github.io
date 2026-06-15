let palette = new Palette();
let matrix = new Matrix(palette);

/** @type "CONSOLE" | "TILEMAP" */
let mode = "CONSOLE";

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
  changeCellMode(mode, true);
}

const copyMatrix = () => {
  matrix.copyMatrix();
}


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

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b)
    .toString(16)
    .slice(1);
}

// Show matrix by image
document.getElementById("image-input").addEventListener("change", loadImage);

function loadImage(e) {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();

  img.onload = () => createImageBitmap(file, {
    imageOrientation: "from-image"
  }).then(bitmap => {
    processImage(bitmap);
  });

  img.src = URL.createObjectURL(file);
}

function processImage(img) {

  if (img.width > 256 || img.height > 64) {
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

  let newPalette = [];
  let newMatrix = [];

  //
  COLOR_TOLERANCE = 10; // Ajustable

  function colorDistance(r1, g1, b1, r2, g2, b2) {
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;

    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  function findSimilarColor(r, g, b) {

    for (let i = 0; i < newPalette.length; i++) {

      const p = newPalette[i];

      if (
        colorDistance(
          r, g, b,
          p.r, p.g, p.b
        ) <= COLOR_TOLERANCE
      ) {
        return i;
      }
    }

    return -1;
  }
  //

  for (let y = 0; y < img.height; y++) {

    const row = [];

    for (let x = 0; x < img.width; x++) {

      const p = (y * img.width + x) * 4;

      const r = pixels[p];
      const g = pixels[p + 1];
      const b = pixels[p + 2];
      const a = pixels[p + 3];

      let index = findSimilarColor(r, g, b);

      if (index === -1) {

        if (newPalette.length >= 32) {
          alert("La imagen tiene más de 32 colores.");
          return;
        }

        index = newPalette.length;

        newPalette.push({ r:r, g:g, b:b, q:1 });
      }
      else {
        newPalette[index].q++;
      }

      row.push(index);
    }

    newMatrix.push(row);
  }

  changeCellMode("TILEMAP");
  document.getElementById("width").value = newMatrix[0].length;
  document.getElementById("height").value = newMatrix.length;

  palette.createPalette(newPalette.map(p=>rgbToHex(p.r, p.g, p.b)));
  matrix.updateMatrix(newMatrix);

  if (newPalette.length > 0) {
    let iMaxColor = {i: -1, q: 0};
    for (let i = 0; i < newPalette.length; i++) {
      if (newPalette[i].q > iMaxColor.q)
        iMaxColor = {i: i, q : newPalette[i].q};
    }
    palette.setBgColor( iMaxColor.i );
  }
}