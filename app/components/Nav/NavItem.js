import React from 'react';

class NavItem extends React.Component {

	constructor() {
		super();

		// Allows you to use "this" in methods to refer to the Nav component.
		this.getClasses = this.getClasses.bind(this);
		this.isActiveView = this.isActiveView.bind(this);
		this.handleNavItemClick = this.handleNavItemClick.bind(this);
	}

	// Give the nav item a class of 'nav-item', and 'active' only if it is active.
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

		const tempNavItemStyles = {
			border: '1px solid #bbb',
			width: '33%',
			float: 'left',
			listStyle: 'none',
		};

		return(
			<li className={this.getClasses( this.props.viewName )} style={tempNavItemStyles} onClick={this.handleNavItemClick}>
				<a href="#" onClick={this.handleNavItemLinkClick}>{this.props.label}</a>
			</li>
		)
	}
}

export default NavItem;
