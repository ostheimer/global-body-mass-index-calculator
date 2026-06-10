<?php
/**
 * Core plugin class: assets, shortcode, settings page and the shared renderer
 * used by both the widget and the [gbmicalc] shortcode.
 *
 * @package GBMI_Calculator
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

/**
 * Main controller for the Global Body Mass Index Calculator.
 */
class GBMI_Calculator {

	/**
	 * Page hook suffix of the settings screen, used to scope admin assets.
	 *
	 * @var string
	 */
	private static $settings_hook = '';

	/**
	 * Per-request counter used to give every calculator instance a unique id,
	 * so several calculators can live on one page without clashing.
	 *
	 * @var int
	 */
	private static $instance = 0;

	/**
	 * Whether the shared translation blob has already been printed this request.
	 *
	 * @var bool
	 */
	private static $i18n_printed = false;

	/**
	 * Wire up all hooks.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_shortcode' ) );
		add_action( 'widgets_init', array( __CLASS__, 'register_widget' ) );

		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'register_frontend_assets' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_admin_assets' ) );

		add_action( 'admin_menu', array( __CLASS__, 'add_settings_page' ) );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
	}

	/**
	 * Default settings.
	 *
	 * @return array
	 */
	public static function defaults() {
		return array(
			'title'        => __( 'BMI Calculator', 'global-body-mass-index-calculator' ),
			'standard'     => 'standard',
			'height'       => '',
			'width'        => '380',
			'bgcolor'      => '#ffffff',
			'bgendcolor'   => '#ffffff',
			'textcolor'    => '#000000',
			'tabcolor'     => '#e9e9e9',
			'currtabcolor' => '#ffffff',
			'accentcolor'  => '#246a9c',
			'allowLink'    => '',
		);
	}

	/**
	 * Saved (sanitized) settings merged over the defaults.
	 *
	 * @return array
	 */
	public static function get_settings() {
		$saved = get_option( GBMI_CALC_OPTION, array() );
		if ( ! is_array( $saved ) ) {
			$saved = array();
		}
		return wp_parse_args( $saved, self::defaults() );
	}

	/**
	 * Whitelist and sanitize a raw settings array (from the settings page,
	 * the widget form or shortcode attributes).
	 *
	 * @param array $input Raw values.
	 * @return array Sanitized values, limited to the known keys.
	 */
	public static function sanitize_settings( $input ) {
		$input  = is_array( $input ) ? $input : array();
		$output = self::defaults();

		if ( isset( $input['title'] ) ) {
			$output['title'] = sanitize_text_field( $input['title'] );
		}

		$output['standard'] = ( isset( $input['standard'] ) && 'metric' === $input['standard'] ) ? 'metric' : 'standard';

		foreach ( array( 'height', 'width' ) as $dim ) {
			if ( isset( $input[ $dim ] ) ) {
				$digits          = preg_replace( '/[^0-9]/', '', (string) $input[ $dim ] );
				$output[ $dim ]  = $digits;
			}
		}

		foreach ( array( 'bgcolor', 'bgendcolor', 'textcolor', 'tabcolor', 'currtabcolor', 'accentcolor' ) as $color ) {
			if ( isset( $input[ $color ] ) ) {
				$clean            = sanitize_hex_color( $input[ $color ] );
				$output[ $color ] = $clean ? $clean : self::defaults()[ $color ];
			}
		}

		$output['allowLink'] = ( isset( $input['allowLink'] ) && 'yes' === $input['allowLink'] ) ? 'yes' : '';

		return $output;
	}

