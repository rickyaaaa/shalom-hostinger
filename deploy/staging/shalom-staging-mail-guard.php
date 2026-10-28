<?php
/**
 * Plugin Name: Shalom Staging Mail Guard
 * Description: Blocks every outbound email on staging and records metadata outside the web root. MU-plugin: no activation needed.
 * Version: 1.0.0
 * Author: Shalom (staging only)
 *
 * Install to wp-content/mu-plugins/shalom-staging-mail-guard.php on the STAGING site only.
 * Never copy to production.
 */

defined( 'ABSPATH' ) || exit;

add_filter( 'pre_wp_mail', static function ( $return, $atts ) {
	$log = dirname( ABSPATH, 1 ) . '/shalom-staging-mail.log';
	$row = array(
		'at'      => gmdate( 'c' ),
		'to'      => isset( $atts['to'] ) ? ( is_array( $atts['to'] ) ? implode( ',', $atts['to'] ) : (string) $atts['to'] ) : '',
		'subject' => isset( $atts['subject'] ) ? (string) $atts['subject'] : '',
		'blocked' => true,
	);
	@file_put_contents( $log, wp_json_encode( $row ) . PHP_EOL, FILE_APPEND ); // phpcs:ignore
	return true; // Short-circuit: no PHPMailer, no SMTP, no delivery.
}, 1, 2 );
