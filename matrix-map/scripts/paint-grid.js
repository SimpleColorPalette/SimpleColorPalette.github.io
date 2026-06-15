class Grid {
  /** @type {HTMLDivElement} */
  #grid;

  /** @type {{w: number, h: number, s: number}} */
  #cellSize = {w: 12, h: 12, s: 1};

  /** @type {boolean} */
  #isPainting = false;

  /** @type {Matrix} */
  #matrix = null;

  /** @type {Palette} */
  #palette = null;

  /**
   * 
   * @param {string} gridId 
   * @param {Matrix} matrix 
   * @param {Palette} palette 
   */
  constructor(gridId = "grid", matrix = null, palette = null) {
    this.#grid = document.getElementById(gridId);
    this.#matrix = matrix;
    this.#palette = palette;

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
    this.#grid.style.gridTemplateColumns =
        `repeat(${this.#matrix.getWidth()}, ${this.#cellSize.w * this.#cellSize.s}px)`;
  }

  /**
   * @param {number} h 
   * @param {number} w 
   * @param {number} s 
  */
  updateCellSize (w = 0, h = 0, s = 0) {
    if (w > 0) this.#cellSize.w = w;
    if (h > 0) this.#cellSize.h = h;
    if (s > 0) this.#cellSize.s = s;

    this.updateSize();
    // const cw = parseInt(document.getElementById("cell-width").value);
    // const ch = parseInt(document.getElementById("cell-height").value);

    [...this.#grid.children].forEach((cell, i) => {
      cell.style.width = (this.#cellSize.w * this.#cellSize.s) + "px";
      cell.style.height = (this.#cellSize.h * this.#cellSize.s) + "px";
    });
  }

  draw () {
    this.#grid.innerHTML = "";
    const matrix = this.#matrix.getMatrix();
    this.updateSize();

    for (let y = 0; y < matrix.length; y++) {

      for (let x = 0; x < matrix[y].length; x++) {

        const cell = document.createElement("div");

        cell.className = "cell";
        cell.style.background = this.#palette.getColor(matrix[y][x]);
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
    cell.style.background = this.#palette.getColor(this.#palette.getCurrent());

    if (this.#matrix) {
      this.#matrix.getMatrix()[y][x] = this.#palette.getCurrent();
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