
// ===== Modo oscuro automático =====
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.remove("light");
  document.body.classList.add("dark");
}
else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.remove("dark");
  document.body.classList.add("light");
}
