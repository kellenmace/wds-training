const commonConfig = require( './webpack/webpack.common' );
const webpackMerge = require( 'webpack-merge' );

// No need for addons at this time.
module.exports = ( env ) => {
	const envConfig = require( `./webpack/webpack.${env.env}.js` );
	const mergedConfig = webpackMerge( commonConfig, envConfig );

	return mergedConfig;
};


// For reference:
// https://deliciousbrains.com/develop-wordpress-plugin-webpack-3-react/
// https://github.com/efuller/wp-starter-plugin/
// https://github.com/ryelle/Foxhound/blob/master/webpack.config.js
// https://github.com/efuller/modern-wp-with-react/blob/master/webpack.config.js