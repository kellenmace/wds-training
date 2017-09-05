import React from 'react';
import FlipMove from 'react-flip-move';
import Training from './Training';

class SuggestedTrainings extends React.Component {
	constructor() {
		super();

		this.getNewTrainingSection = this.getNewTrainingSection.bind(this);
		this.getSuggestedTrainings = this.getSuggestedTrainings.bind(this);
		this.getNewlyCreatedTrainings = this.getNewlyCreatedTrainings.bind(this);
	}

	// Event handler for Add New Training form submission.
	handleSubmit( event ) {
		event.preventDefault();
	}

	// Get just the trainings without a timestamp.
	getSuggestedTrainings() {
		let suggestedTrainings = this.props.trainings.filter( training => { return this.doesTrainingLackTimestamp( training ) && ! this.props.isNewlyCreatedTraining( training ) } );

		return suggestedTrainings.sort(this.compareTrainingsUpvotes);
	}

	// Return true if training1 has less upvotes or false if training2 does or they're equal.
	compareTrainingsUpvotes(training1, training2) {
		return training1.upvotedBy.length < training2.upvotedBy.length;
	}

	// Does this training lack a timestamp?
	doesTrainingLackTimestamp( training ) {
		return training.timestamp.length < 1;
	}

	// Get the new training section content.
	getNewTrainingSection() {
		// If a newly created training exists, show that.
		if ( this.doAnyNewlyCreatedTrainingsExist() ) {
			return this.getNewlyCreatedTrainings().map(training =>
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
			);
		}

		// Else, show the Add New Training button.
		return <form onSubmit={this.handleSubmit} className="form-addnew">
			<button type="button" className="button button-addnew" onClick={this.props.addNewTraining}>+ Add New</button>
		</form>;
	}

	// Do any newly created trainings exist?
	doAnyNewlyCreatedTrainingsExist() {
		return this.getNewlyCreatedTrainings().length > 0;
	}

	// Get newly created trainings.
	getNewlyCreatedTrainings() {
		return this.props.trainings.filter( this.props.isNewlyCreatedTraining );
	}

	render() {
		return(
			<div className="trainings suggested">
				{this.getNewTrainingSection()}
				<FlipMove duration={600} easing="ease">
					{this.getSuggestedTrainings().map(training =>
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
				</FlipMove>
			</div>
		)
	}
}

export default SuggestedTrainings;
