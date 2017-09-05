<?php
/**
 * WDS Training Enqueue JS.
 *
 * @since   1.0.0
 * @package WDS_Training
 */

/**
 * WDS Training Enqueue Assets
 *
 * @since 1.0.0
 */
class WDST_Enqueue_Assets {
	/**
	 * Parent plugin class.
	 *
	 * @since 1.0.0
	 *
	 * @var   WDS_Training
	 */
	protected $plugin = null;

	/**
	 * Prefix to use for training post meta keys.
	 *
	 * @var   string
	 * @since 1.0.0
	 */
	protected $prefix = 'wdst_training_';

	/**
	 * Constructor.
	 *
	 * @since  1.0.0
	 *
	 * @param  WDS_Training $plugin Main plugin object.
	 */
	public function __construct( $plugin ) {
		$this->plugin = $plugin;

		$this->hooks();
	}

	/**
	 * Initiate our hooks.
	 *
	 * @since  1.0.0
	 */
	public function hooks() {
		add_filter( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	/**
	 * Enqueue scripts and styles.
	 *
	 * @since  1.0.0
	 */
	public function enqueue_scripts() {

		if ( ! $this->is_wds_training_page_template_being_used() ) {
			return;
		}

		wp_enqueue_style( 'wds-training', $this->plugin->url . 'dist/style.css', array(), '1.0.0' );

		wp_enqueue_script( 'wds-training', $this->plugin->url . 'dist/scripts.js', array(), '1.0.0', true );

		wp_localize_script( 'wds-training', 'WDSTTrainingData', $this->get_app_data() );
	}

	/**
	 * Is the WDS Training page template currently being used?
	 *
	 * @return boolean Whether the WDS Training page template is being used.
	 */
	private function is_wds_training_page_template_being_used() {
		return 'wds-training-template.php' === basename( get_page_template_slug() );
	}

	/**
	 * Get the app data.
	 *
	 * @since  1.0.0
	 * @return array The app data.
	 */
	public function get_app_data() {
		return array(
			'RESTBaseURL'    => esc_url_raw( $this->plugin->rest_api_endpoints->rest_base_url ),
			'isUserLoggedIn' => is_user_logged_in(),
			'currentUserID'  => get_current_user_id(),
			'nonce'          => wp_create_nonce( 'wp_rest' ),
			'loginURL'       => wp_login_url( get_permalink() ),
			'trainings'      => $this->plugin->rest_api_endpoints->get_trainings_data(),
			'users'          => $this->get_user_data(),
		);
	}

	/**
	 * Get users in the format user ID => display_name in alphabetical order by name.
	 *
	 * @since  1.0.0
	 * @return array The user data.
	 */
	private function get_user_data() {

		$users = get_users( array(
			'fields'  => array( 'ID', 'display_name' ),
			'orderby' => 'display_name',
		) );

		if ( ! $users ) {
			return array();
		}

		return wp_list_pluck( $users, 'display_name', 'ID' );
	}
}
