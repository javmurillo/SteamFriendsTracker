var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create the schema
var userSchema = new Schema({
    steamid: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String
    },
    photos: {
        type: Object
    },
    friendslist: {
        type: Object
    },
    historical: {
      type: Object
    },
    updated_at: {
      type: Date
    }
});

//create a model using it
var User = mongoose.model('User', userSchema);

module.exports = User;
