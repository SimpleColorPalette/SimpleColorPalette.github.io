class Grid {
  /** @type {HTMLDivElement} */
  #grid;

  /** @type {{w: number, h: number}} */
  #cellSize = {w: 12, h: 12};

  /** @type {boolean} */
  #isPainting = false;

  /** @type {Matrix} */
  #matrix = null;

  constructor(matrix = null, gridId = "grid") {
    this.#matrix = matrix;
    this.#grid = document.getElementById(gridId);

    // listeners for paint

    // whole document
    document.addEventListener("pointerup", () => {
      this.#isPainting = false;
    });
    document.addEventListener("pointercancel", () => {
      this.#isPainting = false;
    });
    
    // grid
    this.#grid.addEventListener("pointerdown", (e) => {
      this.#isPainting = true;
      this.paintFromEvent(e);
    });
    this.#grid.addEventListener("pointermove", (e) => {
      if (this.#isPainting) {
        this.paintFromEvent(e);
      }
    });
  }
  
  /** @param {number} w  */
  updateSize () {
    this.#grid.style.gridTemplateColumns = `repeat(${this.#matrix.getWidth()}, ${this.#cellSize.w}px)`;
  }

  /**
   * @param {number} h 
   * @param {number} w 
  */
  updateCellSize (w, h) {
    this.#cellSize = { w: w, h: h };

    this.updateSize();
    // const cw = parseInt(document.getElementById("cell-width").value);
    // const ch = parseInt(document.getElementById("cell-height").value);

    [...this.#grid.children].forEach((cell, i) => {
      cell.style.width = this.#cellSize.w + "px";
      cell.style.height = this.#cellSize.h + "px";
    });
  }

  draw () {
    this.#grid.innerHTML = "";
    const matrix = this.#matrix.getMatrix();

    for (let y = 0; y < matrix.length; y++) {

      for (let x = 0; x < matrix[y].length; x++) {

        const cell = document.createElement("div");

        cell.className = "cell";
        cell.style.background = getColor(matrix[y][x]);
        cell.style.width = this.#cellSize.w + "px";
        cell.style.height = this.#cellSize.h + "px";

        cell.dataset.x = x;
        cell.dataset.y = y;

        // cell events
        cell.onpointerdown = (e) => {
          e.preventDefault(); // Evita seleccionar texto
          this.#isPainting = true;
          this.paintCell(x, y, cell);
        };

        cell.onpointerenter = (e) => {
          if (this.#isPainting) {
            this.paintCell(x, y, cell);
          }
        };

        cell.onpointerover = () => {
          if (this.#isPainting) {
            this.paintCell(x, y, cell);
          }
        };

        cell.onpointermove = () => {
          if (this.#isPainting) {
            this.paintCell(x, y, cell);
          }
        };
        // -- cell events

        this.#grid.appendChild(cell);
      }
    }
  }

  /** @param {number} x
   * @param {number} y
   * @param {HTMLElement} cell
   */
  paintCell(x, y, cell) {
    cell.style.background = getColor(currentColor);

    if (this.#matrix) {
      this.#matrix.getMatrix()[y][x] = currentColor;
      this.#matrix.updateOutput();
    }
  } 

  paintFromEvent(e) {
    const cell = document.elementFromPoint( e.clientX, e.clientY );
    if (!cell || !cell.classList.contains("cell")) return;

    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);

    this.paintCell(x, y, cell);
  }
}

class Matrix {
  
  /** @type {number[][]} */
  #matrix = [];
  
  /** @type {Grid} */
  #grid;
  
  constructor(width = 0, height = 0,
              widthId = "width", heightId = "height",
              gridId = "grid") {

    this.#grid = new Grid(this, gridId);
    this.updateMatrixSize(width, height, widthId, heightId);
  }

  getHeight() { return this.#matrix.length; }
  getWidth() { return this.getHeight() < 1 ? 0 : this.#matrix[0].length; }

  updateMatrixSize(width = 0, height = 0,
                   widthId = "width", heightId = "height") {
    
    if (width == 0) width = parseInt(document.getElementById(widthId).value);
    if (height == 0) height = parseInt(document.getElementById(heightId).value);

    const DEFAULT_VAL = 0;

    if (this.#matrix.length === 0) {
      
      this.#matrix = Array.from(
        { length: height },
        () => Array(width).fill(DEFAULT_VAL)
      );

    }
    else {
      
      this.#matrix = Array.from(
        { length: height },
        () => Array(width).fill(DEFAULT_VAL)
      );
      // const nSides = Math.abs( (width - this.#matrix.length) / 2 );
      // if (this.#matrix.length > width) {
      //   this.#matrix.splice( -nSides );
      //   this.#matrix.splice(0, width - this.#matrix.length);
      // }
      // else if (this.#matrix.length < width) {
      //   this.#matrix.unshift(...Array(nSides).fill(DEFAULT_VAL));
      //   this.#matrix.fill(DEFAULT_VAL, -(this.#matrix.length - width));
      // }
    }

    this.#grid.draw();
    this.updateOutput();
  }

  getGrid() { return this.#grid; }
  getMatrix() { return this.#matrix; }
  
  updateOutput() {
    const output = document.getElementById("output");

    const txt =
        "{" +
        this.#matrix
            .map(row => "{" + row.join(",") + "}")
            .join(",\n")
        + "}";

    output.textContent = txt;
    
    // Updating FonstSize
    let alpha = (this.#matrix[0].length - 40) / (120 - 40);
    alpha = 1 - Math.max(0, Math.min(alpha, 1));
    const fs = alpha * 4 + 7;
    output.style.fontSize = fs + "pt";
  }

  async copyMatrix () {
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

}

