WDS Training
============

A frontend app to allow WebDevStudios to organize and manage internal trainings.

WDS Training registers a training custom post type, sets up REST API endpoints for creating, editing and deleting those CPT posts, and implements a frontend React app where individual trainings are organized and managed. All changes made to trainings in the frontend app are sent to the backend where they are saved to the database.

-----------

### The frontend app has three views:

**Past**

Shows trainings whose dates are in the past.

**Suggested**

Shows trainings that have been suggested but do not yet have a date scheduled. Includes a button users can click to add a new training.

**Upcoming**

Shows trainings whose dates are in the future.

-----------

### Individual trainings have these fields:

**Upvote button**

Users can click this button to upvote a training, or remove their vote if they had upvoted it previously. The total number of upvotes is displayed next to it.

**Delete (X) button**

If clicked twice, this training will be deleted on both the frontend app and the WordPress backend.

**Title and Description**

These text fields correspond to the post title and post content of the Training CPT post in the backend.

**Date and Time**

This datepicker field stores a timestamp for when the training is/was scheduled.

**Discussion Lead**

This dropdown is used to specify which user on the site will/did lead the discussion during this training.

**Suggested By**

This dropdown is used to specify which user on the site suggested this training topic.

**Done button**

This button is only displayed on newly created trainings. When clicked, it removes the training from pending status and causes it to appear in either the past/suggested/upvoming view based on its date.


Installation
------------

1. Clone the repo into the `/plugins/` directory of a local WordPress site and activate the plugin.
2. Create a new 'Training' page in WordPress and assign the `WDS Training` page template to it.
3. Visit the training page on the front end.


Contributing
------------

Run `npm install` followed by `webpack` to run the build scripts. Run `npm start` to run webpack watch and have the build scripts triggered automatically on file save.

Pull requests are welcome.