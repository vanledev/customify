<?php

/**
 * Display Header Layout
 */
function customify_customize_render_header() {
	if ( ! customify_is_header_display() ) {
		return;
	}

	/**
	 * @since 0.2.7
	 */
	$config = Customify_Customize_Layout_Builder()->get_builder( 'header' )->get_config();
	$control_id = 'header_builder_panel';
	$version = false;

	if ( isset( $config['version_id'] ) ) {
		$version = Customify()->get_setting( $config['version_id'] );
	}

	if ( $version && isset( $config['versions'] ) ) {
		$control_id = $config['versions'][ $version ]['control_id'];
	}

	$list_items = Customify_Customize_Layout_Builder()->get_builder_items( 'header' );

	$fn = 'Customify_Layout_Builder_Frontend';
	if ( $version ) {
		if ( function_exists( $fn . '_' . strtoupper( $version ) ) ) {
			$fn = $fn . '_' . strtoupper( $version );
		}
	}

	/**
	 * @var Customify_Layout_Builder_Frontend $builder
	 */
	$builder = call_user_func_array( $fn, array() );

	echo $builder->close_icon( ' close-panel close-sidebar-panel' );
	/**
	 * Hook before header
	 *
	 * @since 0.2.2
	 */
	do_action( 'customizer/before-header' );
	echo '<header id="masthead" class="site-header">';
		echo '<div id="masthead-inner" class="site-header-inner">';
			echo '<pre>';
			echo json_encode( get_theme_mod( $control_id ), JSON_PRETTY_PRINT );
			echo '</pre>';
			$builder->set_id( 'header' );
			$builder->set_control_id( $control_id );
			$builder->set_config_items( $list_items );
			$builder->render();
			$builder->render_mobile_sidebar();

		echo '</div>';
	echo '</header>';
	/**
	 * Hook after header
	 *
	 * @since 0.2.2
	 */
	do_action( 'customizer/after-header' );
}

/**
 * Display Footer Layout
 */
function customify_customize_render_footer() {
	if ( ! customify_is_footer_display() ) {
		return;
	}
	/**
	 * Hook before footer
	 *
	 * @since 0.2.2
	 */
	do_action( 'customify/before-footer' );
	echo '<footer class="site-footer" id="site-footer">';
	Customify_Customize_Layout_Builder_Frontend()->set_id( 'footer' );
	Customify_Customize_Layout_Builder_Frontend()->set_control_id( 'footer_builder_panel' );
	$list_items = Customify_Customize_Layout_Builder()->get_builder_items( 'footer' );
	Customify_Customize_Layout_Builder_Frontend()->set_config_items( $list_items );
	Customify_Customize_Layout_Builder_Frontend()->render();
	echo '</footer>';
	/**
	 * Hook before footer
	 *
	 * @since 0.2.2
	 */
	do_action( 'customify/after-footer' );
}
