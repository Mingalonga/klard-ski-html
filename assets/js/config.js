/*
 * Klard Ski · configuración
 *
 * Único sitio donde se cambian los enlaces externos que pueden variar:
 * los enlaces de referido (afiliado) y la ubicación del mapa.
 * Sustituye cada valor entre [CORCHETES] por el real, con https:// delante.
 * Mientras un valor siga entre corchetes, el botón apunta a su propia sección
 * y en la consola del navegador sale un aviso.
 */
window.KLARD_CONFIG = {
	enlaces: {
		// Sección «Forfait y alquiler»
		forfait: '[ENLACE_REFERIDO_FORFAIT]',
		alquiler: '[ENLACE_REFERIDO_ALQUILER]',
		// Sección «El pueblo y las pistas»: parte de nieve oficial de la estación
		parteNieve: '[ENLACE_PARTE_NIEVE]'
	},
	mapa: {
		// Lo que escribirías en el buscador de Google Maps, p. ej. «Plaza de Andalucía, Pradollano, Sierra Nevada»
		ubicacion: '[UBICACIÓN_GOOGLE_MAPS]',
		zoom: 14
	}
};
