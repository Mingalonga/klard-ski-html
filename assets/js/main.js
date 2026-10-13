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

	/* ---------- Bucle de scroll ---------- */
	var pendiente = false;
	function tick() {
		pendiente = false;
		alHacerScroll();
		actualizarLema();
	}
	window.addEventListener('scroll', function () {
		if (!pendiente) { pendiente = true; requestAnimationFrame(tick); }
	}, { passive: true });
	window.addEventListener('resize', tick);
	tick();
})();
