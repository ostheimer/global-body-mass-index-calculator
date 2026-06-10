<?php
/**
 * Plugin Name:       Global Body Mass Index Calculator
 * Plugin URI:        https://www.ostheimer.at/global-body-mass-index-calculator-wordpress-plugin/
 * Description:       BMI calculator for adults and children, available as a widget and via the [gbmicalc] shortcode, with a localizable, colour-customisable interface.
 * Version:           1.3
 * Requires at least: 5.7
 * Requires PHP:      7.2
 * Author:            helpstring
 * Author URI:        https://www.ostheimer.at/
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       global-body-mass-index-calculator
 * Domain Path:       /languages
 *
 * @package GBMI_Calculator
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

define( 'GBMI_CALC_VERSION', '1.3' );
define( 'GBMI_CALC_FILE', __FILE__ );
define( 'GBMI_CALC_DIR', plugin_dir_path( __FILE__ ) );
define( 'GBMI_CALC_URL', plugin_dir_url( __FILE__ ) );
define( 'GBMI_CALC_OPTION', 'GBMI_Calc_Widget' );

require_once GBMI_CALC_DIR . 'includes/class-gbmi-calculator.php';
require_once GBMI_CALC_DIR . 'includes/class-gbmi-calc-widget.php';

register_activation_hook( __FILE__, array( 'GBMI_Calculator', 'activate' ) );

GBMI_Calculator::init();
