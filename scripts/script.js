// ===== Modo oscuro o claro automático =====
class Theme {
  
  static #SetLightMode () {
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    document.getElementById("theme-light").style.display = "none";
    document.getElementById("theme-dark").style.display = "block";
  }
  
  static #SetDarkMode () {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
    document.getElementById("theme-dark").style.display = "none";
    document.getElementById("theme-light").style.display = "block";
  }

  /** @param {"light"|"dark"} mode */
  static LoadMode(mode) {
    let currentMode = localStorage.getItem("theme-mode");
    if (currentMode == null) currentMode = mode;
    currentMode == "light" ? this.#SetLightMode() : this.#SetDarkMode();
  }

  /** @param {"light"|"dark"} currentMode */
  static SetMode(newMode) {
    localStorage.setItem("theme-mode", newMode);
    newMode == "light" ? this.#SetLightMode() : this.#SetDarkMode();
  }
  
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  Theme.LoadMode("dark");
}
else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
  Theme.LoadMode("light");
}
