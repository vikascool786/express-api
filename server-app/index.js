// var express = require('express');
// var app = express();

// app.get('/', function(req, res){
//    res.send("Hello world 2!");
// });

// app.listen(3000);
require('dotenv').config();
var express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var app = express();
const routes = require('./routes/routes');

app.use(cors())

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes)

//mangodb connection
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;
mongoose.connect(mongoString);
const database = mongoose.connection;
database.on('error', (error) => {
    console.log(error)
});
database.once('connected', () => {
    console.log('Database Connected');
});

//for pug templates
app.set('view engine', 'pug');
app.set('views','./views');

app.get('/', function(req, res){
    res.render('form');
 });

//To parse URL encoded data
app.use(bodyParser.urlencoded({ extended: false }));
//To parse json data
app.use(bodyParser.json());
// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));

// var things = require('./things.js');
//Middleware function to log request protocol
// app.use('/things', function (req, res, next) {
//     console.log("A request for things received at " + Date.now());
//     next();
// });

//pug template with image html
// app.get('/components', function(req, res){
//     res.render('template');
// });

// Route handler that sends the response
// app.get('/things', function (req, res) {
//     res.send('Things');
// });
// app.get('/things/:id([0-9]{5})', function (req, res) {
//     res.send('id: ' + req.params.id);
// });

//Other routes here
// app.get('*', function (req, res) {
//     res.send('Sorry, this is an invalid URL.');
// });

// app.post('/', function(req, res){
//     console.log(req.body);
//     res.send("recieved your request!");
//  });

// app.listen(3000);
app.listen(3000, () => {
    console.log(`Server Started at ${3000}`)
})