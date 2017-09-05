import React from 'react';
import axios from 'axios';
import Nav from './Nav/Nav';
import LoginMessage from './LoginMessage/LoginMessage';
import PastTrainings from './Trainings/PastTrainings';
import UpcomingTrainings from './Trainings/UpcomingTrainings';
import SuggestedTrainings from './Trainings/SuggestedTrainings';

class App extends React.Component {

    constructor() {
        super();

        // Allows you to use "this" in methods to refer to the App component.
		this.updateCurrentView = this.updateCurrentView.bind(this);
		this.updateTraining = this.updateTraining.bind(this);
		this.updateTrainingUpvotes = this.updateTrainingUpvotes.bind(this);
		this.addPendingSyncItem = this.addPendingSyncItem.bind(this);
		this.deletePendingSyncItem = this.deletePendingSyncItem.bind(this);
		this.deleteTraining = this.deleteTraining.bind(this);
		this.removeTrainingsFromPendingDeletion = this.removeTrainingsFromPendingDeletion.bind(this);
		this.removeTrainingFromPendingDeletion = this.removeTrainingFromPendingDeletion.bind(this);
		this.deleteTrainingFromState = this.deleteTrainingFromState.bind(this);
		this.isTrainingInState = this.isTrainingInState.bind(this);
		this.addNewTraining = this.addNewTraining.bind(this);
		this.addTrainingToState = this.addTrainingToState.bind(this);
		this.removeNewlyCreatedTrainingProperty = this.removeNewlyCreatedTrainingProperty.bind(this);
		this.getView = this.getView.bind(this);

        // Initialize the state.
        this.state = {
			currentView: 'suggestedTrainings',
			trainings: WDSTTrainingData.trainings,
			users: WDSTTrainingData.users,
			pendingSync: []
		}

		// Initialize recently synced property to false for all trainings.
		this.state.trainings.map( training => training.recentlySynced = false );
    }

	// Update the current view.
	updateCurrentView( currentView ) {
		this.setState({ currentView });
	}

	// Event handler for updating a training.
	updateTraining( event ) {
		// todo: consider changing this to a ref instead of accessing the DOM directly.
		const trainingID = this.getTrainingIDFromFormID( event.target.closest('.training-form').id );
		const key = event.target.name;
		const value = event.target.value;

		this.updateTrainingState( trainingID, key, value );

		// If a sync for this training and this key is already pending, delete it.
		this.deletePendingSyncItem( trainingID, key );

		// Set a timeout to update the training in the database after 1 second of inactivity.
		const timeoutID = setTimeout( () => {
			this.updateTrainingPost( trainingID, key, value );
			this.deletePendingSyncItem( trainingID, key );
			this.displayTrainingAsRecentlySynced( trainingID );
		}, 1000 );

		// Add item to the list of items pending sync.
		this.addPendingSyncItem( timeoutID, trainingID, key, value );
	}

	// Mark a training as recently synced, then remove that label shortly thereafter.
	displayTrainingAsRecentlySynced( trainingID ) {
		this.updateTrainingState( trainingID, 'recentlySynced', true );
		setTimeout( () => this.updateTrainingState( trainingID, 'recentlySynced', false ), 1500);
	}

	// Clear old sync timeouts, remove duplicates from the list of items pending sync, then add a new one.
	addPendingSyncItem( timeoutID, trainingID, key, value ) {
		const oldPendingSync  = [...this.state.pendingSync];
		const pendingSyncItem = oldPendingSync.filter( oldPendingSyncItem => trainingID == oldPendingSyncItem.trainingID && key == oldPendingSyncItem.key );

		// If there is a pending sync for this training and key, clear its timeout.
		if ( pendingSyncItem.length ) {
			clearTimeout( pendingSyncItem[0].timeoutID );
		}

		// Remove the old pending sync item, if one with this training ID and key exists.
		const pendingSync = oldPendingSync.filter( oldPendingSyncItem => trainingID != oldPendingSyncItem.trainingID || key != oldPendingSyncItem.key );

		// Add the new pending sync item.
		pendingSync.push( { timeoutID, trainingID, key, value } );

		// Update the state to remove the pending sync for this training and key.
		this.setState({ pendingSync });
	}

