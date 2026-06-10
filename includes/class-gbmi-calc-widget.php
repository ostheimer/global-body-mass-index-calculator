<?php
/**
 * Sidebar widget for the Global Body Mass Index Calculator.
 *
 * @package GBMI_Calculator
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

/**
 * Renders the calculator in a sidebar using the modern WP_Widget API.
 */
class GBMI_Calc_Widget extends WP_Widget {

	/**
	 * Constructor.
	 */
	public function __construct() {
		parent::__construct(
			'gbmi_calc_widget',
			__( 'BMI Calculator', 'global-body-mass-index-calculator' ),
			array(
				'description' => __( 'A Global Body Mass Index Calculator for adults and children.', 'global-body-mass-index-calculator' ),
			)
		);
	}

	/**
	 * Front-end output.
	 *
	 * @param array $args     Sidebar arguments.
	 * @param array $instance Saved widget settings.
	 * @return void
	 */
	public function widget( $args, $instance ) {
		$settings = GBMI_Calculator::sanitize_settings( $instance );

		echo $args['before_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Theme-provided wrapper markup.
		echo GBMI_Calculator::render( $settings ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- render() escapes every value it outputs.
		echo $args['after_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Theme-provided wrapper markup.
	}

	/**
	 * Persist settings; everything is whitelisted and sanitized.
	 *
	 * @param array $new_instance New values.
	 * @param array $old_instance Previous values.
	 * @return array
	 */
	public function update( $new_instance, $old_instance ) {
		return GBMI_Calculator::sanitize_settings( $new_instance );
	}

	/**
	 * Settings form shown in the widgets screen.
	 *
	 * @param array $instance Saved settings.
	 * @return void
	 */
	public function form( $instance ) {
		$s        = wp_parse_args( is_array( $instance ) ? $instance : array(), GBMI_Calculator::defaults() );
		$defaults = GBMI_Calculator::defaults();
		?>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title', 'global-body-mass-index-calculator' ); ?></label>
			<input class="widefat" type="text"
				id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"
				name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>"
				value="<?php echo esc_attr( $s['title'] ); ?>" />
		</p>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'standard' ) ); ?>"><?php esc_html_e( 'Calculator Mode', 'global-body-mass-index-calculator' ); ?></label>
			<select class="widefat"
				id="<?php echo esc_attr( $this->get_field_id( 'standard' ) ); ?>"
				name="<?php echo esc_attr( $this->get_field_name( 'standard' ) ); ?>">
				<option value="standard" <?php selected( $s['standard'], 'standard' ); ?>><?php esc_html_e( 'Standard', 'global-body-mass-index-calculator' ); ?></option>
				<option value="metric" <?php selected( $s['standard'], 'metric' ); ?>><?php esc_html_e( 'Metric', 'global-body-mass-index-calculator' ); ?></option>
			</select>
		</p>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'height' ) ); ?>"><?php esc_html_e( 'Height', 'global-body-mass-index-calculator' ); ?> (px)</label>
			<input class="tiny-text" type="number" min="0"
				id="<?php echo esc_attr( $this->get_field_id( 'height' ) ); ?>"
				name="<?php echo esc_attr( $this->get_field_name( 'height' ) ); ?>"
				value="<?php echo esc_attr( $s['height'] ); ?>" placeholder="auto" />
			<label for="<?php echo esc_attr( $this->get_field_id( 'width' ) ); ?>"><?php esc_html_e( 'Width', 'global-body-mass-index-calculator' ); ?> (px)</label>
			<input class="tiny-text" type="number" min="0"
				id="<?php echo esc_attr( $this->get_field_id( 'width' ) ); ?>"
				name="<?php echo esc_attr( $this->get_field_name( 'width' ) ); ?>"
				value="<?php echo esc_attr( $s['width'] ); ?>" placeholder="300" />
		</p>
		<?php
		foreach ( GBMI_Calculator::color_fields() as $key => $label ) :
			?>
			<p>
				<label for="<?php echo esc_attr( $this->get_field_id( $key ) ); ?>"><?php echo esc_html( $label ); ?></label><br />
				<input class="gbmi-color-field" type="text"
					id="<?php echo esc_attr( $this->get_field_id( $key ) ); ?>"
					name="<?php echo esc_attr( $this->get_field_name( $key ) ); ?>"
					value="<?php echo esc_attr( $s[ $key ] ); ?>"
					data-default-color="<?php echo esc_attr( $defaults[ $key ] ); ?>" />
			</p>
			<?php
		endforeach;
		?>
		<p>
			<input type="checkbox"
				id="<?php echo esc_attr( $this->get_field_id( 'allowLink' ) ); ?>"
				name="<?php echo esc_attr( $this->get_field_name( 'allowLink' ) ); ?>"
				value="yes" <?php checked( $s['allowLink'], 'yes' ); ?> />
			<label for="<?php echo esc_attr( $this->get_field_id( 'allowLink' ) ); ?>"><?php esc_html_e( 'Show an optional credit link to www.gesundesabnehmen.at', 'global-body-mass-index-calculator' ); ?></label>
		</p>
		<?php
	}
}