	/**
	 * Colour option keys and their human labels, shared by the settings page
	 * and the widget form so the two stay in sync.
	 *
	 * @return array
	 */
	public static function color_fields() {
		return array(
			'bgcolor'      => __( 'Background (top)', 'global-body-mass-index-calculator' ),
			'bgendcolor'   => __( 'Background (bottom)', 'global-body-mass-index-calculator' ),
			'textcolor'    => __( 'Text', 'global-body-mass-index-calculator' ),
			'accentcolor'  => __( 'Button', 'global-body-mass-index-calculator' ),
			'tabcolor'     => __( 'Inactive tab', 'global-body-mass-index-calculator' ),
			'currtabcolor' => __( 'Active tab', 'global-body-mass-index-calculator' ),
		);
	}

	/* --------------------------------------------------------------------- *
	 * Assets
	 * --------------------------------------------------------------------- */

	/**
	 * Register (but do not enqueue) the front-end assets. They are enqueued
	 * on demand from self::render() so they only load on pages that actually
	 * contain the calculator.
	 *
	 * @return void
	 */
	public static function register_frontend_assets() {
		wp_register_style( 'gbmi-front', GBMI_CALC_URL . 'css/front.css', array(), GBMI_CALC_VERSION );
		wp_register_style( 'gbmi-tabs', GBMI_CALC_URL . 'css/tab.css', array(), GBMI_CALC_VERSION );

		wp_register_script( 'gbmi-child', GBMI_CALC_URL . 'js/child.js', array( 'jquery' ), GBMI_CALC_VERSION, true );
		wp_register_script(
			'gbmi-calculator',
			GBMI_CALC_URL . 'js/gbmi-calculator.js',
			array( 'jquery', 'jquery-ui-tabs', 'gbmi-child' ),
			GBMI_CALC_VERSION,
			true
		);
	}

	/**
	 * Enqueue the front-end assets. The per-instance data the scripts need is
	 * printed inline by self::render() so it is reliable in block themes too.
	 *
	 * @return void
	 */
	private static function enqueue_frontend() {
		wp_enqueue_style( 'gbmi-front' );
		wp_enqueue_style( 'gbmi-tabs' );
		wp_enqueue_script( 'gbmi-child' );
		wp_enqueue_script( 'gbmi-calculator' );
	}

	/**
	 * Enqueue the admin colour-picker assets on the widgets screen and on the
	 * plugin settings page.
	 *
	 * @param string $hook_suffix Current admin page.
	 * @return void
	 */
	public static function enqueue_admin_assets( $hook_suffix ) {
		if ( 'widgets.php' !== $hook_suffix && self::$settings_hook !== $hook_suffix ) {
			return;
		}

		wp_enqueue_style( 'wp-color-picker' );
		wp_add_inline_style( 'wp-color-picker', '.gbmi-color-label{display:inline-block;min-width:140px}' );
		wp_enqueue_script(
			'gbmi-admin',
			GBMI_CALC_URL . 'js/gbmi-admin.js',
			array( 'jquery', 'wp-color-picker' ),
			GBMI_CALC_VERSION,
			true
		);
	}

	/* --------------------------------------------------------------------- *
	 * Translations passed to the front-end scripts
	 * --------------------------------------------------------------------- */

	/**
	 * Strings used by the adult calculator (js/gbmi-calculator.js).
	 *
	 * @return array
	 */
	private static function adult_i18n() {
		return array(
			'severly_underweight' => __( 'severely underweight', 'global-body-mass-index-calculator' ),
			'underweight'         => __( 'underweight', 'global-body-mass-index-calculator' ),
			'normal'              => __( 'normal', 'global-body-mass-index-calculator' ),
			'overweight'          => __( 'overweight', 'global-body-mass-index-calculator' ),
			'moderately_obese'    => __( 'moderately obese', 'global-body-mass-index-calculator' ),
			'severly_obese'       => __( 'severely obese', 'global-body-mass-index-calculator' ),
			'invalid'             => __( 'Please enter a valid height and weight.', 'global-body-mass-index-calculator' ),
			/* translators: %1$s: BMI value, %2$s: weight-status category (e.g. "normal"). */
			'result'              => __( 'Your BMI is %1$s, which is in the %2$s range.', 'global-body-mass-index-calculator' ),
		);
	}

