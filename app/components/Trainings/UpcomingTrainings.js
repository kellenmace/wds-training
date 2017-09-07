import React from 'react';
import Training from './Training';

class UpcomingTrainings extends React.Component {
	constructor() {
		super();

		// Allows you to use "this" in methods to refer to the UpcomingTrainings component.
		this.getUpcomingTrainings = this.getUpcomingTrainings.bind(this);
	}

	// Get just the trainings in the future.
	getUpcomingTrainings() {
		return this.props.trainings.filter( this.isUpcomingTraining );
	}

	// Is this training in the future?
	isUpcomingTraining( training ) {
		const currentTimestamp = Math.floor( Date.now() / 1000 );
		return training.timestamp >= currentTimestamp;
	}

	render() {
		return(
			<div className="trainings upcoming">
				{this.getUpcomingTrainings().map(training =>
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
