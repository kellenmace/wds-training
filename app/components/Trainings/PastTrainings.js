import React from 'react';
import Training from './Training';

class PastTrainings extends React.Component {
	constructor() {
		super();

		this.getPastTrainings = this.getPastTrainings.bind(this);
	}

	// Get just the trainings in the past.
	getPastTrainings() {
		return this.props.trainings.filter( this.hasTimestamp ).filter( this.isPastTraining );
	}

	// Does this training have a timestamp?
	hasTimestamp( training ) {
		return Boolean( training.timestamp );
	}

	// Is this training in the past?
	isPastTraining( training ) {
		const currentTimestamp = Math.floor(Date.now() / 1000);
		return training.timestamp < currentTimestamp;
	}

	render() {
		return(
			<div className="trainings past">
				{this.getPastTrainings().map(training =>
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

export default PastTrainings;
