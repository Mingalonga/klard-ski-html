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

	/* ---------- 2. Parallax de las tarjetas de clases ---------- */
	// Cada columna sube a una velocidad distinta y la foto de dentro va más lenta que la tarjeta
	var tarjetas = document.querySelectorAll('.tarjeta');
	var unaColumna = window.matchMedia('(max-width: 1000px)');
	var VELOCIDADES = [0.08, 0.2, 0.32];

	function actualizarTarjetas() {
		if (reducido) return;
		var vh = window.innerHeight;
		tarjetas.forEach(function (t, i) {
			var r = t.getBoundingClientRect();
			// Distancia del centro de la tarjeta al centro de la pantalla, sin el desplazamiento ya aplicado
			var py = parseFloat(t.style.getPropertyValue('--py')) || 0;
			var d = r.top - py + r.height / 2 - vh / 2;
			if (Math.abs(d) > vh * 1.5) return;
			var v = unaColumna.matches ? 0.06 : VELOCIDADES[i % 3];
			t.style.setProperty('--py', Math.max(-160, Math.min(160, d * v)).toFixed(1) + 'px');
			t.style.setProperty('--iy', (d * -0.06).toFixed(1) + 'px');
		});
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
		actualizarTarjetas();
		actualizarLema();
		actualizarPista();
	}
	window.addEventListener('scroll', function () {
		if (!pendiente) { pendiente = true; requestAnimationFrame(tick); }
	}, { passive: true });
	window.addEventListener('resize', tick);
	tick();
})();
