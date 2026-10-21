<?php
/** Native REST transport for disposable local WordPress QA only. Never deploy. */
$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if ('/wp-content/uploads/local-ubud-a.webp' === $path) {
    header('Content-Type: image/webp');
    readfile(dirname(__DIR__,2).'/tests/runtime/frontend-assets/Ubud-A.webp');
    return;
}
if (0 !== strpos($path,'/wp-json/shalom/v1/')) { http_response_code(404); exit('Local REST QA transport only.'); }
define('REST_REQUEST',true);
require dirname(__DIR__,2).'/tests/bootstrap.php';
// Installation mode uses request-local transient cache; HTTP QA needs normal persisted tickets.
wp_installing(false);
add_filter('wp_get_attachment_url',static function($url,$id){return $id===get_post_thumbnail_id(523)?'http://127.0.0.1:8793/wp-content/uploads/local-ubud-a.webp':$url;},10,2);
rest_get_server()->serve_request(substr($path,strlen('/wp-json')));
