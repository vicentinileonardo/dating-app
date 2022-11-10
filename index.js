const app = require('./lib/app.js');

const port = process.env.PORT || 8080

app.listen(port, function(){
    console.log('App sta ascolatando sulla porta:' + port);
});
