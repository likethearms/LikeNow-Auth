# likenow-auth
Simple statefull token authentication system.
## Extended Schema
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

## API
|API|Params|Callback|Tested
|-|-|-|-|
|getExtendedUserSchema|schema,options|void|True

### Extended schema
Extended schema add these methods and statics to mongoose schema.
|API|Params|Callback|Return|Tested|Description
|-|-|-|-|-|-|
|checkPassword|plainPassword|void|Boolean|true|
|logIn|object,callback|err,user|void|true|require password AND (email OR username)
|signUp|object,callback|err,user|void|true|signup require password AND (email OR username)
|createToken| options, callback | err, tokenObj |void|true|Create token and save to  db
|getTokens| callback | err, tokenArray | void| true | return all user's tokens

### ExtendedUserSchema
|API|Method|Params|Callback|Return|Tested
|-|-|-|-|-|-|
|constructor|constuctor|schema, options| void| void | true
|getExtendedUserSchema|method||void|void|true
|extendSchema|static|schema|extendedSchema| void| true

|checkPassword|plainPassword|void|Boolean|true|
|logIn|object,callback|err,user|void|true
|validateUser|object,callback|err|void|false|
|signUp|object,callback|err,user|void|true

### TokenHandler
|API|Params|Callback|Tested
|-|-|-|-|
|createToken| options, callback | err, tokenObj | true
|findToken| query, callback | err, tokenArray | false
|findOneToken| query, callback | err, tokenObj | false
|removeToken| query, callback | err, tokenArray | false
|getTokens| callback | err, tokenArray | true
|tokenMiddleware| req,res,next | null | true
|validateToken| token, callback | err, tokenObj | false