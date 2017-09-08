import React from 'react';
import Datetime from 'react-datetime';
import moment from 'moment';

class Training extends React.Component {
	constructor() {
		super();

		// Allows you to use "this" in methods to refer to the Training component.
		this.updateTimestamp = this.updateTimestamp.bind(this);
	}

	// Event handler for training form submission
	handleSubmit( event ) {
		event.preventDefault();
	}

	// Get the ID to use for the training container div.
	getTrainingDivID() {
		return 'training-' + this.props.training.ID;
	}

	// Get the ID to use for the training form element.
	getTrainingFormID() {
		return 'training-form-' + this.props.training.ID;
	}

	// Get a comma separated alphabetical list of names of people who upvoted this training.
	getUpvoterNames() {
		if ( this.props.training.upvotedBy.length ) {
			return this.props.training.upvotedBy
				.map(userID => this.props.users[userID])
				.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
				.join(', ');
		}

		return 'No upvotes';
	}

	// Get the text for the upvote button.
	getUpvoteButtonText() {
		return this.hasCurrentUserUpvoted() ? 'Upvoted \u2713' : 'Upvote \u2191';
	}

	// Has the current user upvoted this training?
	hasCurrentUserUpvoted() {
		return -1 !== this.props.training.upvotedBy.indexOf( WDSTTrainingData.currentUserID );
	}

	// Display the sync status.
	displaySyncStatus() {
		if ( this.props.training.hasOwnProperty( 'recentlySynced' ) && true === this.props.training.recentlySynced ) {
			return <span className="sync-status">&#10003; Saved</span>;
		}

		return '';
	}

	// Get the text for the delete button.
	getDeleteButtonText() {
		return this.isPendingDeletion() ? 'Delete Training' : 'X';
	}

	// Is this training currently pending deletion?
	isPendingDeletion() {
		return this.props.training.hasOwnProperty( 'pendingDeletion' ) && true === this.props.training.pendingDeletion;
	}

	// Get a training's timestamp in the form of a Moment object.
	getMomentObject() {
		return this.props.training.timestamp ? moment.unix(this.props.training.timestamp) : '';
	}

	// Get string to be used as the Discussion Lead field's id HTML attribute.
	getDiscussionLeadID() {
		return 'discussionLead-' + this.props.training.ID;
	}

	// Get string to be used as the Suggested By field's id HTML attribute.
	getSuggestedByID() {
		return 'suggestedBy-' + this.props.training.ID;
	}

	// Update a training's timestamp.
	updateTimestamp( momentObject ) {

		// We have to build an object that mimics an event object, since react-datetime
		// doesn't provide the actual select onChange event. More info here:
		// https://github.com/YouCanBookMe/react-datetime/issues/301
		const event = {
			target: {
				name: 'timestamp',
				value: this.getTimestampFromMomentObject( momentObject ),
				closest: () => {
					return { id: this.getTrainingFormID() };
				}
			}
		};

		this.props.updateTraining( event );
	}

	// Get a timestamp from a Moment object, or empty string if none.
	getTimestampFromMomentObject( momentObject ) {
		return momentObject ? momentObject.unix() : '';
	}

	// Get the "Done" button.
	getDoneButton() {
		// Only display done button if this is a newly created training.
		if ( this.props.isNewlyCreatedTraining( this.props.training) ) {
			return <button type="button" name="done" ref="button" className="button--done" onClick={this.props.removeNewlyCreatedTrainingProperty}>DONE</button>;
		}

		return '';
	}

	render() {

		return(
			<div key={this.props.training.ID} id={this.getTrainingDivID()} className="training past">
				<form id={this.getTrainingFormID()} className="training-form" onSubmit={this.handleSubmit}>
					<div className="top-bar clearfix">
						<span title={this.getUpvoterNames()} className="upvoted-count">{this.props.training.upvotedBy.length} Upvotes</span>
						<button name="upvotedBy" className="upvoted-by" onClick={this.props.updateTrainingUpvotes}>{this.getUpvoteButtonText()}</button>
						<div className="right-section">
							{this.displaySyncStatus()}
							<button type="button" name="delete" ref="button" className="button--delete" onClick={this.props.deleteTraining}>{this.getDeleteButtonText()}</button>
						</div>
					</div>

					<div className="middle-bar">
						<input type="text" name="title" value={this.props.training.title} placeholder="Title" onChange={this.props.updateTraining} />
						<Datetime name="timestamp" value={this.getMomentObject()} inputProps={{placeholder: "Date and Time"}} onChange={this.updateTimestamp} />
						<textarea name="content" value={this.props.training.content} placeholder="Description" onChange={this.props.updateTraining} />
					</div>

					<div className="bottom-bar">
						<div className="select-container">
							<label htmlFor={this.getDiscussionLeadID}>Discussion Lead</label>
							<select id={this.getDiscussionLeadID} name="discussionLead" value={this.props.training.discussionLead} onChange={this.props.updateTraining}>
							<option>Select User</option>
							{Object.keys( this.props.users ).map(userID =>
								<option key={userID} value={userID}>{this.props.users[userID]}</option>
							)}
							</select>
						</div>

						<div className="select-container">
							<label htmlFor={this.getSuggestedByID}>Suggested By</label>
							<select id={this.getSuggestedByID} name="suggestedBy" value={this.props.training.suggestedBy} onChange={this.props.updateTraining}>
								<option>Select User</option>
								{Object.keys( this.props.users ).map(userID =>
									<option key={userID} value={userID}>{this.props.users[userID]}</option>
								)}
							</select>
						</div>

						{this.getDoneButton()}
					</div>
				</form>
			</div>
		)
	}
}

export default Training;
