const mongoose = require('mongoose');

const User = require('../models/user');
const Interest = require('../models/interest');


let uri = process.env.DB_URL;
mongoose.connect(uri, {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
//db.once('open', function() {
 //console.log("MongoDB database connection established successfully");
//});
