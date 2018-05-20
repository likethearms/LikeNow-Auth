# Extended Schema
This add some functions to user schema.
```javascript
const mongoose = require('mongoose');
const likeNowAuth = require('likenow-auth');

// Schema
let User;
const UserSchema = likeNowAuth.getExtendedUserSchema({
	name: String,
	company: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Company',
	},
});


if (mongoose.models.User) {
	User = mongoose.model('User');
} else {
	User = mongoose.model('User', UserSchema);
}
module.exports = User;
```