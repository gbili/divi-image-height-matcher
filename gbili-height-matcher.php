<?php
/*
Plugin Name: Gbili in-row images Height Matcher in Divi theme
Plugin URI: http://wordpress.org/extend/plugins/gbili-height-matcher/
Description: Matches height of images in same row keeping their aspect ratios
Author: Guillermo Pages
Version: 0.1
Author URI: http://lespagesweb.ch/
*/

/**
 * Enqueue the script
 */
function gbili_height_matcher_scripts() 
{
    wp_register_script(
      'gbili_height_matcher_js', 
      plugins_url('public/js/script.js', __FILE__),
      array('jquery'),
      '1.0',
      true
    );
    wp_enqueue_script('gbili_height_matcher_js');
}


function gbili_height_matcher_include_if($cond)
{
    if ($cond) {
        add_action('wp_enqueue_scripts', 'gbili_height_matcher_scripts');
    }
}
