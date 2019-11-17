// variables:
var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var session = require('express-session');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: '0', saveUninitialized: true, resave: true }))

//middleware:
function loggedIn(req, res, next) {
  if (!req.session.user) {
      next();
  } else {
      res.redirect('/');
  }
}

//login page starts here:
app.get('/', function(req, res) {
  req.session.username = null
  res.render('login', { title: 'Express', error: ""});
});

app.post('/', function(req, res) {
  let users = loadUsers();
  var name = req.body.username;
  var pass = req.body.password;

  if(registered(users,name,pass)){
    if(req.session.username != null){
      res.render('login', { title: 'Express', error: "user "+ req.session.username + " is currently logged in using this session"});
    }
    else{
      req.session.username = name;
      res.render('home', { title: 'Express'}); 
    }
  } 
  else if(valid(users,name)){
    res.render('login', { title: 'Express', error: "there is no registered user with that username" });
  }
  else{
    res.render('login', { title: 'Express', error: "incorrect password" });
  }

});
//end of login

//home:
app.get('/home', loggedIn,function(req, res, next) {
  res.render('home', { title: 'Express'});
});
//end of home

//user registration starts here:
app.get('/registration', function(req, res) {
  res.render('registration', { title: 'Express' , status: "" });
});

app.post('/register', function(req, res) {
  var name = req.body.username;
  var pass = req.body.password;

  if(name == "" || pass == ""){
    res.render('registration', { title: 'Express', status: 'username or password cannot be empty' });
  }

  else if(addUser(name,pass)){
    res.render('registration', { title: 'Express', status: 'Registeration successful' });
  }

  else{
    res.render('registration', { title: 'Express', status: 'username is taken' });
  }
    
});
//end of registration

//search:
app.get('/search', loggedIn,function(req, res,next) {
  res.render('search', { title: 'Express' });
});
//end of search

//drama:
app.get('/drama',loggedIn,function(req, res,next) {
  res.render('drama', { title: 'Express' });
});

app.get('/godfather', loggedIn,function(req, res,next) {
  res.render('godfather', { title: 'Express' , inwatch: "" });
});

app.get('/godfather2', loggedIn,function(req, res,next) {
  res.render('godfather2', { title: 'Express', inwatch: "" });
});
//end of drama

//horror:
app.get('/horror',loggedIn, function(req, res,next) {
  res.render('horror', { title: 'Express' });
});

app.get('/scream',loggedIn, function(req, res,next) {
  res.render('scream', { title: 'Express', inwatch: "" });
});

app.get('/conjuring',loggedIn, function(req, res,next) {
  res.render('conjuring', { title: 'Express', inwatch: "" });
});
//end of horror

//action:
app.get('/action', loggedIn,function(req, res,next) {
  res.render('action', { title: 'Express' });
});

app.get('/fightclub', loggedIn,function(req, res,next) {
  res.render('fightclub', { title: 'Express', inwatch: "" });
});

app.get('/darkknight', loggedIn,function(req, res,next) {
  res.render('darkknight', { title: 'Express', inwatch: "" });
});
//end of action

//watchlist:
app.get('/watchlist',loggedIn, function(req, res,next) {
  let users = loadUsers();
  res.render('watchlist', { title: 'Express', watchlist: loadWatchList(users,req.session.username) });
});

app.post('/addmovie', function(req, res) {
  var link = "";

  switch (req.body.movieName) {
    case "The Godfather (1972)": link = "godfather";
    break;
    case "The Godfather: Part II (1974)": link = "godfather2";
    break;
    case "Scream (1996)": link = "scream";
    break;
    case "The Conjuring (2013)": link = "conjuring";
    break;
    case "Fight Club (1999)": link = "fightclub";
    break;
    case "The Dark Knight (2008)": link = "darkknight";
    break;
    default: break;
  }
  if(!addToWatchList(req.body.movieName,req.session.username))
    res.render(link, { title: 'Express' , inwatch: "Movie already in watchlist" });
  else
    res.redirect('back');
  
})
//end of watchlist

//search:
app.post('/search', function(req, res) {
  var inp = req.body.Search.toLowerCase()

  var movieNames = [
  {key: "thegodfather(1972)",Name: "The Godfather (1972)", link: "http://localhost:3000/godfather", img: "/godfather.jpg"},
  {key: "thegodfatherpartii(1974)",Name: "The Godfather: Part II (1974)", link: "http://localhost:3000/godfather2", img: "/godfather2.jpg"},
  {key: "scream(1996)",Name: "Scream (1996)", link: "http://localhost:3000/scream", img: "/scream.jpg"},
  {key: "theconjuring(2013)",Name: "The Conjuring (2013)", link: "http://localhost:3000/conjuring", img: "/conjuring.jpg"},
  {key: "fightclub(1999)",Name: "Fight Club (1999)", link: "http://localhost:3000/fightclub", img: "/fightclub.jpg"},
  {key: "thedarkknight(2008)",Name: "The Dark Knight (2008)", link: "http://localhost:3000/darkknight", img: "/darkknight.jpg"}
  ]
  var out = []

  for(var i in movieNames){
    if(canBe(inp, movieNames[i].key)){
      out.push(movieNames[i])
    }
  }
  res.render('searchresults', { title: 'Express', results: out});
});
// end of search

//helper fuctions:
let loadUsers = function(){
  try {
      let bufferedData = fs.readFileSync('users.json')
      let dataString = bufferedData.toString()
      let usersArray = JSON.parse(dataString)
      return usersArray
  } catch (error) {
      return []
  }
 
}

let loadWatchList = function(obj, user){
  for(var i in obj){
    if (obj[i].username == user){
      return obj[i].watchlist;
    } 
  }
  
  return null;
}

let addToWatchList = function(title,username){
  let users = loadUsers();
  for(var i in users){
    if (users[i].username == username){
      for(var j in users[i].watchlist){
        if(users[i].watchlist[j] == title){
          return false
        }
      }
      users[i].watchlist.push(title);
    } 
  }
  fs.writeFileSync('users.json', JSON.stringify(users))
  return true
}



let addUser = function(u, p){
  //load users array
  let users = loadUsers();

  if(!valid(users, u)) return false;
  //push new user in array
  users.push({"username": u, "password": p, "watchlist": []});
  //save users back in file
  fs.writeFileSync('users.json', JSON.stringify(users))

  return true;
}

function valid(obj,val) {

  for (var i in obj) {
      if (obj[i].username == val) return false;
  }

  return true;
}

function canBe(inp, str){
  var clean = ""

  for(var i in inp){
    if((inp[i] >= 'a' && inp[i] <= 'z') || (inp[i] >= '0' && inp[i] <= '9') || inp[i] == '(' || inp[i] == ')')
      clean += inp[i]
  }

  inp = inp.replace(/\s/g, '');

  if(inp == "") return true

  for(var i = 0; i < str.length - clean.length; i++){

    if(clean[0] == str[i]){
      var j = 0;
      for(j = 1; j < clean.length; j++){
        if(clean[j] != str[j+i]){
          break
        }
      }
      if(j == clean.length) return true
    }

  }

  return false
}

function registered(obj,user,pass) {

  for (var i in obj) {
      if (obj[i].username == user && obj[i].password == pass) return true;
  }

  return false;
}
//end of helper functions


module.exports = app;

//set port:
app.listen(3000, function(){ console.log("running") });
//---------------------------------------------------