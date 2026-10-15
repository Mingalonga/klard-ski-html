/* Klard Ski · interacciones (sin dependencias) */
(function () {
	'use strict';

	// Compatibles con Safari antiguo: NodeList sin forEach y MediaQueryList sin addEventListener
	function cada(lista, fn) { Array.prototype.forEach.call(lista, fn); }
	function alCambiar(mq, fn) {
		if (mq.addEventListener) mq.addEventListener('change', fn);
		else if (mq.addListener) mq.addListener(fn);
	}

	var mqReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
	var reducido = mqReducido.matches;
	// Mismo corte que styles.css para la ficha de la pista
	var estrecho = window.matchMedia('(max-width: 900px)');

	var cabecera = document.querySelector('[data-cabecera]');
	var barra = document.querySelector('[data-barra]');
	var hero = document.getElementById('inicio');
	var contacto = document.getElementById('contacto');

	// Medidas que solo cambian al redimensionar: se leen en medir(), no en cada frame
	var m = { vh: 0, cabH: 0, finHero: 0 };
	var MARGEN_CABECERA = 80; // la cabecera se vuelve sólida un poco antes de que acabe la portada

	/* ---------- Menú en móvil ---------- */
	var menuBoton = document.querySelector('[data-menu-boton]');

	function abrirMenu(abrir) {
		menuBoton.setAttribute('aria-expanded', String(abrir));
		cabecera.classList.toggle('menu-abierto', abrir);
	}
	if (menuBoton) {
		menuBoton.addEventListener('click', function () {
			abrirMenu(menuBoton.getAttribute('aria-expanded') !== 'true');
		});
		cabecera.querySelector('.menu').addEventListener('click', function (e) {
			if (e.target.closest('a')) abrirMenu(false);
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && menuBoton.getAttribute('aria-expanded') === 'true') {
				abrirMenu(false);
				menuBoton.focus();
			}
		});
	}

	/* ---------- Cabecera sólida y barra de llamada al salir de la portada ---------- */
	var cabeceraSolida = false;
	var barraVisible = false;

	function alHacerScroll(y, contactoArriba) {
		var solida = y > m.finHero;
		if (solida !== cabeceraSolida) { cabeceraSolida = solida; cabecera.classList.toggle('es-solida', solida); }
		if (!barra) return;
		// En «Contacto» ya está el teléfono en grande: se oculta para no repetirlo
		var visible = solida && contactoArriba >= m.vh * 0.8;
		if (visible !== barraVisible) { barraVisible = visible; barra.classList.toggle('es-visible', visible); }
	}

	/* ---------- 1. Carrusel de la portada ---------- */
	var carrusel = document.querySelector('[data-carrusel]');
	var slides = carrusel.querySelectorAll('.hero__slide');
	var puntos = hero.querySelectorAll('[data-punto]');
	var pausa = hero.querySelector('[data-pausa]');
	var actual = 0;
	var temporizador = null;
	var pausadoPorUsuario = false;
	var heroALaVista = true;

	// Las fotos 2 y 3 llevan data-src: se descargan después de la carga, sin competir con la primera
	function cargar(img) {
		var src = img.getAttribute('data-src');
		if (src) { img.src = src; img.removeAttribute('data-src'); }
	}
	function ir(n) {
		slides[actual].classList.remove('es-activa');
		puntos[actual].classList.remove('es-activo');
		puntos[actual].removeAttribute('aria-current');
		actual = (n + slides.length) % slides.length;
		cargar(slides[actual].querySelector('img'));
		slides[actual].classList.add('es-activa');
		puntos[actual].classList.add('es-activo');
		puntos[actual].setAttribute('aria-current', 'true');
	}
	function arrancar() { parar(); temporizador = setInterval(function () { ir(actual + 1); }, 6000); }
	function parar() { clearInterval(temporizador); temporizador = null; }

	// Solo pasa fotos si nadie lo ha pausado, la portada se ve y la pestaña está activa
	function decidirCarrusel() {
		var debe = !pausadoPorUsuario && heroALaVista && !document.hidden;
		if (debe && !temporizador) arrancar();
		else if (!debe && temporizador) parar();
	}
	// La pausa también congela el zoom lento de la foto (.es-pausado en styles.css)
	function ponerPausa(pausado) {
		pausadoPorUsuario = pausado;
		if (pausado) pausa.setAttribute('data-pausado', '');
		else pausa.removeAttribute('data-pausado');
		pausa.querySelector('.pausa__texto').textContent = pausado ? 'Reanudar fotos' : 'Pausar fotos';
		hero.classList.toggle('es-pausado', pausado);
		decidirCarrusel();
	}

	cada(puntos, function (p, i) {
		p.addEventListener('click', function () { ir(i); if (temporizador) arrancar(); });
	});
	pausa.addEventListener('click', function () { ponerPausa(!pausadoPorUsuario); });
	document.addEventListener('visibilitychange', decidirCarrusel);
	if ('IntersectionObserver' in window) {
		new IntersectionObserver(function (entradas) {
			heroALaVista = entradas[0].isIntersecting;
			decidirCarrusel();
		}).observe(hero);
	}
	window.addEventListener('load', function () {
		cada(carrusel.querySelectorAll('img[data-src]'), cargar);
	});
	ponerPausa(reducido);

	/* ---------- Aparición al hacer scroll ---------- */
	var aparecen = document.querySelectorAll('.aparece');
	if ('IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (entradas) {
			entradas.forEach(function (e) {
				if (e.isIntersecting) { e.target.classList.add('es-visible'); io.unobserve(e.target); }
			});
		}, { rootMargin: '0px 0px -10% 0px' });
		cada(aparecen, function (el) { io.observe(el); });
	} else {
		cada(aparecen, function (el) { el.classList.add('es-visible'); });
	}

	/* ---------- 3. Frases que cambian sobre el fondo fijo ---------- */
	var lema = document.querySelector('[data-lema]');
	var frases = lema.querySelectorAll('.lema__frase');
	var marcas = lema.querySelectorAll('.lema__progreso span');
	var fondoLema = lema.querySelector('.lema__fondo');
	var fraseActual = -1;
	var zoomActual = '';

	function actualizarLema(caja) {
		if (reducido || caja.bottom < 0 || caja.top > m.vh) return;
		var recorrido = caja.height - m.vh;
		var avance = Math.min(1, Math.max(0, -caja.top / recorrido));
		var zoom = (1.15 - avance * 0.12).toFixed(3);
		if (zoom !== zoomActual) { zoomActual = zoom; fondoLema.style.setProperty('--zoom', zoom); }
		var i = Math.min(frases.length - 1, Math.floor(avance * frases.length));
		if (i === fraseActual) return;
		fraseActual = i;
		cada(frases, function (f, n) {
			f.classList.toggle('es-activa', n === i);
			f.classList.toggle('es-pasada', n < i);
		});
		cada(marcas, function (mk, n) { mk.classList.toggle('es-activa', n <= i); });
	}

	/* ---------- 4. Ficha técnica de la pista ---------- */
	var anatomia = document.querySelector('[data-anatomia]');
	var monte = anatomia.querySelector('.anatomia__monte');
	var fichas = anatomia.querySelectorAll('.ficha-pista');
	var partes = anatomia.querySelectorAll('.anatomia__trazo, .anatomia__guia, .anatomia__punto');
	var TODAS = -2;
	var pistaActual = -1;

	// Ficha, trazo, guía y punto de cada pista se emparejan por data-n, no por su orden en el HTML
	function numero(el) { return Number(el.getAttribute('data-n')); }
	function activarPista(i) {
		if (i === pistaActual) return;
		pistaActual = i;
		cada(fichas, function (f) { f.classList.toggle('es-activa', i === TODAS || numero(f) === i); });
		cada(partes, function (p) { p.classList.toggle('es-activa', i === TODAS || numero(p) === i); });
	}

	function encuadrarMonte() {
		// En móvil solo se ve el monte, sin las fichas a los lados
		monte.setAttribute('viewBox', estrecho.matches ? '430 70 740 830' : '0 0 1600 900');
	}
	encuadrarMonte();

	function actualizarPista(caja, cajasFichas) {
		// Con movimiento reducido se ven todas a la vez
		if (reducido) { activarPista(TODAS); return; }
		if (caja.bottom < 0 || caja.top > m.vh) return;
		if (cajasFichas) {
			// La ficha más cercana a la mitad inferior de la pantalla manda
			var objetivo = m.vh * 0.7;
			var mejor = 0, distancia = Infinity;
			cajasFichas.forEach(function (r, n) {
				var d = Math.abs(r.top + r.height / 2 - objetivo);
				if (d < distancia) { distancia = d; mejor = numero(fichas[n]); }
			});
			activarPista(mejor);
			return;
		}
		// El monte queda fijo bajo la cabecera (sticky en top: --cab-h)
		var recorrido = caja.height - m.vh + m.cabH;
		var avance = Math.min(0.999, Math.max(0, (m.cabH - caja.top) / recorrido));
		activarPista(numero(fichas[Math.floor(avance * fichas.length)]));
	}

	/* ---------- Enlaces de referido y parte de nieve (assets/js/config.js) ---------- */
	var config = window.KLARD_CONFIG || { enlaces: {}, mapa: {} };

	function rellenado(valor) {
		// Un valor sigue siendo placeholder mientras esté vacío o lleve corchetes
		return typeof valor === 'string' && valor !== '' && valor.indexOf('[') === -1;
	}

	cada(document.querySelectorAll('[data-enlace]'), function (a) {
		var clave = a.getAttribute('data-enlace');
		var url = config.enlaces[clave];
		if (rellenado(url)) {
			a.href = url;
		} else {
			// Mientras falte el enlace, el botón se queda en su sección y no abre otra pestaña
			a.removeAttribute('target');
			var aviso = a.querySelector('.nueva-pestana');
			if (aviso) aviso.parentNode.removeChild(aviso);
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
	function medir() {
		m.vh = window.innerHeight;
		m.cabH = cabecera.offsetHeight;
		m.finHero = hero.offsetHeight - MARGEN_CABECERA;
	}

	var pendiente = false;
	var hayQueMedir = true;

	// Primero todas las lecturas de layout y después todas las escrituras, para no forzar recálculos
	function tick() {
		pendiente = false;
		if (hayQueMedir) { hayQueMedir = false; medir(); }

		var y = window.pageYOffset;
		var contactoArriba = contacto.getBoundingClientRect().top;
		var rLema = lema.getBoundingClientRect();
		var rAnatomia = anatomia.getBoundingClientRect();
		var rFichas = null;
		if (estrecho.matches && !reducido && rAnatomia.bottom > 0 && rAnatomia.top < m.vh) {
			rFichas = Array.prototype.map.call(fichas, function (f) { return f.getBoundingClientRect(); });
		}

		alHacerScroll(y, contactoArriba);
		actualizarLema(rLema);
		actualizarPista(rAnatomia, rFichas);
	}
	function programar() {
		if (!pendiente) { pendiente = true; requestAnimationFrame(tick); }
	}
	function remedir() { hayQueMedir = true; programar(); }

	alCambiar(estrecho, function () { encuadrarMonte(); pistaActual = -1; remedir(); });
	alCambiar(mqReducido, function (e) {
		reducido = e.matches;
		if (reducido) ponerPausa(true);
		fraseActual = -1;
		pistaActual = -1;
		remedir();
	});

	window.addEventListener('scroll', programar, { passive: true });
	window.addEventListener('resize', remedir);
	window.addEventListener('load', remedir);
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(remedir);
	tick();
})();