	/**
	 * Strings used by the child calculator (js/child.js expects a global
	 * "childTranslate" object with exactly these keys).
	 *
	 * @return array
	 */
	private static function child_i18n() {
		return array(
			'underweight'      => __( 'underweight', 'global-body-mass-index-calculator' ),
			'norm'             => __( 'normal', 'global-body-mass-index-calculator' ),
			'overweight'       => __( 'overweight', 'global-body-mass-index-calculator' ),
			'moderately_obese' => __( 'moderately obese', 'global-body-mass-index-calculator' ),
			/* translators: %1$s: BMI value, %2$s: percentile, %3$s: weight-status category. */
			'result'           => __( 'Your child\'s BMI is %1$s. The percentile is %2$s, which is in the %3$s range.', 'global-body-mass-index-calculator' ),
			'valid1'           => __( 'Enter a valid height and weight', 'global-body-mass-index-calculator' ),
			'valid2'           => __( 'Enter a valid height', 'global-body-mass-index-calculator' ),
			'valid3'           => __( 'Enter a valid weight', 'global-body-mass-index-calculator' ),
			'valid4'           => __( 'Enter a valid age', 'global-body-mass-index-calculator' ),
		);
	}

	/* --------------------------------------------------------------------- *
	 * Shortcode
	 * --------------------------------------------------------------------- */

	/**
	 * Register the [gbmicalc] shortcode.
	 *
	 * @return void
	 */
	public static function register_shortcode() {
		add_shortcode( 'gbmicalc', array( __CLASS__, 'shortcode' ) );
	}

	/**
	 * [gbmicalc] handler. Saved settings act as defaults; shortcode attributes
	 * may override them but are whitelisted and sanitized first.
	 *
	 * @param array|string $atts Shortcode attributes.
	 * @return string
	 */
	public static function shortcode( $atts ) {
		$atts     = shortcode_atts( self::get_settings(), is_array( $atts ) ? $atts : array(), 'gbmicalc' );
		$settings = self::sanitize_settings( $atts );
		return self::render( $settings );
	}

	/* --------------------------------------------------------------------- *
	 * Renderer (shared by widget + shortcode)
	 * --------------------------------------------------------------------- */

