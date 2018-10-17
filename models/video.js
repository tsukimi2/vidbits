const {mongoose} = require('../database');

const Video = mongoose.model(
	'Video',
	mongoose.Schema({
		title: {
			type: String,
			required: [ true, 'Video title is required.' ]
		},
		description: {
			type: String
		},
		videoUrl: {
			type: String,
			required: [ true, 'Video URL is required.' ]
		}
	})
);

module.exports = Video;
