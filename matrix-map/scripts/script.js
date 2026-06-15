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

/** @param {ImageBitmap} img  */
function processImage(img) {
  const MAX_SIZE_W = 256;
  const MAX_SIZE_H = 128;

  let width = img.width;
  let height = img.height;

  const scale_w = Math.min(1, MAX_SIZE_W / width);
  const scale_h = Math.min(1, MAX_SIZE_H / height);
  const scale = Math.min(scale_w, scale_h);

  width = Math.round(width * scale);
  height = Math.round(height * scale);
  console.log(img.width, img.height, scale_w, scale_h, scale, width, height);

  const canvas = document.getElementById("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(img, 0, 0, img.width, img.height,
                     0, 0, width, height );

  const pixels = ctx.getImageData(
    0,
    0,
    width,
    height
  ).data;

  let newPalette = [];
  let newMatrix = [];

  //
  COLOR_TOLERANCE = 20;

  function colorDistance(r1, g1, b1, r2, g2, b2) {
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return Math.sqrt(dr * dr + dg * dg + db * db);
    // return (
    //   Math.abs(r1 - r2) +
    //   Math.abs(g1 - g2) +
    //   Math.abs(b1 - b2)
    // );
  }

  function findSimilarColor(r, g, b, tolerance = COLOR_TOLERANCE) {

    for (let i = 0; i < newPalette.length; i++) {

      const p = newPalette[i];

      if (
        colorDistance(
          r, g, b,
          p.r, p.g, p.b
        ) <= tolerance
      ) {
        return i;
      }
      
    }

    return -1;
  }
  //

  MAX_COLORS = 32;
  for (let y = 0; y < height; y++) {

    const row = [];

    for (let x = 0; x < width; x++) {

      const p = (y * width + x) * 4;

      const r = pixels[p];
      const g = pixels[p + 1];
      const b = pixels[p + 2];
      const a = pixels[p + 3];

      let index = findSimilarColor(r, g, b);

      if (index === -1 && newPalette.length >= MAX_COLORS) {
        index = findSimilarColor(r, g, b, 1000);
        if (index === -1) index = 0;
        // alert("La imagen tiene más de 32 colores.");
        // return;
      }

      if (index === -1) {
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