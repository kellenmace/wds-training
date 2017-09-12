import React from 'react';
import Training from './Training';

class UpcomingTrainings extends React.Component {
	constructor() {
		super();

		// Allows you to use "this" in methods to refer to the UpcomingTrainings component.
		this.getUpcomingTrainings = this.getUpcomingTrainings.bind(this);
	}

	// Get just the trainings in the future, sorted by timestamp.
	getUpcomingTrainings() {
		return this.props.trainings
			.filter( this.hasTimestamp )
			.filter( this.isUpcomingTraining )
			.sort( this.sortTimestampsAscending );
	}

	// Does this training have a timestamp?
	hasTimestamp( training ) {
		return Boolean( training.timestamp );
	}

	// Is this training in the future?
	isUpcomingTraining( training ) {
		const currentTimestamp = Math.floor( Date.now() / 1000 );
		return training.timestamp >= currentTimestamp;
	}

	// Sort two trainings by their timestamps in ascending order.
	sortTimestampsAscending( training1, training2 ) {
		return parseInt( training1.timestamp ) < parseInt( training2.timestamp ) ? -1 : 1;
	}

	render() {

		const upcomingTrainings = this.getUpcomingTrainings();

		// If no upcoming trainings exist.
		if ( ! upcomingTrainings.length ) {
			return <span>No upcoming trainings.</span>
		}

		// If upcoming trainings do exist.
		return(
			<div className="trainings upcoming">
				{upcomingTrainings.map(training =>
					<Training
						key={training.ID}
						training={training}
						users={this.props.users}
						updateTraining={this.props.updateTraining}
						updateTrainingUpvotes={this.props.updateTrainingUpvotes}
						deleteTraining={this.props.deleteTraining}
						isNewlyCreatedTraining={this.props.isNewlyCreatedTraining}
						removeNewlyCreatedTrainingProperty={this.props.removeNewlyCreatedTrainingProperty}
					/>
				)}
			</div>
		)
	}
}

export default UpcomingTrainings;
