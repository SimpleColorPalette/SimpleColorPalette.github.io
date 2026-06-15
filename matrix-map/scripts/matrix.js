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

