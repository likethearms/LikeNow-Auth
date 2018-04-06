module.exports = {
	username: {
		type: String,
		unique: true,
		trim: true,
		required: true
	},
	password: {
		type: String,
		required: true,
		trim: true
	},
};