	/**
	 * Build the calculator markup for a fully sanitized settings array.
	 *
	 * @param array $settings Sanitized settings.
	 * @return string HTML.
	 */
	public static function render( $settings ) {
		$settings = wp_parse_args( $settings, self::defaults() );
		self::enqueue_frontend();

		$is_standard = ( 'standard' === $settings['standard'] );

		// Pre-sanitized presentation values.
		$textcolor    = self::color( $settings['textcolor'], '#000000' );
		$bgcolor      = self::color( $settings['bgcolor'], '#ffffff' );
		$bgendcolor   = self::color( $settings['bgendcolor'], '#ffffff' );
		$tabcolor     = self::color( $settings['tabcolor'], '#ffffff' );
		$currtabcolor = self::color( $settings['currtabcolor'], '#cccccc' );
		$accent       = self::color( $settings['accentcolor'], '#246a9c' );
		$dim_h        = ( '' !== $settings['height'] ) ? (int) $settings['height'] . 'px' : 'auto';
		$dim_w        = ( '' !== $settings['width'] ) ? (int) $settings['width'] . 'px' : '300px';

		$uid = 'gbmi-calc-' . ( ++self::$instance );

		ob_start();

		// Shared translation blob, printed once per request no matter how many
		// calculators are on the page (per-instance mode comes from data-standard).
		if ( ! self::$i18n_printed ) {
			$json_flags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT;
			wp_print_inline_script_tag(
				'window.GBMI_i18n = ' . wp_json_encode(
					array(
						'adult' => self::adult_i18n(),
						'child' => self::child_i18n(),
					),
					$json_flags
				) . ';'
			);
			self::$i18n_printed = true;
		}
		?>
		<div class="gbmi-calc" id="<?php echo esc_attr( $uid ); ?>" data-standard="<?php echo esc_attr( $settings['standard'] ); ?>">
			<?php if ( '' !== $settings['title'] ) : ?>
				<h2 class="gbmi-title"><?php echo esc_html( $settings['title'] ); ?></h2>
			<?php endif; ?>
			<ul class="tabs">
				<li><a href="#<?php echo esc_attr( $uid ); ?>-grown"><?php esc_html_e( 'Grown ups', 'global-body-mass-index-calculator' ); ?></a></li>
				<li><a href="#<?php echo esc_attr( $uid ); ?>-child"><?php esc_html_e( 'Child', 'global-body-mass-index-calculator' ); ?></a></li>
			</ul>

			<div class="panes">
				<div id="<?php echo esc_attr( $uid ); ?>-grown" class="tabbed">
					<div class="gbmi_div">
						<div class="gbmi-row">
							<label for="<?php echo esc_attr( $uid ); ?>-gender"><?php esc_html_e( 'Gender', 'global-body-mass-index-calculator' ); ?>:</label>
							<select id="<?php echo esc_attr( $uid ); ?>-gender" class="gbmi-gender">
								<option value="Male" selected="selected"><?php esc_html_e( 'Male', 'global-body-mass-index-calculator' ); ?></option>
								<option value="Female"><?php esc_html_e( 'Female', 'global-body-mass-index-calculator' ); ?></option>
							</select>
						</div>
						<?php if ( $is_standard ) : ?>
							<div class="gbmi-row">
								<label for="<?php echo esc_attr( $uid ); ?>-height"><?php esc_html_e( 'Height', 'global-body-mass-index-calculator' ); ?>:</label>
								<input type="number" inputmode="decimal" min="0" step="any" id="<?php echo esc_attr( $uid ); ?>-height" class="input_fw gbmi-height" /><span class="gbmi-unit"><?php esc_html_e( 'ft', 'global-body-mass-index-calculator' ); ?></span>
								<input type="number" inputmode="numeric" min="0" step="1" class="input_fw gbmi-narrow gbmi-inches" aria-label="<?php echo esc_attr__( 'inches', 'global-body-mass-index-calculator' ); ?>" /><span class="gbmi-unit"><?php esc_html_e( 'in', 'global-body-mass-index-calculator' ); ?></span>
							</div>
							<div class="gbmi-row">
								<label for="<?php echo esc_attr( $uid ); ?>-weight"><?php esc_html_e( 'Weight', 'global-body-mass-index-calculator' ); ?>:</label>
								<input type="number" inputmode="decimal" min="0" step="any" id="<?php echo esc_attr( $uid ); ?>-weight" class="input_fw gbmi-weight" /><span class="gbmi-unit"><?php esc_html_e( 'pounds', 'global-body-mass-index-calculator' ); ?></span>
							</div>
						<?php else : ?>
							<div class="gbmi-row">
								<label for="<?php echo esc_attr( $uid ); ?>-height"><?php esc_html_e( 'Height', 'global-body-mass-index-calculator' ); ?>:</label>
								<input type="number" inputmode="decimal" min="0" step="any" id="<?php echo esc_attr( $uid ); ?>-height" class="input_fw gbmi-height" /><span class="gbmi-unit"><?php esc_html_e( 'cm', 'global-body-mass-index-calculator' ); ?></span>
							</div>
							<div class="gbmi-row">
								<label for="<?php echo esc_attr( $uid ); ?>-weight"><?php esc_html_e( 'Weight', 'global-body-mass-index-calculator' ); ?>:</label>
								<input type="number" inputmode="decimal" min="0" step="any" id="<?php echo esc_attr( $uid ); ?>-weight" class="input_fw gbmi-weight" /><span class="gbmi-unit"><?php esc_html_e( 'kg', 'global-body-mass-index-calculator' ); ?></span>
							</div>
						<?php endif; ?>
						<div class="gbmi-actions">
							<input type="button" class="bmisubmit gbmi-submit" value="<?php esc_attr_e( 'Get BMI!', 'global-body-mass-index-calculator' ); ?>" />
						</div>
						<?php if ( 'yes' === $settings['allowLink'] ) : ?>
							<p class="gbmi-credit"><a href="<?php echo esc_url( 'https://www.gesundesabnehmen.at/' ); ?>" rel="nofollow"><?php esc_html_e( 'by gesundesabnehmen.at', 'global-body-mass-index-calculator' ); ?></a></p>
						<?php endif; ?>
					</div>
				</div>

				<div id="<?php echo esc_attr( $uid ); ?>-child" class="tabbed">
					<div class="gbmi_div">
						<p class="gbmi-infotext"><?php esc_html_e( 'Child BMI calculator is only valid for children between 2 and 20 years.', 'global-body-mass-index-calculator' ); ?></p>

						<div class="gbmi-row">
							<label for="<?php echo esc_attr( $uid ); ?>-cgender"><?php esc_html_e( 'Gender', 'global-body-mass-index-calculator' ); ?>:</label>
							<select id="<?php echo esc_attr( $uid ); ?>-cgender" class="gbmi-child-gender">
								<option value="Male" selected="selected"><?php esc_html_e( 'Male', 'global-body-mass-index-calculator' ); ?></option>
								<option value="Female"><?php esc_html_e( 'Female', 'global-body-mass-index-calculator' ); ?></option>
							</select>
						</div>
						<div class="gbmi-row">
							<label for="<?php echo esc_attr( $uid ); ?>-cage"><?php esc_html_e( 'Age', 'global-body-mass-index-calculator' ); ?>: <span>(<?php esc_html_e( 'years', 'global-body-mass-index-calculator' ); ?>)</span></label>
							<select id="<?php echo esc_attr( $uid ); ?>-cage" class="gbmi-child-age">
								<?php for ( $age = 2; $age < 21; $age++ ) : ?>
									<option value="<?php echo esc_attr( $age ); ?>"><?php echo esc_html( $age ); ?></option>
								<?php endfor; ?>
							</select>
						</div>
						<div class="gbmi-row">
							<label for="<?php echo esc_attr( $uid ); ?>-cheight"><?php esc_html_e( 'Height', 'global-body-mass-index-calculator' ); ?>:</label>
							<input type="number" inputmode="decimal" min="0" step="any" id="<?php echo esc_attr( $uid ); ?>-cheight" class="input_fw gbmi-child-height" value="<?php echo esc_attr( $is_standard ? '42' : '107' ); ?>" />
							<span class="gbmi-unit"><?php echo $is_standard ? esc_html__( 'inches', 'global-body-mass-index-calculator' ) : esc_html__( 'cm', 'global-body-mass-index-calculator' ); ?></span>
							<input type="hidden" class="gbmi-child-height-unit" value="<?php echo esc_attr( $is_standard ? 'inches' : 'centimeters' ); ?>" />
						</div>
						<div class="gbmi-row">
							<label for="<?php echo esc_attr( $uid ); ?>-cweight"><?php esc_html_e( 'Weight', 'global-body-mass-index-calculator' ); ?>:</label>
							<input type="number" inputmode="decimal" min="0" step="any" id="<?php echo esc_attr( $uid ); ?>-cweight" class="input_fw gbmi-child-weight" value="<?php echo esc_attr( $is_standard ? '40' : '18' ); ?>" />
							<span class="gbmi-unit"><?php echo $is_standard ? esc_html__( 'pounds', 'global-body-mass-index-calculator' ) : esc_html__( 'kg', 'global-body-mass-index-calculator' ); ?></span>
							<input type="hidden" class="gbmi-child-weight-unit" value="<?php echo esc_attr( $is_standard ? 'pounds' : 'kilograms' ); ?>" />
						</div>
						<div class="gbmi-actions">
							<input type="button" class="bmisubmit gbmi-child-submit" value="<?php esc_attr_e( 'Get child BMI!', 'global-body-mass-index-calculator' ); ?>" />
						</div>
					</div>
				</div>
			</div>

			<div class="gbmi-result" role="status" aria-live="polite" style="display:none;"></div>
			<div class="gbmi-child-result" role="status" aria-live="polite" style="display:none;"></div>
		</div>
		<?php
		$sel  = '#' . $uid;
		$css  = $sel . '{height:' . $dim_h . ';width:100%;max-width:' . $dim_w . ';}';
		$css .= $sel . ' .gbmi_div{color:' . $textcolor . ';background-color:' . $bgcolor . ';background-image:linear-gradient(' . $bgcolor . ',' . $bgendcolor . ');}';
		$css .= $sel . ' .gbmi_div label,' . $sel . ' .gbmi_div h4{color:' . $textcolor . ' !important;}';
		$css .= $sel . ' li.ui-tabs-active a{background:' . $currtabcolor . ' !important;}';
		$css .= $sel . ' ul.tabs a{background:' . $tabcolor . ';}';
		$css .= $sel . ' .bmisubmit{background:' . $accent . ';}';
		$css .= $sel . ' input:focus,' . $sel . ' select:focus{border-color:' . $accent . ';}';
		echo '<style type="text/css">' . esc_html( $css ) . '</style>';

		return ob_get_clean();
	}

