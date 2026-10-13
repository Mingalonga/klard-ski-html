/* La Pista · mapa interactivo de Sierra Nevada (sin dependencias) */
(function () {
	'use strict';

	var mapa = document.querySelector('[data-lp-mapa]');
	if (!mapa) return;

	var NS = 'http://www.w3.org/2000/svg';
	var NIVELES = { verde: 'Verde', azul: 'Azul', roja: 'Roja', negra: 'Negra' };
	var COLORES = { verde: '#3cb54a', azul: '#1e7fc4', roja: '#e33e33', negra: '#1a1a1a' };

	// Respaldo mínimo por si no se puede cargar el JSON (por ejemplo, al abrir el archivo sin servidor)
	var RESPALDO = [
		{ id: 'fuente-del-tesoro', nombre: 'Fuente del Tesoro', dificultad: 'negra', zona: 'Loma de Dílar', longitud: null, desnivel: null, frase: 'Solo expertos. Nieve dura frecuente.', trazado: 'M930 250 C 900 320, 960 380, 880 450' },
		{ id: 'neveros', nombre: 'Neveros', dificultad: 'negra', zona: 'Loma de Dílar', longitud: null, desnivel: null, frase: 'Corta e intensa. Solo con buena técnica.', trazado: 'M1005 265 C 1015 330, 980 380, 1010 440' },
		{ id: 'olimpica', nombre: 'Olímpica', dificultad: 'roja', zona: 'Laguna de las Yeguas', longitud: 3500, desnivel: null, frase: 'Ancha y rápida, para pulir el carving.', trazado: 'M640 150 C 610 210, 680 250, 640 300' },
		{ id: 'aguila', nombre: 'Águila', dificultad: 'roja', zona: 'Veleta', longitud: 6000, desnivel: 1200, frase: 'La más larga de la estación.', trazado: 'M300 120 C 330 220, 250 290, 320 370 S 430 520, 520 615' },
		{ id: 'el-rio', nombre: 'El Río', dificultad: 'azul', zona: 'Río', longitud: null, desnivel: null, frase: 'La bajada tranquila hasta el pueblo.', trazado: 'M610 370 C 570 430, 650 500, 590 560 S 560 610, 565 628' },
		{ id: 'maribel', nombre: 'Maribel', dificultad: 'roja', zona: 'Borreguiles', longitud: null, desnivel: null, frase: 'El paso siguiente tras las azules.', trazado: 'M520 330 C 480 400, 530 460, 470 525' },
		{ id: 'zorro', nombre: 'Zorro', dificultad: 'azul', zona: 'Borreguiles', longitud: null, desnivel: null, frase: 'Suave y con curvas.', trazado: 'M540 285 C 580 310, 620 290, 660 315' },
		{ id: 'principiantes', nombre: 'Principiantes', dificultad: 'verde', zona: 'Borreguiles', longitud: null, desnivel: null, frase: 'Casi llana y con cintas.', trazado: 'M560 345 C 600 365, 640 352, 690 375' }
	];

	var capaPistas = mapa.querySelector('[data-lp-pistas]');
	var tooltip = mapa.querySelector('[data-lp-tooltip]');
	var lista = document.querySelector('[data-lp-lista]');
	var panel = document.querySelector('[data-lp-panel]');
	var titulo = panel.querySelector('.lp__panel-titulo');
	var filtros = document.querySelectorAll('.lp__filtro');
	var capas = mapa.querySelectorAll('[data-profundidad]');
	var reducido = window.matchMedia('(prefers-reduced-motion: reduce)');
	var estrecho = window.matchMedia('(max-width: 639px)');
	var pistas = [];
	var abierta = null;

	function metros(m) { return m ? m.toLocaleString('es-ES') + ' m' : 'Sin dato'; }
	function descripcion(p) {
		return p.nombre + '. Pista ' + p.dificultad + ', zona ' + p.zona + '. Longitud: ' + metros(p.longitud) +
			'. Desnivel: ' + metros(p.desnivel) + '. ' + p.frase;
	}

	/* ---------- Pintar las pistas a partir de los datos ---------- */
	function crearPath(clase, d) {
		var path = document.createElementNS(NS, 'path');
		path.setAttribute('class', clase);
		path.setAttribute('d', d);
		return path;
	}

	function pintar(datos) {
		pistas = datos;
		// Las negras al final para que queden por encima
		var orden = { verde: 0, azul: 1, roja: 2, negra: 3 };
		datos.slice().sort(function (a, b) { return orden[a.dificultad] - orden[b.dificultad]; }).forEach(function (p) {
			var g = document.createElementNS(NS, 'g');
			g.setAttribute('class', 'lp__pista');
			g.setAttribute('data-id', p.id);
			g.setAttribute('data-dificultad', p.dificultad);
			g.appendChild(crearPath('lp__borde', p.trazado));
			g.appendChild(crearPath('lp__trazo', p.trazado));
			var toque = crearPath('lp__zona-toque', p.trazado);
			toque.setAttribute('tabindex', '0');
			toque.setAttribute('role', 'button');
			toque.setAttribute('aria-label', 'Pista ' + p.nombre + ', ' + p.dificultad + ', zona ' + p.zona);
			toque.setAttribute('aria-describedby', 'lp-desc-' + p.id);
			g.appendChild(toque);
			capaPistas.appendChild(g);

			var li = document.createElement('li');
			li.id = 'lp-desc-' + p.id;
			li.textContent = descripcion(p);
			lista.appendChild(li);
		});
	}

	function buscar(el) {
		var g = el.closest && el.closest('.lp__pista');
		if (!g) return null;
		var id = g.getAttribute('data-id');
		return { g: g, datos: pistas.filter(function (p) { return p.id === id; })[0] };
	}

	/* ---------- Filtros por dificultad ---------- */
	function filtrar(nivel) {
		filtros.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filtro') === nivel)); });
		mapa.classList.toggle('tiene-filtro', nivel !== 'todas');
		capaPistas.querySelectorAll('.lp__pista').forEach(function (g) {
			g.classList.toggle('es-filtrada', g.getAttribute('data-dificultad') === nivel);
		});
	}
	filtros.forEach(function (b) {
		b.addEventListener('click', function () { filtrar(b.getAttribute('data-filtro')); });
	});

	/* ---------- Tooltip al pasar por encima ---------- */
	function mostrarTooltip(e, info) {
		if (estrecho.matches) return; // en móvil el panel hace de tooltip
		var r = mapa.getBoundingClientRect();
		tooltip.innerHTML = '';
		var nombre = document.createElement('strong');
		nombre.textContent = info.datos.nombre;
		tooltip.appendChild(nombre);
		tooltip.appendChild(document.createTextNode(NIVELES[info.datos.dificultad] + ' · ' + info.datos.zona));
		tooltip.style.left = (e.clientX - r.left) + 'px';
		tooltip.style.top = (e.clientY - r.top) + 'px';
		tooltip.hidden = false;
	}
	capaPistas.addEventListener('pointermove', function (e) {
		var info = buscar(e.target);
		if (info && e.pointerType === 'mouse') mostrarTooltip(e, info); else tooltip.hidden = true;
	});
	capaPistas.addEventListener('pointerleave', function () { tooltip.hidden = true; });

	/* ---------- Panel con la ficha ---------- */
	function abrir(info) {
		if (abierta) abierta.g.classList.remove('es-abierta');
		abierta = info;
		var p = info.datos;
		info.g.classList.add('es-abierta');
		panel.style.setProperty('--lp-color', COLORES[p.dificultad]);
		panel.querySelector('[data-lp-nivel]').textContent = 'Pista ' + NIVELES[p.dificultad].toLowerCase();
		titulo.textContent = p.nombre;
		panel.querySelector('[data-lp-frase]').textContent = p.frase;
		panel.querySelector('[data-lp-zona]').textContent = p.zona;
		panel.querySelector('[data-lp-longitud]').textContent = metros(p.longitud);
		panel.querySelector('[data-lp-desnivel]').textContent = metros(p.desnivel);
		panel.hidden = false;
		tooltip.hidden = true;
		titulo.focus({ preventScroll: true });
	}
	function cerrar() {
		if (!abierta) return;
		panel.hidden = true;
		abierta.g.classList.remove('es-abierta');
		var toque = abierta.g.querySelector('.lp__zona-toque');
		abierta = null;
		toque.focus({ preventScroll: true });
	}

	capaPistas.addEventListener('click', function (e) {
		var info = buscar(e.target);
		if (info) abrir(info);
	});
	capaPistas.addEventListener('keydown', function (e) {
		if (e.key !== 'Enter' && e.key !== ' ') return;
		var info = buscar(e.target);
		if (info) { e.preventDefault(); abrir(info); }
	});
	panel.querySelector('[data-lp-cerrar]').addEventListener('click', cerrar);
	document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });

	/* ---------- Parallax suave con el ratón (solo escritorio) ---------- */
	mapa.addEventListener('pointermove', function (e) {
		if (reducido.matches || estrecho.matches || e.pointerType !== 'mouse') return;
		var r = mapa.getBoundingClientRect();
		var x = (e.clientX - r.left) / r.width - 0.5;
		var y = (e.clientY - r.top) / r.height - 0.5;
		capas.forEach(function (c) {
			var f = Number(c.getAttribute('data-profundidad')) * 18;
			c.style.transform = 'translate(' + (-x * f).toFixed(1) + 'px, ' + (-y * f * 0.5).toFixed(1) + 'px)';
		});
	});
	mapa.addEventListener('pointerleave', function () {
		capas.forEach(function (c) { c.style.transform = ''; });
	});

	// En móvil el mapa se desliza: empezamos centrados en Borreguiles
	if (estrecho.matches) mapa.scrollLeft = (mapa.scrollWidth - mapa.clientWidth) / 2;

	/* ---------- Carga de datos ---------- */
	fetch('data/pistas-sierra-nevada.json')
		.then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
		.then(function (json) { pintar(json.pistas); })
		.catch(function () { pintar(RESPALDO); });
})();
