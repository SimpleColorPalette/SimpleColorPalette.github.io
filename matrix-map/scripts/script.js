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
    palette.selectColor( parseInt(numberBuffer) );
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