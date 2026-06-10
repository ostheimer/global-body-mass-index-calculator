/**
 * Initialise the WordPress colour picker on the plugin's colour fields, both
 * on the settings page and for widgets (including widgets added via AJAX).
 */
( function ( $ ) {
	'use strict';

	function init( context ) {
		$( '.gbmi-color-field', context ).wpColorPicker();
	}

	$( function () {
		init( document );
	} );

	$( document ).on( 'widget-added widget-updated', function ( event, widget ) {
		init( widget );
	} );
} )( jQuery );
