<?php
/**
 * Customify functions and definitions
 *
 * @link    https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package customify
 */

/**
 *  Same the hook `the_content`
 *
 * @TODO: do not effect content by plugins
 *
 * 8 WP_Embed:run_shortcode
 * 8 WP_Embed:autoembed
 * 10 wptexturize
 * 10 wpautop
 * 10 shortcode_unautop
 * 10 prepend_attachment
 * 10 wp_filter_content_tags || wp_make_content_images_responsive
 * 11 capital_P_dangit
 * 11 do_shortcode
 * 20 convert_smilies
 */
global $wp_embed;
add_filter( 'customify_the_content', array( $wp_embed, 'run_shortcode' ), 8 );
add_filter( 'customify_the_content', array( $wp_embed, 'autoembed' ), 8 );
add_filter( 'customify_the_content', 'wptexturize' );
add_filter( 'customify_the_content', 'wpautop' );
add_filter( 'customify_the_content', 'shortcode_unautop' );
if ( function_exists( 'wp_filter_content_tags' ) ) {
	add_filter( 'customify_the_content', 'wp_filter_content_tags' );
} else {
	add_filter( 'customify_the_content', 'wp_make_content_images_responsive' );
}

add_filter( 'customify_the_content', 'capital_P_dangit' );
add_filter( 'customify_the_content', 'do_shortcode' );
add_filter( 'customify_the_content', 'convert_smilies' );


/**
 *  Same the hook `the_content` but not auto P
 *
 * @TODO: do not effect content by plugins
 *
 * 8 WP_Embed:run_shortcode
 * 8 WP_Embed:autoembed
 * 10 wptexturize
 * 10 shortcode_unautop
 * 10 prepend_attachment
 * 10 wp_filter_content_tags || wp_make_content_images_responsive
 * 11 capital_P_dangit
 * 11 do_shortcode
 * 20 convert_smilies
 */
add_filter( 'customify_the_title', array( $wp_embed, 'run_shortcode' ), 8 );
add_filter( 'customify_the_title', array( $wp_embed, 'autoembed' ), 8 );
add_filter( 'customify_the_title', 'wptexturize' );
add_filter( 'customify_the_title', 'shortcode_unautop' );
if ( function_exists( 'wp_filter_content_tags' ) ) {
	add_filter( 'customify_the_title', 'wp_filter_content_tags' );
} else {
	add_filter( 'customify_the_title', 'wp_make_content_images_responsive' );
}
add_filter( 'customify_the_title', 'capital_P_dangit' );
add_filter( 'customify_the_title', 'do_shortcode' );
add_filter( 'customify_the_title', 'convert_smilies' );


// Include the main Customify class.
require_once get_template_directory() . '/inc/class-customify.php';

/**
 * Main instance of Customify.
 *
 * Returns the main instance of Customify.
 *
 * @return Customify
 */
function Customify() {
	// phpc:ignore WordPress.NamingConventions.ValidFunctionName.
	return Customify::get_instance();
}

Customify();


//add extra fields to category edit form hook
add_action ( 'edit_category_form_fields', 'extra_category_fields');

//add extra fields to category edit form callback function
function extra_category_fields( $tag ) {    //check for existing featured ID
    $t_id = $tag->term_id;
    $cat_meta = get_option( "category_$t_id");
	if (isset($cat_meta['img'])){
		$cat_meta_img=$cat_meta['img'];
	}  else {
$cat_meta_img = '';
	}
	
?>
<tr class="form-field">
<th scope="row" valign="top"><label for="cat_Image_url"><?php _e('Category Image Url'); ?></label></th>
<td>
    <img src="<?php echo $cat_meta_img ; ?>" />
<input type="text" name="Cat_meta[img]" id="Cat_meta[img]" size="3" style="width:60%;" value="<?php echo $cat_meta_img ; ?>"><br />
        <span class="description"><?php _e('Insert full URL of the image here'); ?></span>
</tr>



<?php
} 


wp_enqueue_script( 'myjs', get_template_directory_uri() .  '/assets/js/post-category.js' ,['jquery']);
// save extra category extra fields hook
add_action ( 'edited_category', 'save_extra_category_fileds');

// save extra category extra fields callback function
function save_extra_category_fileds( $term_id ) {
    if ( isset( $_POST['Cat_meta'] ) ) {
        $t_id = $term_id;
        $cat_meta = get_option( "category_$t_id");
        $cat_keys = array_keys($_POST['Cat_meta']);
            foreach ($cat_keys as $key){
            if (isset($_POST['Cat_meta'][$key])){
                $cat_meta[$key] = $_POST['Cat_meta'][$key];
            }
        }
        //save the option array
        update_option( "category_$t_id", $cat_meta );
    }
}
