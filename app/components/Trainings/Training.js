import React from 'react';
import Datetime from 'react-datetime';
import moment from 'moment';
import Select from 'react-select';
import axios from 'axios';
import { TransitionGroup, CSSTransition, Transition } from 'react-transition-group';

class Training extends React.Component {
	constructor() {
		super();

		this.getTrainingDivID = this.getTrainingDivID.bind(this);
		this.getTrainingFormID = this.getTrainingFormID.bind(this);
		this.updateTimestamp = this.updateTimestamp.bind(this);
		this.updateBlogPost = this.updateBlogPost.bind(this);
	}

	// Event handler for Training form submission
	handleSubmit( event ) {
		event.preventDefault();
	}

	getTrainingDivID() {
		return 'training-' + this.props.training.ID;
	}

	getTrainingFormID() {
		return 'training-form-' + this.props.training.ID;
	}

	// Get Blog Post options.
	getBlogPostOptions(input) {

		return axios.get('/wp-json/wp/v2/posts', {
				params: {
					search: input
				}
			})
			.then(response => {
				// Format data for use in dropdown menu.
				return response.data.map( post => {
					return {'value': post.id, 'label': post.title.rendered};
				});
			}).then((blogPostOptions) => {
				return { options: blogPostOptions };
			})
			.catch(function (error) {
				console.log(error);
				return [];
			});
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

	updateTimestamp(momentObject) {

		// We have to build an object that mimics an event object, since react-datetime
		// doesn't provide the actual select onChange event. More info here:
		// https://github.com/YouCanBookMe/react-datetime/issues/301

		const formID = this.getTrainingFormID();

		const event = {
			target: {
				name: 'timestamp',
				value: this.getTimestampFromMomentObject(momentObject),
				closest: () => { return { id: formID  }; }
			}
		};

		this.props.updateTraining( event );
	}

	// Get a timestamp from a Moment object, or empty string if none.
	getTimestampFromMomentObject(momentObject) {
		return momentObject ? momentObject.unix() : '';
	}

	// Event handler for when a new blog post is selected.
	updateBlogPost(value) {

		// We have to build an object that mimics an event object, since react-select
		// doesn't provide the actual select onChange event. More info here:
		// https://github.com/JedWatson/react-select/issues/1631
		// https://github.com/JedWatson/react-select/issues/520

		const formID = this.getTrainingFormID();

		const event = {
			target: {
				name: 'blogPost',
				value,
				closest: () => { return { id: formID  }; }
			}
		};

		this.props.updateTraining( event );
	}

	render() {

		const tempTrainingStyles = {
			border: '1px solid blue',
		};

		// todo: move this into methods.
		const hasCurrentUserUpvoted = -1 !== this.props.training.upvotedBy.indexOf( WDSTTrainingData.currentUserID );
		const voteStatus = hasCurrentUserUpvoted ? 'Upvoted \u2713' : 'Upvote \u2191';

		//const deleteButtonStatus = this.props.training.hasOwnProperty( 'confirmingDeletion' ) && true === this.props.training.confirmingDeletion ? 'confirmingDeletion' : '';
		const deleteButtonText = this.props.training.hasOwnProperty( 'pendingDeletion' ) && true === this.props.training.pendingDeletion ? 'Delete Training' : 'X';

		let doneButton = '';
		if ( this.props.isNewlyCreatedTraining( this.props.training) ) {
			doneButton = <button type="button" name="done" ref="button" onClick={this.props.removeNewlyCreatedTrainingProperty}>DONE</button>;
		}

		// todo: maybe show a spinner while blog posts are being fetched using isLoading={isLoadingExternally}
		// todo: Blog post select doesn't populate with value on page load.
		// todo: break some of these form fields out into their own components

		return(
			<div key={this.props.training.ID} id={this.getTrainingDivID()} className="training past" style={tempTrainingStyles}>
				<form id={this.getTrainingFormID()} className="training-form" onSubmit={this.handleSubmit}>
					<div className="top-bar">
						<button name="upvotedBy" onClick={this.props.updateTrainingUpvotes}>{voteStatus}</button>
							<span>
								<TransitionGroup component="span">
									<CSSTransition
										key={this.props.training.upvotedBy.length}
										classNames="upvotes"
										timeout={{ enter: 5000, exit: 5000 }}//todo: change back to 250
									>
										<span key={this.props.training.upvotedBy.length}>{this.props.training.upvotedBy.length}</span>
									</CSSTransition>
								</TransitionGroup>
								 Upvotes
							</span>
						<button type="button" name="delete" ref="button" onClick={this.props.deleteTraining}>{deleteButtonText}</button>
					</div>
					<input type="text" name="title" value={this.props.training.title} placeholder="Title" onChange={this.props.updateTraining} />
					<textarea name="content" value={this.props.training.content} placeholder="Description" onChange={this.props.updateTraining} />
					<Datetime name="timestamp" value={this.getMomentObject()} inputProps={{placeholder: "Date and Time"}} onChange={this.updateTimestamp} />
					<label htmlFor={this.getDiscussionLeadID}>Discussion Lead</label>
					<select id={this.getDiscussionLeadID} name="discussionLead" value={this.props.training.discussionLead} onChange={this.props.updateTraining}>
						<option>Select User</option>
						{Object.keys( this.props.users ).map(userID =>
							<option key={userID} value={userID}>{this.props.users[userID]}</option>
						)}
					</select>
					<label htmlFor={this.getSuggestedByID}>Suggested By</label>
					<select id={this.getSuggestedByID} name="suggestedBy" value={this.props.training.suggestedBy} onChange={this.props.updateTraining}>
						<option>Select User</option>
						{Object.keys( this.props.users ).map(userID =>
							<option key={userID} value={userID}>{this.props.users[userID]}</option>
						)}
					</select>
					<Select.Async
						// todo: value doesn't show up on page load.
						name="blogPost"
						value={this.props.training.blogPost}
						loadOptions={this.getBlogPostOptions}
						onChange={this.updateBlogPost}
						simpleValue={true}
						placeholder="Blog Post"
					/>
					{doneButton}
				</form>
			</div>
		)
	}
}

export default Training;
