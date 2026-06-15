class Palette {
  static ConsoleColors = [
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

  /** @type {string[]} */
  #palette = [];
  
  /** @type {number} */
  #bgColor = 0;
  /** @type {number} */
  #currentColor = 1;
  /** @type {number} */
  #lastColor = 1;
  
  /** @type {HTMLDivElement} */
  #paletteCont = document.getElementById("palette");

  /** @param {string[]} palette  */
  constructor(palette = Palette.ConsoleColors) {
    this.createPalette(palette);
  }

  /** @param {string[]} palette  */
  createPalette(palette = Palette.ConsoleColors) {
    this.#palette = palette;
    this.#paletteCont.innerHTML = "";

    this.#palette.map((color, index) => {
      const btn = document.createElement("div");
      const textColorStyle = getContrastColor(color) ? "color-text-dark" : "color-text-light";

      btn.className = "btn color-btn " + textColorStyle;
      btn.style.background = color;

      btn.textContent = index;
      if (this.#currentColor == index)
        btn.classList.add("selected");

      btn.onclick = () => {
        this.selectColor(index);
      };

      this.#paletteCont.appendChild(btn);
    });
  }

  isValidColor (index) { return index >= 0 && index < this.#palette.length; }

  getColor (index) { return this.#palette[index]; }
  getCurrent () { return this.#currentColor; }
  setBgColor (index = 0) { this.#bgColor = index; }

  #isErasing = false;

  /** @param index {number} */
  selectColor (index) {
    if (index < 0) {
      this.#isErasing = !this.#isErasing;
      index = this.#isErasing ? this.#bgColor : this.#lastColor;
    }

    if (!this.isValidColor(index)) return;
    this.#currentColor = index;

    if (index != this.#bgColor) this.#lastColor = index;

    [...this.#paletteCont.children].map((btn, i) => {
      if (i == index)
        btn.classList.add("selected");
      else
        btn.classList.remove("selected");
    });
  }
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