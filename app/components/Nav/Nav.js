import React from 'react';
import NavItem from './NavItem';

class Nav extends React.Component {
	render() {

		return(
			<div className="nav-container">
				<ul className="nav">
					<NavItem label="Past" currentView={this.props.currentView} updateCurrentView={this.props.updateCurrentView} viewName="pastTrainings"/>
					<NavItem label="Suggested" currentView={this.props.currentView} updateCurrentView={this.props.updateCurrentView} viewName="suggestedTrainings"/>
					<NavItem label="Upcoming" currentView={this.props.currentView} updateCurrentView={this.props.updateCurrentView} viewName="upcomingTrainings"/>
				</ul>
			</div>
		)
	}
}

export default Nav;