	// Clear the timeout for an item that is pending sync, then remove it from the pending sync list.
	deletePendingSyncItem( trainingID, key ) {
		const oldPendingSync  = [...this.state.pendingSync];
		const pendingSyncItem = oldPendingSync.filter( oldPendingSyncItem => trainingID == oldPendingSyncItem.trainingID && key == oldPendingSyncItem.key );

		if ( ! pendingSyncItem.length ) {
			return;
		}

		// Clear the timeout for this item.
		clearTimeout( pendingSyncItem[0].timeoutID );

		// The pending sync items, with the one we're targeting removed.
		const pendingSync = oldPendingSync.filter( oldPendingSyncItem => trainingID != oldPendingSyncItem.trainingID && key != oldPendingSyncItem.key );

		this.setState({ pendingSync });
	}

	// Event handler for updating a training's upvotes.
	updateTrainingUpvotes( event ) {
		// todo: consider changing this to a ref instead of accessing the DOM directly.
		const trainingID = this.getTrainingIDFromFormID( event.target.closest('.training-form').id );
		const key = event.target.name;
		const value = this.getNewUpvotesValue( trainingID, key );

		this.updateTrainingState( trainingID, key, value );
		this.updateTrainingPost( trainingID, key, value );
	}

	// Get a training's ID from its form HTML element's id attribute.
	getTrainingIDFromFormID( formID ) {
		return formID.split( 'training-form-' ).pop();
	}

	// Update a training in the front end React app.
	updateTrainingState( trainingID, key, value ) {

		const training = this.getTrainingFromState( trainingID );

		// Bail if training was not found.
		if ( ! training ) {
			return;
		}

		const trainings = this.state.trainings;
		const trainingIndex = trainings.indexOf( training );

		// Update this training with the new value.
		training[ key ] = value;

		// Overwrite the old training object with the new one.
		trainings[ trainingIndex ] = training;

		this.setState({ trainings });
	}

	// Return the training from state or null if not found.
	getTrainingFromState( trainingID ) {

		const filteredTrainings = this.state.trainings.filter(training => trainingID == training.ID);

		return filteredTrainings.length > 0 ? filteredTrainings[0] : null;
	}

	// Is a training with this ID is state?
	isTrainingInState( trainingID ) {
		return Boolean( this.getTrainingFromState( trainingID ) );
	}

	// Update a training on the server.
	updateTrainingPost( trainingID, key, value ) {
		axios.post(WDSTTrainingData.RESTBaseURL + trainingID,
			{ key, value },
			{ headers: { 'X-WP-Nonce': WDSTTrainingData.nonce } })
			.catch(function (error) {
				console.log(error);
			});
	}

	// Get the new array of upvotes after adding/removing the current user's ID.
	getNewUpvotesValue( trainingID, key ) {

		const training = this.getTrainingFromState( trainingID );

		// If training not found, return an empty array.
		if ( ! training ) {
			return [];
		}

		if ( this.isCurrentUserIDInUpvotesArray( training, key ) ) {
			return this.removeCurrentUserIDFromUpvotesArray( training, key );
		}

		return this.addCurrentUserIDToUpvotesArray( training, key );
	}

	// Is the current user's user ID in this training's Upvotes array?
	isCurrentUserIDInUpvotesArray( training, key ) {
		return -1 !== training[ key ].indexOf( WDSTTrainingData.currentUserID );
	}

	// Remove the current user's user ID from this training's Upvotes array.
	removeCurrentUserIDFromUpvotesArray( training, key ) {
		return training[ key ].filter(userID => userID !== WDSTTrainingData.currentUserID);
	}

