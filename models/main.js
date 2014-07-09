var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var userSchema = new Schema({
		login: String,
		password: String,
		email: String,
		status: {type: String, default: 'User'},
		date: {type: Date, default: Date.now},
});

var authorSchema = new Schema({
	name: {
		ru: String,
		en: String
	},
	description: {
		ru: String,
		en: String
	},
	photo: String,
	publishes: [{ type: Schema.Types.ObjectId, ref: 'Publish' }]
});

var publishSchema = new Schema({
	title: {
		ru: String,
		en: String
	},
	description: {
		ru: String,
		en: String
	},
	source: {
		name: String,
		link: String
	},
	sub_authors: [String],
	files: [String]
});

var projectSchema = new Schema({
	title: {
		ru: String,
		en: String
	},
	description: {
		ru: String,
		en: String
	},
	region: String,
	works: [{ type: Schema.Types.ObjectId, ref: 'Work' }]
});

var workSchema = new Schema({
	title: {
		ru: String,
		en: String
	},
	description: {
		ru: String,
		en: String
	},
	category: String,
	image: String
});

var eventSchema = new Schema({
	title: String,
	description: String,
	category: String
});

var pressSchema = new Schema({
	author: String,
	description: String,
	link: String
});

var licenseSchema = new Schema({
	title: String,
	image: String
});


module.exports.User = mongoose.model('User', userSchema);
module.exports.Publish = mongoose.model('Publish', publishSchema);
module.exports.Author = mongoose.model('Author', authorSchema);
module.exports.Project = mongoose.model('Project', projectSchema);
module.exports.Work = mongoose.model('Work', workSchema);
module.exports.Event = mongoose.model('Event', eventSchema);
module.exports.Press = mongoose.model('Press', pressSchema);
module.exports.License = mongoose.model('License', licenseSchema);