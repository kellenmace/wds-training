import React from 'react';
import { render } from 'react-dom';
import App from './components/App';

// todo: fix the 'require is not defined' ESLint error caused by this line.
// Info: https://stackoverflow.com/questions/19059580/client-on-node-uncaught-referenceerror-require-is-not-defined
require( './styles/style.scss' );

render( <App />, document.getElementById('app') );