	// Add the current user's user ID to this training's Upvotes array.
	addCurrentUserIDToUpvotesArray( training, key ) {
		const newArray = training[ key ];
		newArray.push( WDSTTrainingData.currentUserID );
		return newArray;
	}

	// Event handler for deleting a training.
	deleteTraining( event ) {
		// todo: consider changing this to a ref instead of accessing the DOM directly.
		const trainingID = this.getTrainingIDFromFormID( event.target.closest('.training-form').id );
		const training = this.getTrainingFromState( trainingID );

		if ( ! training ) {
			return;
		}

		// If this training is not yet pending deleton, set it to that.
		if ( ! this.isTrainingPendingDeletion( training ) ) {
			this.updateTrainingState(trainingID, 'pendingDeletion', true);
			this.addRemoveTrainingsFromPendingDeletionClickEvent();
			return;
		}

		this.deleteTrainingFromState( trainingID );
		this.deleteTrainingOnServer( trainingID );
	}

	// Add a one-time event listener to remove all trainings from pending deletion when document.body is clicked.
	addRemoveTrainingsFromPendingDeletionClickEvent() {
		document.body.addEventListener( 'click', this.removeTrainingsFromPendingDeletion, {once: true} );
	}

	// Remove the 'pendingDeletion' property from all trainings.
	removeTrainingsFromPendingDeletion( event ) {

		if ( this.wasDeleteTrainingButtonClicked( event ) ) {
			return;
		}

		const trainings = this.state.trainings;
		trainings.map(this.removeTrainingFromPendingDeletion);
		this.setState({ trainings });
	}

	// Was the 'Delete Training' button clicked?
	wasDeleteTrainingButtonClicked(event) {
		return 'delete' === event.target.name;
	}

	// Remove the 'pendingDeletion' property from a specific training.
	removeTrainingFromPendingDeletion( training ) {
		if ( ! this.isTrainingPendingDeletion( training ) ) {
			return;
		}

		delete training.pendingDeletion;
	}

	// If user has already clicked the delete button once and now we're confirming that deletion.
	isTrainingPendingDeletion( training ) {
		return training.hasOwnProperty( 'pendingDeletion' ) && true === training.pendingDeletion;
	}

	deleteTrainingFromState( trainingID ) {
		const oldTrainings = this.state.trainings;
		const trainings = oldTrainings.filter(training => trainingID != training.ID);
		this.setState({ trainings });
	}

	// Delete a training on the server.
	deleteTrainingOnServer( trainingID ) {
		axios.delete(WDSTTrainingData.RESTBaseURL + trainingID,
			{ headers: { 'X-WP-Nonce': WDSTTrainingData.nonce } })
			.catch(function (error) {
				console.log(error);
			});
	}

	// Create a new training on the server, then add it to the front end app.
	addNewTraining() {

		// todo: show a spinner on the Add New button.

		this.createTrainingOnServer().then(response => {
				const training = response.data;
				training.isNewlyCreatedTraining = true;
				this.addTrainingToState( training );

				// todo: remove spinner on the Add New button.
			})
			.catch(function (error) {
				console.log(error);
				// todo: remove spinner on the Add New button.
			});
	}

	// Create a new training on the server.
	createTrainingOnServer() {
		return axios.post(WDSTTrainingData.RESTBaseURL,
			{ postTitle: '', postContent: '' },
			{ headers: { 'X-WP-Nonce': WDSTTrainingData.nonce } })
			.catch(function (error) {
				console.log(error);
			});
	}

	// Add a new training to the state.
	addTrainingToState( training ) {

		// If this training is already in state, don't add it again.
		if ( this.isTrainingInState( training.ID ) ) {
			return;
		}

		const trainings = this.state.trainings;

		trainings.push( training );

		this.setState({ trainings });
	}

