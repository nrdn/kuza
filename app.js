var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });
var async = require('async');

var mongoose = require('mongoose'),
    models = require('./models/main.js');
      mongoose.connect('localhost', 'main');

var express = require('express'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    methodOverride = require('method-override'),
      app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.locals.pretty = true;

app.use(express.static(__dirname + '/public'));
app.use(multer({ dest: __dirname + '/uploads'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(cookieParser());

app.use(session({
  key: 'kuzmin.sess',
  resave: false,
  saveUninitialized: false,
  secret: 'keyboard cat',
  cookie: {
    path: '/',
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));


app.use(function(req, res, next) {
  res.locals.session = req.session;
  res.locals.locale = req.cookies.locale || 'ru';
  next();
});


// app.use(function(req, res, next) {
//   res.status(404);

//   // respond with html page
//   if (req.accepts('html')) {
//     res.render('error', { url: req.url, status: 404 });
//     return;
//   }

//   // respond with json
//   if (req.accepts('json')) {
//       res.send({
//       error: {
//         status: 'Not found'
//       }
//     });
//     return;
//   }

//   // default to plain-text
//   res.type('txt').send('Not found');
// });

// app.use(function(err, req, res, next) {
//   var status = err.status || 500;

//   res.status(status);
//   res.render('error', { error: err, status: status });
// });


// -------------------
// *** Model Block ***
// -------------------


var User = models.User;
var Member = models.Member;
var Project = models.Project;


// ------------------------
// *** Midleware Block ***
// ------------------------


function checkAuth (req, res, next) {
  if (req.session.user_id)
    next();
  else
    res.redirect('/login');
}


// ------------------------
// *** Handlers Block ***
// ------------------------


var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

function toMatrix(arr, rowCount) {
  var row = 0, martrix = [], curIndex = 0;
  var rows = Math.ceil(arr.length/rowCount);

  for(var i = 0; i < arr.length; i++) {
    if (martrix[row] == undefined) {
      martrix[row] = [];
    }
    martrix[row].push(arr[i]);
    row++;
    if (row > rowCount) {
      row = 0;
    }
  }
  return martrix;
}


// ------------------------
// *** Post parms Block ***
// ------------------------


// ---------------------------------------------------


// ------------------------
// *** Index Block ***
// ------------------------


app.route('/').get(function(req, res) {
  res.render('main');
});


// ------------------------
// *** Company Block ***
// ------------------------


app.route('/company').get(function(req, res) {
  res.render('company');
});


// ------------------------
// *** Projects Block ***
// ------------------------


app.route('/projects').get(function(req, res) {
  Project.find().sort('-date').lean().exec(function(err, projects) {
    var columns = toMatrix(projects, 4);
    res.render('projects', {columns: columns});
  });
});


// ------------------------
// *** Kuzmin Block ***
// ------------------------


app.route('/kuzmin').get(function(req, res) {
  res.render('kuzmin');
});


// ------------------------
// *** Set Locale Block ***
// ------------------------


app.route('/lang/:locale').get(function(req, res) {
  res.cookie('locale', req.params.locale);
  res.redirect('back');
});


// ------------------------
// *** Auth Block ***
// ------------------------


app.route('/auth').get(checkAuth, function (req, res) {
  res.render('auth');
});


// ------------------------
// *** Admin Authors Block ***
// ------------------------


app.route('/auth/authors').get(checkAuth, function(req, res) {
  Author.find().exec(function(err, authors) {
    res.render('auth/authors/', {authors: authors});
  });
});


// ------------------------
// *** Add Authors Block ***
// ------------------------


var add_authors = app.route('/auth/authors/add');

add_authors.get(checkAuth, function(req, res) {
  res.render('auth/authors/add.jade');
});

add_authors.post(checkAuth, function(req, res) {
  var post = req.body;
  var files = req.files;

  var author = new Author();

  author.name.ru = post.ru.name;
  author.description.ru = post.ru.description;

  author.save(function(err, author) {
    res.redirect('/auth/authors');
  });
});


// ------------------------
// *** Edit Authors Block ***
// ------------------------


var edit_authors = app.route('/auth/authors/edit/:id');


edit_authors.get(checkAuth, function(req, res) {
  var id = req.params.id;

  Author.findById(id).exec(function(err, author) {
    res.render('auth/authors/edit.jade', {author: author});
  });
});

edit_authors.post(checkAuth, function(req, res) {
  var post = req.body;
  var id = req.params.id;

  Author.findById(id).exec(function(err, author) {

    author.name.ru = post.ru.name;
    author.description.ru = post.ru.description;

    author.save(function(err, work) {
      res.redirect('/auth/authors');
    });
  });
});


// ------------------------
// *** Admin Projects Block ***
// ------------------------


app.route('/auth/projects').get(checkAuth, function(req, res) {
  Project.find().exec(function(err, projects) {
    res.render('auth/projects', {projects: projects});
  });
});


// ------------------------
// *** Add Projects Block ***
// ------------------------


var add_project = app.route('/auth/projects/add');

add_project.get(checkAuth, function(req, res) {
  res.render('auth/projects/add.jade');
});

add_project.post(checkAuth, function(req, res) {
  var project = new Project();
  var post = req.body;
  var files = req.files;

  project.title.ru = post.ru.title;
  project.description.ru = post.ru.description;
  project.category = post.category;


  if (files.image.size != 0) {
    var newPath = __dirname + '/public/images/projects/' + project._id + '/main.jpg';

    fs.mkdir(__dirname + '/public/images/projects/' + project._id, function() {
      gm(files.image.path).resize(1600, false).quality(80).noProfile().write(newPath, function() {
        project.images.main = '/images/projects/' + project._id + '/main.jpg';
        project.save(function() {
          fs.unlink(files.image.path);
          res.redirect('/auth/projects');
        });
      });
    });
  }
  else {
    project.save(function() {
      fs.unlink(files.image.path);
      res.redirect('/auth/projects');
    });
  }



  // project.save(function(err, project) {
  //   res.redirect('/auth/projects');
  // });
});


// ------------------------
// *** Edit Projects Block ***
// ------------------------


var edit_projects = app.route('/auth/projects/edit/:project_id');

edit_projects.get(checkAuth, function(req, res) {
  var id = req.params.project_id;

  Project.findById(id).exec(function(err, project) {
    res.render('auth/projects/edit.jade', {project: project});
  });
});

edit_projects.post(checkAuth, function(req, res) {
  var id = req.params.project_id;
  var post = req.body;

  Project.findById(id).exec(function(err, project) {

    project.title.ru = post.ru.title;
    project.description.ru = post.ru.description;
    project.category = post.category;

    project.save(function(err, project) {
      res.redirect('/auth/projects');
    });

  });
});


// ------------------------
// *** Login Block ***
// ------------------------


var login = app.route('/login');

login.get(function (req, res) {
  res.render('login');
});

login.post(function(req, res) {
  var post = req.body;

  User.findOne({ 'login': post.login, 'password': post.password }, function (err, person) {
    if (!person) return res.redirect('back');
    req.session.user_id = person._id;
    req.session.status = person.status;
    req.session.login = person.login;
    res.redirect('/auth');
  });
});


// ------------------------
// *** Logout Block ***
// ------------------------


app.route('/logout').get(function (req, res) {
  delete req.session.user_id;
  delete req.session.login;
  delete req.session.status;
  res.redirect('back');
});


// ------------------------
// *** Registr Block ***
// ------------------------


var registr = app.route('/registr');

registr.get(function(req, res) {
  if (!req.session.user_id)
    res.render('registr');
  else
    res.redirect('/');
});

registr.post(function (req, res) {
  var post = req.body;

  var user = new User({
    login: post.login,
    password: post.password,
    email: post.email
  });

  user.save(function(err, user) {
    if(err) {throw err;}
    console.log('New User created');
    req.session.user_id = user._id;
    req.session.login = user.login;
    req.session.status = user.status;
    res.redirect('/login');
  });
});


// ------------------------
// *** Static Block ***
// ------------------------


app.route('/contacts').get(function (req, res) {
  res.render('static/contacts.jade');
});

app.route('/sitemap.xml').get(function(req, res){
  res.sendfile('sitemap.xml',  {root: './public'});
});

app.route('/robots.txt').get(function(req, res){
  res.sendfile('robots.txt',  {root: './public'});
});


// ------------------------
// *** Other Block ***
// ------------------------


app.listen(3000);
console.log('http://127.0.0.1:3000')