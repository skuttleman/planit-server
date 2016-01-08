try {
  require('dotenv').load();
} catch(error) {
  console.error(error);
}
var express = require('express'), app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

app.use(bodyParser({ extended: false }));
app.use(cors());



var auth = require('./routes/auth');
app.use(auth);



app.get('/', function(request, response) {
	response.send(request.user ? 'loggedin' : 'loggedout');
});


app.listen(process.env.PORT, function() {
  console.log('The NSA is listening on PORT:', process.env.PORT);
});
