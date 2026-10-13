/* Klard Ski · interacciones (sin dependencias) */
(function () {
	'use strict';

	var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var movil = window.matchMedia('(max-width: 760px)');

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

	/* ---------- 4. Mapa pseudo-3D de la pista ---------- */
	var mapa = document.querySelector('[data-mapa]');
	var escena = mapa.querySelector('[data-escena]');
	var pines = mapa.querySelectorAll('.pin');
	var zonas = document.querySelectorAll('.zona');
	var trazos = mapa.querySelectorAll('.trazo');
	var tiltPuntero = { x: 0, y: 0 };

	function seleccionar(id) {
		var yaActiva = mapa.dataset.sel === id;
		var nueva = yaActiva ? '' : id;
		mapa.dataset.sel = nueva;
		mapa.classList.toggle('tiene-sel', !!nueva);
		pines.forEach(function (p) { p.setAttribute('aria-expanded', String(p.dataset.zona === nueva)); });
		trazos.forEach(function (t) { t.classList.toggle('es-activo', t.dataset.zona === nueva); });
		zonas.forEach(function (z) { z.classList.toggle('es-activa', z.dataset.zona === nueva); });
	}
	pines.forEach(function (p) {
		p.setAttribute('aria-expanded', 'false');
		p.addEventListener('click', function () {
			seleccionar(p.dataset.zona);
			// En móvil la ficha de texto queda debajo del mapa: la acercamos
			if (movil.matches && mapa.dataset.sel) {
				document.getElementById('zona-' + p.dataset.zona).scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'center' });
			}
		});
	});
	zonas.forEach(function (z) {
		z.addEventListener('mouseenter', function () { if (mapa.dataset.sel !== z.dataset.zona) seleccionar(z.dataset.zona); });
	});

	// Inclinación con el ratón (solo escritorio)
	mapa.addEventListener('pointermove', function (e) {
		if (reducido || e.pointerType !== 'mouse') return;
		var r = mapa.getBoundingClientRect();
		tiltPuntero.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
		tiltPuntero.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
		actualizarMapa();
	});
	mapa.addEventListener('pointerleave', function () { tiltPuntero.x = tiltPuntero.y = 0; actualizarMapa(); });

	function actualizarMapa() {
		if (reducido) return;
		var r = mapa.getBoundingClientRect();
		var vh = window.innerHeight;
		// -1 al entrar por abajo, 1 al salir por arriba
		var p = Math.min(1, Math.max(-1, ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2)));
		var fuerza = movil.matches ? 0.5 : 1;
		escena.style.setProperty('--rx', (p * 14 * fuerza - tiltPuntero.y * 5).toFixed(2) + 'deg');
		escena.style.setProperty('--ry', (tiltPuntero.x * 8).toFixed(2) + 'deg');
		escena.style.setProperty('--ky', (p * 60).toFixed(1) + 'px');
		escena.style.setProperty('--kr', (p * -12).toFixed(1) + 'deg');
	}

	/* ---------- Bucle de scroll ---------- */
	var pendiente = false;
	function tick() {
		pendiente = false;
		alHacerScroll();
		actualizarLema();
		actualizarMapa();
	}
	window.addEventListener('scroll', function () {
		if (!pendiente) { pendiente = true; requestAnimationFrame(tick); }
	}, { passive: true });
	window.addEventListener('resize', tick);
	tick();
})();
