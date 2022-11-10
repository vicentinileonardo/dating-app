const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const { Schema } = mongoose;

const chatSchema = new Schema({
    idUserSend: Number,
    idUserRecv: Number,
    messages: [{sendOrRecv: Number,
                message: String,
                time: String}],
    newMessages: [{sendOrRecv: Number,
                message: String,
                time: String}]
});

chatSchema.plugin(AutoIncrement, {inc_field: 'idChat'});
module.exports = mongoose.model('Chat', chatSchema);
