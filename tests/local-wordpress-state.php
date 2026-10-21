<?php
/** Disposable moderation-state check, CLI only; never deployed. */
if ('cli' !== PHP_SAPI || !in_array($argv[1]??'',array('empty','approved','mixed'),true)) { exit(1); }
require dirname(__DIR__,2).'/tests/bootstrap.php';
if ('http://127.0.0.1:8793' !== WP_HOME || !defined('WP_INSTALLING') || !WP_INSTALLING) { exit(1); }
$comments=get_comments(array('post_id'=>523,'type'=>'shalom_review','status'=>'all','meta_key'=>'shalom_frontend_fixture','number'=>100));
foreach($comments as $comment) {
    $n=(int)get_comment_meta($comment->comment_ID,'shalom_frontend_fixture',true);
    wp_set_comment_status($comment->comment_ID,'empty'!==$argv[1]&&$n<=6?'approve':'hold');
    update_comment_meta($comment->comment_ID,'shalom_price','mixed'===$argv[1]&&1===$n?'not_worth_it':'worth_it');
    update_comment_meta($comment->comment_ID,'shalom_recommend','mixed'===$argv[1]&&1===$n?'no':'yes');
}
echo wp_json_encode(\Shalom\CustomerPortal\Tour_Data::get(523)['rating'])."\n";
