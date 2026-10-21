<?php
/** Disposable local WordPress QA data only. Never run against staging. */
require dirname(__DIR__, 2) . '/tests/bootstrap.php';
if ('http://127.0.0.1:8793' !== WP_HOME || !defined('WP_INSTALLING') || !WP_INSTALLING) { exit('Local test database required.'); }
if ('tour' !== get_post_type(523)) { exit('Run the existing backend tests to prepare the disposable database first.'); }
wp_set_current_user(1);
wp_update_post(array('ID'=>523,'post_title'=>'A. Ubud Tour','post_status'=>'publish'));
update_post_meta(523,'regular_price','65');
update_post_meta(523,'sale_price','55');
update_post_meta(523,'duration','10 Hours');
update_post_meta(523,'_shalom_destinations',array('Rice Terrace','Luwak Coffee Plantation','Holy Springs Temple','Kanto Lampo Waterfall'));
update_post_meta(523,'_shalom_price_note','Note : The price listed will remain the same at the time you place your order, but it may change in the future, depending on the circumstances and conditions at that time.');
$term = get_term_by('slug','ubud','tour-area');
if ($term) { wp_set_object_terms(523,array((int)$term->term_id),'tour-area'); }
for ($i=1;$i<=7;$i++) {
    $exists=get_comments(array('post_id'=>523,'type'=>'shalom_review','status'=>'all','meta_key'=>'shalom_frontend_fixture','meta_value'=>(string)$i,'number'=>1));
    if ($exists) { continue; }
    $id=wp_insert_comment(array('comment_post_ID'=>523,'comment_type'=>'shalom_review','comment_approved'=>$i===7?0:1,'comment_author'=>'QA Traveler '.$i,'comment_content'=>'Local test review '.$i.'. This is disposable QA content, not a staging customer review.','comment_date'=>gmdate('Y-m-d H:i:s',time()-$i*60)));
    foreach(array('driving_skill'=>10,'service'=>9,'car'=>10) as $key=>$value){update_comment_meta($id,'shalom_'.$key,$value);}
    update_comment_meta($id,'shalom_frontend_fixture',(string)$i);
    update_comment_meta($id,'shalom_country','Local QA');
    update_comment_meta($id,'shalom_price','worth_it');
    update_comment_meta($id,'shalom_recommend','yes');
}
echo "Disposable local Tour 523 and 6 approved / 1 pending QA reviews ready.\n";
