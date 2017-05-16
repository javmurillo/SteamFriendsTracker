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
        type: String,
        required: true,
        unique: true
    },
    photos: {
        type: Object,
        required: true,
    },
    friendslist: {
        type: Object,
        required: true,
    },
    updated_at: {
      type: Date,
      required: true
    }
});

//create a model using it
var User = mongoose.model('User', userSchema);

module.exports = User;
