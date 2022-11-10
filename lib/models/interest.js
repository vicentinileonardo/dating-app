const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const { Schema } = mongoose;

const interestSchema = new Schema({
    name:  String,
    description: String,
  });

interestSchema.plugin(AutoIncrement, {inc_field: 'idInterest'});
// set up a mongoose model
module.exports = mongoose.model('Interest', interestSchema)
