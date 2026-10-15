# Klard Ski · web estática

Web de una sola página para las clases de esquí de Klard en Sierra Nevada. HTML, CSS y JavaScript sin frameworks ni dependencias: se puede subir tal cual a cualquier hosting (GitHub Pages, Netlify, un FTP...).

## Ver en local

```sh
python3 -m http.server 8000
# y abrir http://localhost:8000
```

## Estructura

| Archivo | Qué es |
| --- | --- |
| `index.html` | La página: portada, clases y equipación, profesor, pueblo, pista, forfait y alquiler, contacto y pie |
| `aviso-legal.html`, `privacidad.html` | Textos legales mínimos (plantillas para rellenar) |
| `assets/css/styles.css` | Todos los estilos. Los colores están en `:root` |
| `assets/js/config.js` | **Enlaces de referido (forfait y alquiler), parte de nieve y ubicación del mapa.** Único sitio donde se cambian |
| `assets/js/main.js` | Carrusel, frases con el scroll, ficha de la pista, mapa, enlaces de `config.js` y barra de llamada en móvil |
| `assets/img/` | Ilustraciones provisionales y el sprite de Klard (`klard-salto.webp`) |
| `assets/fonts/` | Montserrat e Inter, servidas desde la propia web (sin Google Fonts ni cookies) |

## Secciones

1. **Portada**: carrusel de tres fondos con zoom lento, titular, botón de llamada y «Ver las clases ↓». Se puede pausar.
2. **Clases y equipación**: tres tarjetas (iniciación, perfeccionamiento, privadas) con duración, precio orientativo, a quién va dirigida y «Reservar por teléfono». Debajo, «Qué llevar a la clase» con lo imprescindible y lo recomendado.
3. **Sobre el profesor**: fondo fijo con frases que cambian al hacer scroll, y después la ficha con el sprite de Klard, cifras y titulaciones.
4. **El pueblo y las pistas**: descripción del pueblo y sus servicios, mapa de Google Maps (solo se carga al pulsar «Ver el mapa», para que la web siga sin cookies hasta entonces) y la estación en cifras (pistas, km, remontes, cota, pistas por nivel y enlace al parte de nieve).
5. **La pista**: ficha técnica al estilo «producto con puntos»: el monte en el centro y cada punto es una pista (negra, roja, azul, verde) con su ficha y una línea guía. Al hacer scroll se va iluminando una pista tras otra; en móvil el monte queda fijo arriba y las fichas pasan por debajo. Cierra con «¿Quieres esquiar aquí? Llámame».
6. **Forfait y alquiler**: dos tarjetas lado a lado, cada una con su enlace de referido (abren en pestaña nueva con `rel="sponsored noopener noreferrer"`) y un aviso de enlaces de afiliado.
7. **Contacto**: teléfono en grande y botones directos para llamar, WhatsApp, email e Instagram.
8. **Pie**: contacto, zona con Google Maps, temporada, redes y enlaces legales.

En móvil aparece una barra fija «Llamar para reservar» al salir de la portada. Con «reducir movimiento» activado en el sistema, todo se muestra sin animaciones.

## Pendiente antes de publicar (datos de relleno)

Todo lo que va entre `[CORCHETES]` en `index.html` es un hueco para rellenar (busca `[`).

- `assets/js/config.js`: `[ENLACE_REFERIDO_FORFAIT]`, `[ENLACE_REFERIDO_ALQUILER]`, `[ENLACE_PARTE_NIEVE]` y `[UBICACIÓN_GOOGLE_MAPS]`. Mientras sigan entre corchetes, los botones no salen de la página y el mapa muestra «Falta la ubicación».
- Clases: duración y precio de cada tarjeta, y el texto de equipación.
- Profesor: años, idiomas y las cuatro certificaciones. Sustituir el sprite por una foto real si se quiere.
- Pueblo y pistas: nombre, descripción, ambiente, servicios y las cifras de la estación.
- Forfait y alquiler: textos, precios y ventajas de cada enlace.
- Contacto: usuario de Instagram.

- Teléfono `+34 600 000 000`, WhatsApp `34600000000` y email `hola@example.com`: buscar y reemplazar en los tres HTML.
- Nombre, años, idiomas y titulaciones del profesor. Los sellos (TD2, FAD...) son texto: cambiarlos por los logos oficiales.
- Datos de las zonas de la pista, remontes, cotas y horarios de temporada.
- Fotos reales: sustituir los SVG de `assets/img/hero-*.svg` y `clase-*.svg` por fotos (o un `<video autoplay muted loop playsinline>` en la portada) y actualizar sus `alt`.
- Rellenar los corchetes de `aviso-legal.html` y `privacidad.html`.
