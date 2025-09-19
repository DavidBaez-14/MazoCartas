# Mazo de Cartas (mini proyecto)

Interfaz responsiva con paleta de rojos. Muestra una rejilla de imágenes locales de cartas como referencia y una tabla lateral que se alimenta desde un endpoint público en la primera carga. Permite agregar nuevas cartas mediante un formulario. Los datos se guardan en `localStorage`.

- Endpoint usado: https://carlosreneas.github.io/endpoints/cartas.json (estructura: `numero`, `carta`, `valor`). En la app se mapea `valor` a `cantidad`.
- Sin funciones flecha; nombres de clases y funciones en español.
- Lista para ampliar a futuro: autenticación simple y lógica de incremento por clic sobre cada carta.

## Estructura
- `index.html`: Maquetado principal
- `css/styles.css`: Estilos (paleta de rojos)
- `js/app.js`: Lógica para cargar/guardar/renderizar
- `img/`: Imágenes locales de referencia (no forman el JSON)

## Cómo probar
1. Abre `index.html` en tu navegador.
2. La primera vez, la app intenta leer `localStorage`; si está vacío, hace `fetch` al endpoint y guarda el resultado.
3. Usa el formulario para agregar nuevas cartas (Número, Carta, Cantidad). Se ordenan de mayor a menor por `Cantidad`.

Si necesitas servirlo con un servidor estático simple en Windows PowerShell:

```powershell
# Si tienes Python
python -m http.server 5500
# Luego abre http://localhost:5500/MazoDeCartas/
```
