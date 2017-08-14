<?php
/**
 * Plugin Name: WDS Training
 * Description: Frontend app for WDS to manage, suggest and upvote internal trainings.
 * Version:     1.0.0
 * Author:      Kellen Mace
 * Author URI:  https://webdevstudios.com/
 * License:     GPLv2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 */

/**
 * Autoloads files with classes when needed.
 *
 * @since  1.0.0
 * @param  string $class_name Name of the class being requested.
 */
function wds_training_autoload_classes( $class_name ) {

	// If our class doesn't have our prefix, don't load it.
	if ( 0 !== strpos( $class_name, 'WDST_' ) ) {
		return;
	}

	// Set up our filename.
	$filename = strtolower( str_replace( '_', '-', substr( $class_name, strlen( 'WDST_' ) ) ) );

	// Include our file.
	WDS_Training::include_file( 'includes/class-' . $filename );
}
spl_autoload_register( 'wds_training_autoload_classes' );

/**
 * Main initiation class.
 *
 * @since  1.0.0
 */
final class WDS_Training {

	/**
	 * Current version.
	 *
	 * @var    string
	 * @since  1.0.0
	 */
	const VERSION = '1.0.0';

	/**
	 * URL of plugin directory.
	 *
	 * @var    string
	 * @since  1.0.0
	 */
	protected $url = '';

	/**
	 * Path of plugin directory.
	 *
	 * @var    string
	 * @since  1.0.0
	 */
	protected $path = '';

	/**
	 * Plugin basename.
	 *
	 * @var    string
	 * @since  1.0.0
	 */
	protected $basename = '';

	/**
	 * Singleton instance of plugin.
	 *
	 * @var    WDS_Training
	 * @since  1.0.0
	 */
	protected static $single_instance = null;

	/**
	 * Instance of WDST_Page_Template
	 *
	 * @since 1.0.0
	 * @var   WDST_Page_Template
	 */
	protected $page_template = null;

	/**
	 * Instance of WDST_Training_CPT
	 *
	 * @since 1.0.0
	 * @var   WDST_Training_CPT
	 */
	protected $training_cpt = null;

	/**
	 * Instance of WDST_Enqueue_Assets
	 *
	 * @since 1.0.0
	 * @var   WDST_Enqueue_Assets
	 */
	protected $enqueue_assets = null;

	/**
	 * Instance of WDST_Rest_Api_Endpoints
	 *
	 * @since 1.0.0
	 * @var   WDST_Rest_Api_Endpoints
	 */
	protected $rest_api_endpoints;

	/**
	 * Creates or returns an instance of this class.
	 *
	 * @since   1.0.0
	 * @return  WDS_Training A single instance of this class.
	 */
	public static function get_instance() {
		if ( null === self::$single_instance ) {
			self::$single_instance = new self();
		}

		return self::$single_instance;
	}

	/**
	 * Sets up our plugin.
	 *
	 * @since  1.0.0
	 */
	protected function __construct() {
		$this->basename = plugin_basename( __FILE__ );
		$this->url      = plugin_dir_url( __FILE__ );
		$this->path     = plugin_dir_path( __FILE__ );
	}

	/**
	 * Attach other plugin classes to the base plugin class.
	 *
	 * @since  1.0.0
	 */
	public function plugin_classes() {
		$this->page_template      = new WDST_Page_Template( $this );
		$this->training_cpt       = new WDST_Training_CPT( $this );
		$this->enqueue_assets     = new WDST_Enqueue_Assets( $this );
		$this->rest_api_endpoints = new WDST_Rest_Api_Endpoints( $this );
	} // END OF PLUGIN CLASSES FUNCTION

	/**
	 * Add hooks and filters.
	 * Priority needs to be
	 * < 10 for CPT_Core,
	 * < 5 for Taxonomy_Core,
	 * and 0 for Widgets because widgets_init runs at init priority 1.
	 *
	 * @since  1.0.0
	 */
	public function hooks() {
		add_action( 'init', array( $this, 'init' ), 0 );
	}

	/**
	 * Init hooks
	 *
	 * @since  1.0.0
	 */
	public function init() {

		// Bail early if requirements aren't met.
		if ( ! $this->meets_requirements() ) {
			return;
		}

		// Load translated strings for plugin.
		load_plugin_textdomain( 'wds-training', false, dirname( $this->basename ) . '/languages/' );

		// Initialize plugin classes.
		$this->plugin_classes();
	}

	/**
	 * Check that all plugin requirements are met.
	 *
	 * @since  1.0.0
	 *
	 * @return boolean True if requirements are met.
	 */
	public function meets_requirements() {
		// Ensure that we're running a version of WP that includes the REST API.
		return version_compare( $GLOBALS['wp_version'], '4.7', '>=' );
	}

	/**
	 * Magic getter for our object.
	 *
	 * @since  1.0.0
	 *
	 * @param  string $field Field to get.
	 * @throws Exception     Throws an exception if the field is invalid.
	 * @return mixed         Value of the field.
	 */
	public function __get( $field ) {
		switch ( $field ) {
			case 'version':
				return self::VERSION;
			case 'basename':
			case 'url':
			case 'path':
			case 'page_template':
			case 'training_cpt':
			case 'enqueue_assets':
			case 'rest_api_endpoints':
				return $this->$field;
			default:
				throw new Exception( 'Invalid ' . __CLASS__ . ' property: ' . $field );
		}
	}

	/**
	 * Include a file from the includes directory.
	 *
	 * @since  1.0.0
	 *
	 * @param  string $filename Name of the file to be included.
	 * @return boolean          Result of include call.
	 */
	public static function include_file( $filename ) {
		$file = self::dir( $filename . '.php' );
		if ( file_exists( $file ) ) {
			return include_once( $file );
		}
		return false;
	}

	/**
	 * This plugin's directory.
	 *
	 * @since  1.0.0
	 *
	 * @param  string $path (optional) appended path.
	 * @return string       Directory and path.
	 */
	public static function dir( $path = '' ) {
		static $dir;
		$dir = $dir ? $dir : trailingslashit( dirname( __FILE__ ) );
		return $dir . $path;
	}

	/**
	 * This plugin's url.
	 *
	 * @since  1.0.0
	 *
	 * @param  string $path (optional) appended path.
	 * @return string       URL and path.
	 */
	public static function url( $path = '' ) {
		static $url;
		$url = $url ? $url : trailingslashit( plugin_dir_url( __FILE__ ) );
		return $url . $path;
	}
}

// Kick it off.
add_action( 'plugins_loaded', array( WDS_Training::get_instance(), 'hooks' ) );
