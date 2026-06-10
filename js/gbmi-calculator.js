/**
 * Front-end controller for the BMI calculator.
 *
 * Initialises every .gbmi-calc instance on the page independently: each gets
 * its own tabs, event handlers and result region, so any number of shortcodes
 * and widgets can share a page. Shared translations come from the global
 * window.GBMI_i18n (printed once); the unit system is read per instance from
 * the wrapper's data-standard attribute. The child calculation lives in the
 * separate GBMIChild module (js/child.js).
 */
( function ( $ ) {
	'use strict';

	var i18n = window.GBMI_i18n || { adult: {}, child: {} };

	// Read a numeric field, treating blank/garbage values as 0.
	function num( $el ) {
		var v = parseFloat( $el.val() );
		return isNaN( v ) ? 0 : v;
	}

	// Minimal sprintf for "%1$s" style placeholders in the localized templates.
	function format( tmpl, args ) {
		return String( tmpl ).replace( /%(\d+)\$s/g, function ( match, n ) {
			return args[ n - 1 ];
		} );
	}

	// WHO adult BMI category, by sex.
	function adultCategory( t, gender, bmi ) {
		if ( 'Female' === gender ) {
			if ( bmi < 12 ) { return t.severly_underweight; }
			if ( bmi < 19 ) { return t.underweight; }
			if ( bmi < 24 ) { return t.normal; }
			if ( bmi < 30 ) { return t.overweight; }
			if ( bmi < 35 ) { return t.moderately_obese; }
			return t.severly_obese;
		}

		// Default to the male ranges.
		if ( bmi < 12 ) { return t.severly_underweight; }
		if ( bmi < 20 ) { return t.underweight; }
		if ( bmi < 25 ) { return t.normal; }
		if ( bmi < 30 ) { return t.overweight; }
		if ( bmi < 35 ) { return t.moderately_obese; }
		return t.severly_obese;
	}

	function initInstance( root ) {
		var $root = $( root );
		var standard = ( 'metric' === $root.attr( 'data-standard' ) ) ? 'metric' : 'standard';
		var ta = i18n.adult || {};
		var $result = $root.find( '.gbmi-result' );
		var $childResult = $root.find( '.gbmi-child-result' );

		function computeAdult() {
			var height = 0;
			var weight = 0;

			if ( 'standard' === standard ) {
				height = num( $root.find( '.gbmi-height' ) ) * 12 + num( $root.find( '.gbmi-inches' ) ); // inches
				weight = num( $root.find( '.gbmi-weight' ) ) * 703;
			} else {
				height = num( $root.find( '.gbmi-height' ) ) / 100; // metres
				weight = num( $root.find( '.gbmi-weight' ) );       // kilograms
			}

			var bmi = Math.round( weight / Math.pow( height, 2 ) * 10 ) / 10;

			// Reject empty/zero/negative/non-finite input instead of a bogus category.
			if ( height <= 0 || weight <= 0 || ! isFinite( bmi ) || bmi <= 0 ) {
				$childResult.hide().fadeOut();
				$result.hide().text( ta.invalid ).fadeIn();
				return;
			}

			var gender = $root.find( '.gbmi-gender' ).val();
			var cat = adultCategory( ta, gender, bmi );
			$childResult.hide().fadeOut();
			$result.hide().text( format( ta.result, [ bmi, cat ] ) ).fadeIn();
		}

		$root.find( '.gbmi-submit' ).on( 'click', computeAdult );
		$root.find( '.gbmi-gender' ).on( 'change', computeAdult );

		// Child calculator (separate module, also instance-scoped).
		if ( window.GBMIChild ) {
			window.GBMIChild.init( $root, i18n.child || {} );
		}

		// Initialise the tabs last; never let a tab error block the calculator.
		try {
			if ( $.fn.tabs ) {
				$root.tabs();
			}
		} catch ( e ) {} // eslint-disable-line no-empty
	}

	$( function () {
		$( '.gbmi-calc' ).each( function () {
			initInstance( this );
		} );
	} );
} )( jQuery );
