import React from 'react';

class NavItem extends React.Component {
	render() {

		const tempNavItemStyles = {
			border: '1px solid #bbb',
			width: '33%',
			float: 'left',
			listStyle: 'none',
		};

		return(
			<li className="nav-item" style={tempNavItemStyles} onClick={() => this.props.updateCurrentView(this.props.viewName)}>
				<a href="#" onClick={event => event.preventDefault()}>{this.props.label}</a>
			</li>
		)
	}
}

export default NavItem;
