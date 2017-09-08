import React from 'react';
import FlipMove from 'react-flip-move';
import Training from './Training';

class SuggestedTrainings extends React.Component {
	constructor() {
		super();

		// Allows you to use "this" in methods to refer to the SuggestedTrainings component.
		this.getNewTrainingSection    = this.getNewTrainingSection.bind(this);
		this.getSuggestedTrainings    = this.getSuggestedTrainings.bind(this);
		this.getNewlyCreatedTrainings = this.getNewlyCreatedTrainings.bind(this);
	}

	// Event handler for Add New Training form submission.
	handleSubmit( event ) {
		event.preventDefault();
	}

	// Get just the trainings without a timestamp, sorted by upvotes.
	getSuggestedTrainings() {
		return this.props.trainings
			.filter( this.doesTrainingLackTimestamp )
			.filter( training => ! this.props.isNewlyCreatedTraining( training ) )
			.sort( this.sortByUpvotesDescending );
	}

	// Return -1 if training1 has more upvotes or 1 if training2 does or they're equal.
	sortByUpvotesDescending(training1, training2) {
		return training1.upvotedBy.length > training2.upvotedBy.length ? -1 : 1;
	}

	// Does this training lack a timestamp?
	doesTrainingLackTimestamp( training ) {
		return training.timestamp.length < 1;
	}

	// Get the new training section content.
	getNewTrainingSection() {
		// If a newly created training exists, show that.
		if ( this.doAnyNewlyCreatedTrainingsExist() ) {
			return <div className="new-training">
				{this.getNewlyCreatedTrainings().map(training =>
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
