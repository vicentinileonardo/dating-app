const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const { Schema } = mongoose;

const userSchema = new Schema({
    name:  String,
    surname: String,
    nickname: String, 
    email:   String,
    password: String,
    birthday: Date,
    age: Number,
    sex: String,
    sex_orientation: String,
    wantsRelation: Boolean,
    bio: String,
    interests: [Number],
    profile_photo: String, 
    other_photos: [String],
    confirmedMatches: [Number],
    refusedMatches: [Number],
    sentMatches: [Number],
    receivedMatches: [Number]
  });


userSchema.plugin(AutoIncrement, {inc_field: 'idUser'});

// set up a mongoose model
module.exports = mongoose.model('User', userSchema)
