<?php
/**
 * Staging-only constants for the isolated multi-currency WordPress.
 * Append to the STAGING wp-config.php only. Never to production.
 * This file must contain constants only: wp-config.php loads before WordPress
 * functions exist, so add_filter()/update_option() here would be fatal.
 */

// Environment marker.
define( 'WP_ENVIRONMENT_TYPE', 'staging' );

// No code editing from wp-admin.
define( 'DISALLOW_FILE_EDIT', true );

// Log errors to a file outside the web root; never display them.
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_DISPLAY', false );
define( 'WP_DEBUG_LOG', dirname( __DIR__ ) . '/shalom-staging-debug.log' );

// Do not trigger WP-Cron from visitor requests; run it from the panel/system cron.
define( 'DISABLE_WP_CRON', true );

// Shared secret with the Next.js staging deployment (HEADLESS_RATE_LIMIT_MODE=signed).
// GENERATE on the staging host: openssl rand -hex 32
// Must equal SHALOM_HEADLESS_SIGNING_KEY in the Vercel Preview environment.
define( 'SHALOM_HEADLESS_SIGNING_KEY', 'GENERATE_64_HEX' );

// Must equal the audience the Next.js adapter signs with.
// The adapter signs `wordpressConfig().api`, i.e. the full API URL — not a label.
// Set this to exactly the same value as WORDPRESS_API_URL, e.g.
// https://STAGING-WORDPRESS-HOST/wp-json/shalom/v1
define( 'SHALOM_HEADLESS_AUDIENCE', 'https://STAGING-WORDPRESS-HOST/wp-json/shalom/v1' );
