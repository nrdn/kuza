var mongoose = require('mongoose'),
			Schema = mongoose.Schema;

var userSchema = new Schema({
		login: String,
		password: String,
		email: String,
		status: {type: String, default: 'User'},
		date: {type: Date, default: Date.now},
});

var memberSchema = new Schema({
	name: {
		ru: String,
		en: String
	},
	description: {
		ru: String,
		en: String
	},
	projects: [String],
	category: String,
	photo: String,
	date: {type: Date, default: Date.now}
});

var lifeSchema = new Schema({
	title: {
		ru: String,
		en: String
	},
	description: {
		ru: String,
		en: String
	},
	images: {
		main: String,
		second: [String],
	},
	date: {type: Date, default: Date.now}
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
	images: {
		main: String,
		second: [String],
		maps: [String]
	},
	tech: [String],
	build: {type: Date, default: Date.now},
	category: String,
	members: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
	date: {type: Date, default: Date.now},
});


module.exports.User = mongoose.model('User', userSchema);
module.exports.Member = mongoose.model('Member', memberSchema);
module.exports.Project = mongoose.model('Project', projectSchema);