	/**
	 * Sanitize a colour to a safe hex value, falling back when invalid.
	 *
	 * @param string $value    Raw colour.
	 * @param string $fallback Fallback hex colour.
	 * @return string
	 */
	private static function color( $value, $fallback ) {
		$clean = sanitize_hex_color( (string) $value );
		return $clean ? $clean : $fallback;
	}

	/* --------------------------------------------------------------------- *
	 * Widget registration
	 * --------------------------------------------------------------------- */

	/**
	 * Register the widget.
	 *
	 * @return void
	 */
	public static function register_widget() {
		register_widget( 'GBMI_Calc_Widget' );
	}

	/* --------------------------------------------------------------------- *
	 * Settings page
	 * --------------------------------------------------------------------- */

	/**
	 * Add the settings page under Settings.
	 *
	 * @return void
	 */
	public static function add_settings_page() {
		self::$settings_hook = add_options_page(
			__( 'Global Body Mass Index Calculator Settings', 'global-body-mass-index-calculator' ),
			__( 'BMI Calculator', 'global-body-mass-index-calculator' ),
			'manage_options',
			'gbmi_calculator',
			array( __CLASS__, 'render_settings_page' )
		);
	}

	/**
	 * Register the single option array with a sanitize callback (Settings API
	 * handles the nonce and capability checks on save).
	 *
	 * @return void
	 */
	public static function register_settings() {
		register_setting(
			'gbmi_calc_group',
			GBMI_CALC_OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize_settings' ),
				'default'           => self::defaults(),
			)
		);
	}

	/**
	 * Render the settings page.
	 *
	 * @return void
	 */
	public static function render_settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$s        = self::get_settings();
		$defaults = self::defaults();
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

			<p>
				<?php esc_html_e( 'Add the calculator to a post or page with the shortcode', 'global-body-mass-index-calculator' ); ?>
				<code>[gbmicalc]</code>,
				<?php esc_html_e( 'or add the “BMI Calculator” widget/block to a widget area. The options below are the defaults; individual widgets can override them.', 'global-body-mass-index-calculator' ); ?>
			</p>

			<form method="post" action="options.php">
				<?php settings_fields( 'gbmi_calc_group' ); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="gbmi-title"><?php esc_html_e( 'Title', 'global-body-mass-index-calculator' ); ?></label></th>
						<td>
							<input id="gbmi-title" class="regular-text" type="text" name="<?php echo esc_attr( GBMI_CALC_OPTION ); ?>[title]" value="<?php echo esc_attr( $s['title'] ); ?>" />
							<p class="description"><?php esc_html_e( 'Shown once as a heading above the tabs. Leave blank to hide it.', 'global-body-mass-index-calculator' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="gbmi-standard"><?php esc_html_e( 'Calculator Mode', 'global-body-mass-index-calculator' ); ?></label></th>
						<td>
							<select id="gbmi-standard" name="<?php echo esc_attr( GBMI_CALC_OPTION ); ?>[standard]">
								<option value="standard" <?php selected( $s['standard'], 'standard' ); ?>><?php esc_html_e( 'Standard (feet, inches, pounds)', 'global-body-mass-index-calculator' ); ?></option>
								<option value="metric" <?php selected( $s['standard'], 'metric' ); ?>><?php esc_html_e( 'Metric (centimetres, kilograms)', 'global-body-mass-index-calculator' ); ?></option>
							</select>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Size', 'global-body-mass-index-calculator' ); ?></th>
						<td>
							<label for="gbmi-height"><?php esc_html_e( 'Height (px)', 'global-body-mass-index-calculator' ); ?></label>
							<input id="gbmi-height" type="number" min="0" name="<?php echo esc_attr( GBMI_CALC_OPTION ); ?>[height]" value="<?php echo esc_attr( $s['height'] ); ?>" placeholder="auto" />
							&nbsp;
							<label for="gbmi-width"><?php esc_html_e( 'Width (px)', 'global-body-mass-index-calculator' ); ?></label>
							<input id="gbmi-width" type="number" min="0" name="<?php echo esc_attr( GBMI_CALC_OPTION ); ?>[width]" value="<?php echo esc_attr( $s['width'] ); ?>" placeholder="380" />
							<p class="description"><?php esc_html_e( 'Leave Height blank for automatic height. Width defaults to 380px and scales down on small screens.', 'global-body-mass-index-calculator' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Colours', 'global-body-mass-index-calculator' ); ?></th>
						<td>
							<?php foreach ( self::color_fields() as $key => $label ) : ?>
								<p>
									<label for="gbmi-<?php echo esc_attr( $key ); ?>" class="gbmi-color-label"><?php echo esc_html( $label ); ?></label>
									<input id="gbmi-<?php echo esc_attr( $key ); ?>" class="gbmi-color-field" type="text" name="<?php echo esc_attr( GBMI_CALC_OPTION ); ?>[<?php echo esc_attr( $key ); ?>]" value="<?php echo esc_attr( $s[ $key ] ); ?>" data-default-color="<?php echo esc_attr( $defaults[ $key ] ); ?>" />
								</p>
							<?php endforeach; ?>
							<p class="description"><?php esc_html_e( 'The two background colours form a top-to-bottom gradient.', 'global-body-mass-index-calculator' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Backlink', 'global-body-mass-index-calculator' ); ?></th>
						<td>
							<label>
								<input type="checkbox" name="<?php echo esc_attr( GBMI_CALC_OPTION ); ?>[allowLink]" value="yes" <?php checked( $s['allowLink'], 'yes' ); ?> />
								<?php esc_html_e( 'Show an optional credit link to www.gesundesabnehmen.at', 'global-body-mass-index-calculator' ); ?>
							</label>
						</td>
					</tr>
				</table>
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}

	/* --------------------------------------------------------------------- *
	 * Activation
	 * --------------------------------------------------------------------- */

	/**
	 * Seed default options on activation (without clobbering existing config).
	 *
	 * @return void
	 */
	public static function activate() {
		if ( false === get_option( GBMI_CALC_OPTION, false ) ) {
			add_option( GBMI_CALC_OPTION, self::defaults() );
		}
	}
}
