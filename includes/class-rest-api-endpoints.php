<?php
/**
 * WDS Training Rest Api Endpoints.
 *
 * @since   1.0.0
 * @package WDS_Training
 */

/**
 * Endpoint class.
 *
 * @since   1.0.0
 * @package WDS_Training
 */
if ( class_exists( 'WP_REST_Controller' ) ) {
	class WDST_Rest_Api_Endpoints extends WP_REST_Controller {
		/**
		 * Parent plugin class.
		 *
		 * @var   WDS_Training
		 * @since 1.0.0
		 */
		protected $plugin = null;

		/**
		 * The REST API endpoint version.
		 *
		 * @var   string
		 * @since 1.0.0
		 */
		protected $version = '1';

		/**
		 * The base URL for the REST API endpoints.
		 *
		 * @var   string
		 * @since 1.0.0
		 */
		protected $rest_base_url = '';

		/**
		 * Prefix to use for training post meta keys.
		 *
		 * @var   string
		 * @since 1.0.0
		 */
		protected $prefix = 'wdst_training_';

		/**
		 * Magic getter for properties.
		 *
		 * @since  1.0.0
		 * @param  string    $field Field to get.
		 * @throws Exception        Throws an exception if the field is invalid.
		 * @return mixed            The field value.
		 */
		public function __get( $field ) {

		if ( property_exists( $this, $field ) ) {
			return $this->$field;
		}

		throw new Exception( 'Invalid '. __CLASS__ .' property: ' . $field );
	}

		/**
		 * Constructor.
		 *
		 * @since  1.0.0
		 *
		 * @param  WDS_Training $plugin Main plugin object.
		 */
		public function __construct( $plugin ) {
			$this->plugin = $plugin;

			$this->set_namespace_property();
			$this->set_rest_base_property();
			$this->set_rest_base_url_property();
			$this->hooks();
		}

		/**
		 * Set the namespace property.
		 *
		 * @since  1.0.0
		 */
		public function set_namespace_property() {
			$this->namespace = 'wds-training/v' . $this->version;
		}

		/**
		 * Set the REST base property.
		 *
		 * @since  1.0.0
		 */
		public function set_rest_base_property() {
			$this->rest_base = 'trainings';
		}

		/**
		 * Set the REST base URL property.
		 *
		 * @since  1.0.0
		 */
		public function set_rest_base_url_property() {
			$this->rest_base_url = trailingslashit( rest_url( $this->namespace . '/' . $this->rest_base ) );
		}

		/**
		 * Add our hooks.
		 *
		 * @since  1.0.0
		 */
		public function hooks() {
			add_action( 'rest_api_init', array( $this, 'register_routes' ) );
			add_action( 'save_post_training', array( $this, 'delete_all_trainings_transient' ) );
		}

		/**
		 * Register the routes for the objects of the controller.
		 *
		 * @since  1.0.0
		 */
		public function register_routes() {

			// Get items and create item routes.
			register_rest_route( $this->namespace, '/' . $this->rest_base, array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permission_check' ),
					'args'                => array(),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
					'args'                => $this->get_endpoint_args_for_item_schema( false ),
				),
			) );

			// Get, update and delete item routes.
			register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', array(
					array(
						'methods'             => WP_REST_Server::READABLE,
						'callback'            => array( $this, 'get_item' ),
						'permission_callback' => array( $this, 'get_item_permissions_check' ),
						'args'                => array(
							'context' => array(
								'default' => 'view',
							),
						),
					),
					array(
						'methods'             => WP_REST_Server::EDITABLE,
						'callback'            => array( $this, 'update_item' ),
						'permission_callback' => array( $this, 'update_item_permissions_check' ),
						'args'                => $this->get_endpoint_args_for_item_schema( false ),
					),
					array(
						'methods'             => WP_REST_Server::DELETABLE,
						'callback'            => array( $this, 'delete_item' ),
						'permission_callback' => array( $this, 'delete_item_permissions_check' ),
						'args'                => array(
							'force' => array(
								'default' => false,
							),
						),
					),
				)
			);

			// Get the item's schema for display / public consumption purposes.
			register_rest_route( $this->namespace, '/' . $this->rest_base . '/schema', array(
				'methods'  => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_public_item_schema' ),
			) );
		}

		/**
		 * Get items.
		 *
		 * @since  1.0.0
		 * @param  WP_REST_Request $request Full details about the request.
		 */
		public function get_items( $request ) {

			$args = $this->sanitize_recursively( $request->get_param( 'args' ) );

			return new WP_REST_Response( $this->get_trainings_data( $args ), 200 );
		}

		/**
		 * Sanitize a value recursively. Works with both arrays and scalar values.
		 *
		 * @since  1.0.0
		 * @author Kellen Mace
		 * @param  array $value The value to sanitize.
		 * @return array $value The sanitized value.
		 */
		private function sanitize_recursively( $value ) {

			if ( ! is_array( $value ) ) {
				return sanitize_text_field( $value );
			}

			foreach ( $value as $key => $array_value ) {
				if ( is_array( $array_value ) ) {
					$value[ sanitize_text_field( $key ) ] = $this->sanitize_recursively( $array_value );
				} else {
					$value[ sanitize_text_field( $key ) ] = sanitize_text_field( $array_value );
				}
			}

			return $value;
		}

		public function get_trainings_data( $args = array() ) {

			// If no args, try to get all trainings data from a transient.
			if ( ! $args ) {
				$trainings_data = get_transient( 'wds_training_all_trainings_data' );

				if ( $trainings_data && is_array( $trainings_data ) ) {
					return $trainings_data;
				}
			}

			$trainings_data = array();

			foreach ( $this->get_training_posts( $args ) as $training_post ) {
				$trainings_data[] = $this->get_training_data( $training_post );
			}

			// If no args, save all trainings data to a transient.
			if ( ! $args ) {
				set_transient( 'wds_training_all_trainings_data', $trainings_data, WEEK_IN_SECONDS );
			}

			return $trainings_data;
		}

		private function get_training_posts( $args ) {

			$defaults = array(
				'post_type'              => 'training',
				'posts_per_page'         => 500,
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			);

			$args = wp_parse_args( $args, $defaults );

			$trainings_query = new WP_Query( $args );

			if ( $trainings_query->have_posts() ) {
				return $trainings_query->get_posts();
			}

			return array();
		}

		private function get_training_data( $training_post ) {

			if ( is_scalar( $training_post ) ) {
				$training_post = get_post( $training_post );
			}

			if ( ! $training_post instanceof WP_Post ) {
				return array();
			}

			return array(
				'ID'             => $training_post->ID,
				'title'          => get_the_title( $training_post ),
				'content'        => $this->get_the_content( $training_post ),
				'timestamp'      => get_post_meta( $training_post->ID, $this->prefix . 'timestamp', true ),
				'discussionLead' => get_post_meta( $training_post->ID, $this->prefix . 'discussion_lead', true ),
				'suggestedBy'    => get_post_meta( $training_post->ID, $this->prefix . 'suggested_by', true ),
				'blogPost'       => get_post_meta( $training_post->ID, $this->prefix . 'blog_post', true ),
				'upvotedBy'      => get_post_meta( $training_post->ID, $this->prefix . 'upvoted_by', true ) ?: array(),
			);
		}

		/**
		 * Get a post's content.
		 *
		 * @param int|WP_Post $post    Optional. Post ID or post object.
		 * @return string     $content The post's content or empty string on failure.
		 */
		private function get_the_content( $post ) {

			$content = get_post_field( 'post_content', $post );

			return is_wp_error( $content ) ? '' : $content;
		}

		/**
		 * Permission check for getting items.
		 *
		 * @since  1.0.0
		 *
		 * @param  WP_REST_Request $request Full details about the request.
		 */
		public function get_items_permission_check( $request ) {
			return true; //return current_user_can( 'read' );
		}

		/**
		 * Create item.
		 *
		 * @since  1.0.0
		 *
		 * @param  WP_REST_Request $request Full details about the request.
		 */
		public function create_item( $request ) {

			$post_title   = sanitize_text_field( $request->get_param( 'postTitle' ) );
			$post_content = sanitize_text_field( $request->get_param( 'postContent' ) );

			$training_id = wp_insert_post( array(
				'post_title'   => $post_title,
				'post_content' => $post_content,
				'post_type'    => 'training',
				'post_status'  => 'publish',
			) );

			if ( ! $training_id ) {
				return new WP_REST_Response( 'Unable to create new training using the parameters provided.', 400 );
			}

			$training_data = $this->get_training_data( $training_id );

			return new WP_REST_Response( $training_data, 201 );
		}

		/**
		 * Permission check for creating item.
		 *
		 * @since  1.0.0
		 *
		 * @param  WP_REST_Request $request Full details about the request.
		 */
		public function create_item_permissions_check( $request ) {
			return true; //return current_user_can( 'publish_posts' );
		}

		/**
		 * Get item.
		 *
		 * @since  1.0.0
		 *
		 * @param  WP_REST_Request $request Full details about the request.
		 */
		public function get_item( $request ) {

			$training_id = absint( $request->get_param( 'id' ) );
		}

		/**
		 * Permission check for getting item.
		 *
		 * @since  1.0.0
		 *
		 * @param  WP_REST_Request $request Full details about the request.
		 */
		public function get_item_permissions_check( $request ) {
			return true; //return current_user_can( 'read' );
		}

		/**
		 * Update item.
		 *
		 * @since  1.0.0
		 *
		 * @param  WP_REST_Request $request Full details about the request.
		 */
		public function update_item( $request ) {

			$training_id = absint( $request->get_param( 'id' ) );
			$key         = sanitize_text_field( $request->get_param( 'key' ) );
			$value       = $this->sanitize_recursively( $request->get_param( 'value' ) );

			if ( ! $training_id || ! $key || 'training' !== get_post_type( $training_id ) ) {
				return new WP_REST_Response( 'Invalid data was provided to the update_item REST endpoint.', 400 );
			}

			switch ( $key ) {
				case 'title':
					$this->update_training_title( $training_id, $value );
					break;
				case 'content':
					$this->update_training_content( $training_id, $value );
					break;
				case 'timestamp':
				case 'discussionLead':
				case 'suggestedBy':
				case 'blogPost':
				case 'upvotedBy':
					$this->update_training_post_meta( $training_id, $key, $value );
			}

			$this->delete_all_trainings_transient();

			return new WP_REST_Response( 'Training data was updated successfully.', 200 );
		}

		private function update_training_title( $training_id, $new_title ) {

			wp_update_post( array(
				'ID'         => $training_id,
				'post_title' => $new_title,
			) );
		}

		private function update_training_content( $training_id, $new_content ) {
			wp_update_post( array(
				'ID'           => $training_id,
				'post_content' => $new_content,
			) );
		}

		private function update_training_post_meta( $training_id, $key, $value ) {

			$key = $this->prefix . $this->convert_camel_case_meta_key_to_snake_case( $key );

			update_post_meta( $training_id, $key, $value );
			$this->update_training_date_modified( $training_id );
		}

		private function update_training_date_modified( $training_id ) {

			$time = current_time( 'mysql' );

			wp_update_post( array(
				'ID'                => $training_id,
				'post_modified'     => $time,
				'post_modified_gmt' => get_gmt_from_date( $time ),
			) );
		}

		public function delete_all_trainings_transient() {
			delete_transient( 'wds_training_all_trainings_data' );
		}

		private function convert_camel_case_meta_key_to_snake_case( $key ) {

			$snake_case_lookup_table = $this->get_snake_case_meta_key_lookup_table();

			return isset( $snake_case_lookup_table[ $key ] ) ? $snake_case_lookup_table[ $key ] : $key;
		}

		private function get_snake_case_meta_key_lookup_table() {
			return array(
				'discussionLead' => 'discussion_lead',
				'suggestedBy'    => 'suggested_by',
				'blogPost'       => 'blog_post',
				'upvotedBy'      => 'upvoted_by',
			);
		}

		/**
		 * Permission check for updating items.
		 *
		 * @since  1.0.0
		 *
		 * @param  WP_REST_Request $request Full details about the request.
		 */
		public function update_item_permissions_check( $request ) {
			return true; //return current_user_can( 'edit_others_posts' );
		}

		/**
		 * Delete item.
		 *
		 * @since  1.0.0
		 *
		 * @param  WP_REST_Request $request Full details about the request.
		 */
		public function delete_item( $request ) {

			$training_id = absint( $request->get_param( 'id' ) );
			$post        = wp_delete_post( $training_id );

			if ( ! $post ) {
				return new WP_REST_Response( "Unable to delete the training with ID {$training_id}", 500 );
			}

			return new WP_REST_Response( "Successfuly deleted training {$training_id}", 200 );
		}

		/**
		 * Permission check for deleting items.
		 *
		 * @since  1.0.0
		 *
		 * @param  WP_REST_Request $request Full details about the request.
		 */
		public function delete_item_permissions_check( $request ) {
			return true; //return current_user_can( 'delete_others_posts' );
		}

		/**
		 * Get item schema.
		 *
		 * @since  1.0.0
		 */
		public function get_public_item_schema() {}
	}
}