	// Remove 'isNewlyCreatedTraining' property from a training.
	removeNewlyCreatedTrainingProperty( event ) {
		// todo: consider changing this to a ref instead of accessing the DOM directly.
		const trainingID = this.getTrainingIDFromFormID( event.target.closest('.training-form').id );
		const training = this.getTrainingFromState( trainingID );

		if ( ! this.isNewlyCreatedTraining( training ) ) {
			return;
		}

		const trainings = this.state.trainings;
		const trainingIndex = trainings.indexOf( training );

		if ( trainingIndex.length < 0 ) {
			return;
		}

		// Remove isNewlyCreatedTraining property.
		delete training.isNewlyCreatedTraining;

		trainings[ trainingIndex ] = training;

		this.setState({ trainings });
	}

	// Is this a newly created course?
	isNewlyCreatedTraining( training ) {
		return training.hasOwnProperty( 'isNewlyCreatedTraining' ) && true === training.isNewlyCreatedTraining;
	}

	// Get the current view.
	getView() {

		if ( 'false' === WDSTTrainingData.isUserLoggedIn ) {
			return <LoginMessage />
		}

		if ( 'pastTrainings' === this.state.currentView ) {
			return <PastTrainings
				trainings={this.state.trainings}
				users={this.state.users}
				updateTraining={this.updateTraining}
				updateTrainingUpvotes={this.updateTrainingUpvotes}
				deleteTraining={this.deleteTraining}
				isNewlyCreatedTraining={this.isNewlyCreatedTraining}
				removeNewlyCreatedTrainingProperty={this.removeNewlyCreatedTrainingProperty}
			/>;
		}

		if ( 'upcomingTrainings' === this.state.currentView ) {
			return <UpcomingTrainings
				trainings={this.state.trainings}
				users={this.state.users}
				updateTraining={this.updateTraining}
				updateTrainingUpvotes={this.updateTrainingUpvotes}
				deleteTraining={this.deleteTraining}
				isNewlyCreatedTraining={this.isNewlyCreatedTraining}
				removeNewlyCreatedTrainingProperty={this.removeNewlyCreatedTrainingProperty}
			/>;
		}

		// Show the suggested trainings view by default.
		return <SuggestedTrainings
			trainings={this.state.trainings}
			users={this.state.users}
			updateTraining={this.updateTraining}
			updateTrainingUpvotes={this.updateTrainingUpvotes}
			deleteTraining={this.deleteTraining}
			addNewTraining={this.addNewTraining}
			isNewlyCreatedTraining={this.isNewlyCreatedTraining}
			removeNewlyCreatedTrainingProperty={this.removeNewlyCreatedTrainingProperty}
		/>;
	}

	render() {

		return(
			<div className="wds-training-container">
				<Nav currentView={this.state.currentView} updateCurrentView={this.updateCurrentView} />
				{this.getView()}
			</div>
		)
	}
}

export default App;





// todo: consider refreshing app training data periodically using code similar to the below.

// updateStateWithRecentlyUpdatedTrainings() {
// 	return this.fetchRecentlyUpdatedTrainings().then(response => {
// 			const updatedTrainings = response.data;
// 			const updatedTrainingIDs = updatedTrainings.map(updatedTraining => updatedTraining.ID);
// 			const oldTrainings = this.state.trainings;
// 			const trainings = oldTrainings.filter(oldTraining => -1 === updatedTrainingIDs.indexOf( oldTraining.ID ));
// 			trainings.push(...updatedTrainings);
// 			this.setState({ trainings });
// 		})
// 		.catch(function (error) {
// 			console.log(error);
// 		});
// }
//
// fetchRecentlyUpdatedTrainings() {
// 	// remove this delete and replace with a .then() callback.
// 	return axios.get(WDSTTrainingData.RESTBaseURL,
// 		{ orderby: 'modified', posts_per_page: '20' },
// 		{ headers: { 'X-WP-Nonce': WDSTTrainingData.nonce } })
// 		.catch(function (error) {
// 			console.log(error);
// 		});
// }