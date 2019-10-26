var express = require('express');
var bodyParser = require('body-parser')
var app = express();
const session = require('express-session');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
mongoose.connect('mongodb://localhost/chatApp_db3', {useNewUrlParser: true});
app.use(session({
  secret: 'keyboardkitteh',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))
var typing = false;
var timeout = undefined;

var user;
const MessageSchema = new mongoose.Schema({
  name: String,
  message: String,
},{timestamps:true})

let Message = mongoose.model('Message', MessageSchema);

app.get('/' ,(req,res) => {
  res.render("form")
});

app.get("/chat-room",(req,res) =>{
  res.render('index',user)
})


app.post("/chat-group",(req,res) => {
  if( req.session.name == null){
    req.session.name = req.body.name;
  }
  if(req.session.image == null){
    console.log("Here Here",req.body)
    if(req.body.img === undefined){
      console.log("Here Here near default img")
    }
    console.log("Here Here near img")
    req.session.image = req.body.img
  }
  user = {
    name: req.body.name,
    image:req.body.img?req.body.img:"https://cdn.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png"
  }
  res.redirect('/chat-room')
})

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})


app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})


app.post('/messages', (req, res) => {
    var message = new Message(req.body);
    message.save()
    .then(data => {
      console.log('saved',data);
        io.emit('message', data);
    })
    .catch(err => {
      console.log(err);
      return console.log('error',error);
    })
})


io.on('connection', (socket) =>{
  console.log('a user is connected')
  socket.on('is-typing', data => {
    console.log('user typing',data);
    str = data.name+ " "+"is typing..."
      // io.emit('broadcast', {data:str});
      socket.broadcast.emit('broadcast', {data:str});
  })
})

var server = http.listen(8000,"localhost", () => {
  console.log('server is running on port', server.address().port);
});
