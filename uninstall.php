<?php
/**
 * Remove plugin data on uninstall.
 *
 * @package GBMI_Calculator
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'GBMI_Calc_Widget' );

// Remove the widget instances stored by WP_Widget.
delete_option( 'widget_gbmi_calc_widget' );
