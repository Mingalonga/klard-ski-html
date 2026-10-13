/* Klard Ski · interacciones (sin dependencias) */
(function () {
	'use strict';

	var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------- Cabecera sólida y barra de llamada al salir de la portada ---------- */
	var cabecera = document.querySelector('[data-cabecera]');
	var barra = document.querySelector('[data-barra]');
	var hero = document.getElementById('inicio');
	var pie = document.getElementById('contacto');

	function alHacerScroll() {
		var y = window.scrollY;
		var finHero = hero.offsetHeight - 80;
		cabecera.classList.toggle('es-solida', y > finHero);
		if (barra) {
			// En el pie ya está el teléfono en grande: se oculta para no repetirlo
			var enPie = pie.getBoundingClientRect().top < window.innerHeight * 0.8;
			barra.classList.toggle('es-visible', y > finHero && !enPie);
		}
	}

	/* ---------- 1. Carrusel de la portada ---------- */
	var slides = document.querySelectorAll('.hero__slide');
	var puntos = document.querySelectorAll('.punto');
	var pausa = document.querySelector('[data-pausa]');
	var actual = 0;
	var temporizador = null;

	function ir(n) {
		slides[actual].classList.remove('es-activa');
		puntos[actual].classList.remove('es-activo');
		puntos[actual].removeAttribute('aria-current');
		actual = (n + slides.length) % slides.length;
		var img = slides[actual].querySelector('img');
		if (img.loading === 'lazy') img.loading = 'eager';
		slides[actual].classList.add('es-activa');
		puntos[actual].classList.add('es-activo');
		puntos[actual].setAttribute('aria-current', 'true');
	}
	function arrancar() { parar(); temporizador = setInterval(function () { ir(actual + 1); }, 6000); }
	function parar() { clearInterval(temporizador); temporizador = null; }

	puntos.forEach(function (p, i) {
		p.addEventListener('click', function () { ir(i); if (temporizador) arrancar(); });
	});
	pausa.addEventListener('click', function () {
		var pausado = pausa.getAttribute('aria-pressed') === 'true';
		pausa.setAttribute('aria-pressed', String(!pausado));
		pausa.querySelector('.pausa__texto').textContent = pausado ? 'Pausar fotos' : 'Reanudar fotos';
		pausado ? arrancar() : parar();
	});
	if (reducido) {
		pausa.setAttribute('aria-pressed', 'true');
		pausa.querySelector('.pausa__texto').textContent = 'Reanudar fotos';
	} else {
		arrancar();
	}

	/* ---------- Aparición al hacer scroll ---------- */
	var aparecen = document.querySelectorAll('.aparece');
	if ('IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (entradas) {
			entradas.forEach(function (e) {
				if (e.isIntersecting) { e.target.classList.add('es-visible'); io.unobserve(e.target); }
			});
		}, { rootMargin: '0px 0px -10% 0px' });
		aparecen.forEach(function (el) { io.observe(el); });
	} else {
		aparecen.forEach(function (el) { el.classList.add('es-visible'); });
	}

	/* ---------- 3. Frases que cambian sobre el fondo fijo ---------- */
	var lema = document.querySelector('[data-lema]');
	var frases = lema.querySelectorAll('.lema__frase');
	var marcas = lema.querySelectorAll('.lema__progreso span');
	var fondoLema = lema.querySelector('.lema__fondo');
	var fraseActual = -1;

	function actualizarLema() {
		if (reducido) return;
		var caja = lema.getBoundingClientRect();
		var recorrido = caja.height - window.innerHeight;
		var avance = Math.min(1, Math.max(0, -caja.top / recorrido));
		var i = Math.min(frases.length - 1, Math.floor(avance * frases.length));
		fondoLema.style.setProperty('--zoom', (1.15 - avance * 0.12).toFixed(3));
		if (i === fraseActual) return;
		fraseActual = i;
		frases.forEach(function (f, n) {
			f.classList.toggle('es-activa', n === i);
			f.classList.toggle('es-pasada', n < i);
		});
		marcas.forEach(function (m, n) { m.classList.toggle('es-activa', n <= i); });
	}

	/* ---------- 3b. Klard cruza la ficha de un salto ---------- */
	var ladera = document.querySelector('[data-ladera]');
	var klard = ladera.querySelector('[data-klard]');
	var hueco = ladera.querySelector('.ficha__hueco');
	var estrechoLadera = window.matchMedia('(max-width: 1000px)');
	var paradaKlard = null;
	var ultimoAvance = null;

	// Foto real de fondo: si existe assets/img/ladera-foto.jpg se usa; si no, queda la ilustración
	var foto = new Image();
	foto.onload = function () { ladera.classList.add('tiene-foto'); };
	foto.src = 'assets/img/ladera-foto.jpg';

	function actualizarKlard() {
		var r = ladera.getBoundingClientRect();
		var vh = window.innerHeight;
		var ancho = r.width;
		var alto = klard.offsetHeight;
		var movil = estrechoLadera.matches;
		if (movil) ladera.style.setProperty('--banda', (hueco.offsetTop + hueco.offsetHeight + 60) + 'px');

		// Despegue y aterrizaje (en px dentro de la sección). El punto de referencia son los esquís.
		var margen = klard.offsetWidth * 0.55;
		var x0 = margen, x1 = ancho - margen;
		var y0 = movil ? hueco.offsetTop + hueco.offsetHeight - 20 : r.height * 0.42;
		var y1 = y0 + (movil ? 30 : r.height * 0.12);
		var apice = vh * (movil ? 0.16 : 0.24); // altura del salto sobre la recta despegue-aterrizaje
		var recorrido = vh * (movil ? 0.5 : 0.65); // px de scroll que dura el salto

		// El salto empieza cuando Klard se ve entero en su punto de despegue (con los esquís por encima del borde inferior)
		var piesEnPantalla = r.top + y0 + alto * 0.35 + 8;
		// En móvil la barra fija de «Llamar» tapa el borde inferior
		var bordeInferior = movil ? vh - 76 : vh;
		var avance = (bordeInferior - piesEnPantalla) / recorrido;
		avance = Math.min(1, Math.max(0, avance));

		// Trayectoria de un salto: avance horizontal uniforme y parábola en vertical
		var x = x0 + (x1 - x0) * avance;
		var y = y0 + (y1 - y0) * avance - apice * 4 * avance * (1 - avance);
		// Inclinación según la dirección del movimiento en cada punto
		var dx = x1 - x0;
		var dy = (y1 - y0) - apice * 4 * (1 - 2 * avance);
		var giro = Math.atan2(dy, dx) * 180 / Math.PI * 0.6;

		klard.style.setProperty('--kx', x.toFixed(1) + 'px');
		klard.style.setProperty('--ky', y.toFixed(1) + 'px');
		klard.style.setProperty('--giro', giro.toFixed(1) + 'deg');

		if (reducido || ultimoAvance === null || Math.abs(avance - ultimoAvance) < 0.001 || avance === 0 || avance === 1) { ultimoAvance = avance; klard.classList.remove('en-marcha'); return; }
		ultimoAvance = avance;
		// En el aire se balancea un poco mientras se mueve
		klard.classList.add('en-marcha');
		clearTimeout(paradaKlard);
		paradaKlard = setTimeout(function () { klard.classList.remove('en-marcha'); }, 180);
	}

	/* ---------- 4. Ficha técnica de la pista ---------- */
	var anatomia = document.querySelector('[data-anatomia]');
	var monte = anatomia.querySelector('.anatomia__monte');
	var fichas = anatomia.querySelectorAll('.ficha-pista');
	var partes = anatomia.querySelectorAll('.anatomia__trazo, .anatomia__guia, .anatomia__punto');
	var estrecho = window.matchMedia('(max-width: 900px)');
	var pistaActual = -1;

	function activarPista(i) {
		if (i === pistaActual) return;
		pistaActual = i;
		fichas.forEach(function (f, n) { f.classList.toggle('es-activa', n === i); });
		partes.forEach(function (p) {
			var activo = Number(p.getAttribute('data-n')) === i;
			p.classList.toggle(p.classList.contains('anatomia__guia') ? 'es-activa' : 'es-activo', activo);
		});
	}

	function encuadrarMonte() {
		// En móvil solo se ve el monte, sin las fichas a los lados
		monte.setAttribute('viewBox', estrecho.matches ? '430 70 740 830' : '0 0 1600 900');
	}
	estrecho.addEventListener('change', function () { encuadrarMonte(); pistaActual = -1; tick(); });
	encuadrarMonte();

	function actualizarPista() {
		if (reducido) { activarPista(-1); fichas.forEach(function (f) { f.classList.add('es-activa'); }); return; }
		if (estrecho.matches) {
			// La ficha más cercana a la mitad inferior de la pantalla manda
			var objetivo = window.innerHeight * 0.7;
			var mejor = 0, distancia = Infinity;
			fichas.forEach(function (f, n) {
				var r = f.getBoundingClientRect();
				var d = Math.abs(r.top + r.height / 2 - objetivo);
				if (d < distancia) { distancia = d; mejor = n; }
			});
			activarPista(mejor);
			return;
		}
		var caja = anatomia.getBoundingClientRect();
		var recorrido = caja.height - window.innerHeight;
		var avance = Math.min(0.999, Math.max(0, -caja.top / recorrido));
		activarPista(Math.floor(avance * fichas.length));
	}

	/* ---------- Bucle de scroll ---------- */
	var pendiente = false;
	function tick() {
		pendiente = false;
		alHacerScroll();
		actualizarLema();
		actualizarKlard();
		actualizarPista();
	}
	window.addEventListener('scroll', function () {
		if (!pendiente) { pendiente = true; requestAnimationFrame(tick); }
	}, { passive: true });
	window.addEventListener('resize', tick);
	tick();
})();
