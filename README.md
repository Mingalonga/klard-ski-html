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
| `index.html` | La página: portada, clases, profesor, pista y pie |
| `aviso-legal.html`, `privacidad.html` | Textos legales mínimos (plantillas para rellenar) |
| `assets/css/styles.css` | Todos los estilos. Los colores están en `:root` |
| `assets/js/main.js` | Carrusel, frases con el scroll, ficha de la pista y barra de llamada en móvil |
| `assets/img/` | Ilustraciones provisionales y el sprite de Klard (`klard-salto.webp`) |
| `assets/fonts/` | Montserrat e Inter, servidas desde la propia web (sin Google Fonts ni cookies) |

## Secciones

1. **Portada**: carrusel de tres fondos con zoom lento, titular, botón de llamada y «Ver las clases ↓». Se puede pausar.
2. **Las clases**: tres tarjetas (iniciación, perfeccionamiento, privadas) con duración, precio orientativo, a quién va dirigida y «Reservar por teléfono».
3. **Sobre el profesor**: fondo fijo con frases que cambian al hacer scroll, y después la ficha con el sprite de Klard, cifras y titulaciones.
4. **La pista**: ficha técnica al estilo «producto con puntos»: el monte en el centro y cada punto es una pista (negra, roja, azul, verde) con su ficha y una línea guía. Al hacer scroll se va iluminando una pista tras otra; en móvil el monte queda fijo arriba y las fichas pasan por debajo. Cierra con «¿Quieres esquiar aquí? Llámame».
5. **Pie**: teléfono grande, WhatsApp, email, zona con Google Maps, temporada, redes y enlaces legales.

En móvil aparece una barra fija «Llamar para reservar» al salir de la portada. Con «reducir movimiento» activado en el sistema, todo se muestra sin animaciones.

## Pendiente antes de publicar (datos de relleno)

- Teléfono `+34 600 000 000`, WhatsApp `34600000000` y email `hola@example.com`: buscar y reemplazar en los tres HTML.
- Nombre, años, idiomas y titulaciones del profesor. Los sellos (TD2, FAD...) son texto: cambiarlos por los logos oficiales.
- Datos de las zonas de la pista, remontes, cotas y horarios de temporada.
- Foto de fondo de «Hola, soy Klard»: guardar una foto horizontal de montaña o pista nevada como `assets/img/ladera-foto.jpg` (unos 2000 px de ancho, menos de 400 KB). Si no existe, se usa la ilustración.
- Fotos reales: sustituir los SVG de `assets/img/hero-*.svg` y `clase-*.svg` por fotos (o un `<video autoplay muted loop playsinline>` en la portada) y actualizar sus `alt`.
- Rellenar los corchetes de `aviso-legal.html` y `privacidad.html`.
