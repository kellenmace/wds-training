import React from 'react';

class NavItem extends React.Component {

	constructor() {
		super();

		// Allows you to use "this" in methods to refer to the Nav component.
		this.getClasses = this.getClasses.bind(this);
		this.isActiveView = this.isActiveView.bind(this);
		this.handleNavItemClick = this.handleNavItemClick.bind(this);
	}

	// Get classes for this menu item. Apply an 'active' class only if it is the currently active view.
	getClasses( view ) {
		return this.isActiveView( view ) ? 'nav-item active' : 'nav-item';
	}

	// Is this view currently active?
	isActiveView( view ) {
		return view === this.props.currentView;
	}

	// Nav item click handler.
	handleNavItemClick() {
		this.props.updateCurrentView( this.props.viewName );
	}

	// Nav item link click handler.
	handleNavItemLinkClick( event ) {
		event.preventDefault();
	}

	render() {

		return(
			<li className={this.getClasses( this.props.viewName )} onClick={this.handleNavItemClick}>
				<a href="#" onClick={this.handleNavItemLinkClick}>{this.props.label}</a>
			</li>
		)
	}
}

export default NavItem;
