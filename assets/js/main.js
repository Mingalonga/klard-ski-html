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

	/* ---------- Enlaces de referido y parte de nieve (assets/js/config.js) ---------- */
	var config = window.KLARD_CONFIG || { enlaces: {}, mapa: {} };

	function rellenado(valor) {
		// Un valor sigue siendo placeholder mientras esté vacío o lleve corchetes
		return typeof valor === 'string' && valor !== '' && valor.indexOf('[') === -1;
	}

	document.querySelectorAll('[data-enlace]').forEach(function (a) {
		var clave = a.getAttribute('data-enlace');
		var url = config.enlaces[clave];
		if (rellenado(url)) {
			a.href = url;
		} else {
			// Mientras falte el enlace, el botón se queda en su sección y no abre otra pestaña
			a.removeAttribute('target');
			if (window.console) console.warn('Klard Ski: falta el enlace «' + clave + '» en assets/js/config.js');
		}
	});

	/* ---------- Mapa del pueblo: Google Maps se carga solo al pulsar ---------- */
	var mapa = document.querySelector('[data-mapa]');
	if (mapa) {
		var ubicacion = config.mapa && config.mapa.ubicacion;
		var consulta = encodeURIComponent(rellenado(ubicacion) ? ubicacion : '');
		var enlaceMapa = mapa.querySelector('[data-mapa-enlace]');
		var botonMapa = mapa.querySelector('[data-mapa-cargar]');

		if (rellenado(ubicacion)) {
			enlaceMapa.href = 'https://www.google.com/maps/search/?api=1&query=' + consulta;
		} else {
			// Sin ubicación todavía: el botón no tendría nada que mostrar
			botonMapa.disabled = true;
			botonMapa.textContent = 'Falta la ubicación';
			enlaceMapa.hidden = true;
		}

		botonMapa.addEventListener('click', function () {
			var iframe = document.createElement('iframe');
			iframe.className = 'mapa__iframe';
			iframe.src = 'https://maps.google.com/maps?q=' + consulta + '&z=' + (config.mapa.zoom || 14) + '&output=embed';
			iframe.title = 'Mapa de la ubicación en Google Maps';
			iframe.loading = 'lazy';
			iframe.referrerPolicy = 'no-referrer-when-downgrade';
			iframe.setAttribute('allowfullscreen', '');
			mapa.querySelector('[data-mapa-aviso]').hidden = true;
			mapa.appendChild(iframe);
			mapa.classList.add('es-cargado');
		});
	}

	/* ---------- Bucle de scroll ---------- */
	var pendiente = false;
	function tick() {
		pendiente = false;
		alHacerScroll();
		actualizarLema();
		actualizarPista();
	}
	window.addEventListener('scroll', function () {
		if (!pendiente) { pendiente = true; requestAnimationFrame(tick); }
	}, { passive: true });
	window.addEventListener('resize', tick);
	tick();
})();
