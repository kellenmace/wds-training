import React from 'react';
import NavItem from './NavItem';

class Nav extends React.Component {
	render() {

		const tempNavBorder = {
			border: '1px solid #eee',
		};

		return(
			<div className="nav-container" style={tempNavBorder}>
				<ul className="nav">
					<NavItem label="Past" updateCurrentView={this.props.updateCurrentView} viewName="pastTrainings"/>
					<NavItem label="Suggested" updateCurrentView={this.props.updateCurrentView} viewName="suggestedTrainings"/>
					<NavItem label="Upcoming" updateCurrentView={this.props.updateCurrentView} viewName="upcomingTrainings"/>
				</ul>
			</div>
		)
	}
}

export default Nav;
