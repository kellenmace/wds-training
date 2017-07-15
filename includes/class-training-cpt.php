<?php
/**
 * WDS Training Training.
 *
 * @since   1.0.0
 * @package WDS_Training
 */

require_once __DIR__ . '/../vendor/cpt-core/CPT_Core.php';
require_once __DIR__ . '/../vendor/cmb2/init.php';
require_once __DIR__ . '/../vendor/cmb-field-select2/cmb-field-select2.php';

/**
 * WDS Training Training post type class.
 *
 * @since 1.0.0
 *
 * @see   https://github.com/WebDevStudios/CPT_Core
 */
class WDST_Training_CPT extends CPT_Core {
	/**
	 * Parent plugin class.
	 *
	 * @var WDS_Training
	 * @since  1.0.0
	 */
	protected $plugin = null;

	/**
	 * Constructor.
	 *
	 * Register Custom Post Types.
	 *
	 * See documentation in CPT_Core, and in wp-includes/post.php.
	 *
	 * @since  1.0.0
	 *
	 * @param  WDS_Training $plugin Main plugin object.
	 */
	public function __construct( $plugin ) {
		$this->plugin = $plugin;
		$this->hooks();

		// Register this cpt.
		// First parameter should be an array with Singular, Plural, and Registered name.
		parent::__construct(
			array(
				esc_html__( 'Training', 'wds-training' ),
				esc_html__( 'Trainings', 'wds-training' ),
				'training',
			),
			array(
				'supports'     => array(
					'title',
					'editor',
				),
				'menu_icon'    => 'dashicons-clipboard',
				'public'       => false,
			)
		);
	}

	/**
	 * Initiate our hooks.
	 *
	 * @since  1.0.0
	 */
	public function hooks() {
		add_action( 'cmb2_admin_init', array( $this, 'fields' ) );
	}

	/**
	 * Add custom fields to the CPT.
	 *
	 * @since  1.0.0
	 */
	public function fields() {

		// Set our prefix.
		$prefix = 'wdst_training_';

		// Define our metaboxes and fields.
		$training_metabox = new_cmb2_box( array(
			'id'           => $prefix . 'metabox',
			'title'        => esc_html__( 'WDS Training Details', 'wds-training' ),
			'object_types' => array( 'training' ),
		) );

		$training_metabox->add_field( array(
			'name' => __( 'Date and Time', 'wds-training' ),
			'desc' => __( 'Displayed as GMT.', 'wds-training' ),
			'id'   => $prefix . 'timestamp',
			'type' => 'text_datetime_timestamp',
		) );

		$training_metabox->add_field( array(
			'name'    => __( 'Discussion Lead', 'wds-training' ),
			'desc'    => __( 'Who is leading the training', 'wds-training' ),
			'id'      => $prefix . 'discussion_lead',
			'type'    => 'pw_select',
			'options' => $this->get_users(),
		) );

		$training_metabox->add_field( array(
			'name'    => __( 'Suggested By', 'wds-training' ),
			'desc'    => __( 'Who suggested this topic', 'wds-training' ),
			'id'      => $prefix . 'suggested_by',
			'type'    => 'pw_select',
			'options' => $this->get_users(),
		) );

		$training_metabox->add_field( array(
			'name' => __( 'Blog Post', 'wds-training' ),
			'desc' => __( 'The blog post associated with this training', 'wds-training' ),
			'id'   => $prefix . 'blog_post',
			'type' => 'pw_select',
			'options' => $this->get_posts(),
		) );

		$training_metabox->add_field( array(
			'name'    => __( 'Upvoted By', 'wds-training' ),
			'desc'    => __( 'The people who upvoted this topic', 'wds-training' ),
			'id'      => $prefix . 'upvoted_by',
			'type'    => 'pw_multiselect',
			'options' => $this->get_users(),
		) );
	}

	/**
	 * Get all posts in the format: post ID => post title.
	 *
	 * @since  1.0.0
	 *
	 * @return array The posts.
	 */
	public function get_posts() {

		global $wpdb;

		$post_objects = $wpdb->get_results( "SELECT ID, post_title FROM wp_posts WHERE post_type = 'post' AND post_status = 'publish'" ); // WPCS: db call ok.

		if ( ! $post_objects ) {
			return array();
		}

		return wp_list_pluck( $post_objects, 'post_title', 'ID' );
	}

	/**
	 * Get all users in the format: user ID => display name.
	 *
	 * @since  1.0.0
	 *
	 * @return array Users.
	 */
	public function get_users() {

		static $users = null;

		if ( is_array( $users ) ) {
			return $users;
		}

		$users = array();

		$users_objects = get_users( array(
			'fields' => array( 'ID', 'display_name' ),
		) );

		if ( $users_objects ) {
			$users = wp_list_pluck( $users_objects, 'display_name', 'ID' );
		}

		return $users;
	}

	/**
	 * Registers admin columns to display. Hooked in via CPT_Core.
	 *
	 * @since  1.0.0
	 *
	 * @param  array $columns Array of registered column names/labels.
	 * @return array          Modified array.
	 */
	public function columns( $columns ) {
		$new_column = array();
		return array_merge( $new_column, $columns );
	}

	/**
	 * Handles admin column display. Hooked in via CPT_Core.
	 *
	 * @since  1.0.0
	 *
	 * @param array   $column   Column currently being rendered.
	 * @param integer $post_id  ID of post to display column for.
	 */
	public function columns_display( $column, $post_id ) {
		switch ( $column ) {
		}
	}
}
