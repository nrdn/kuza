var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });
var async = require('async');

var mongoose = require('mongoose'),
    models = require('./models/main.js');
      mongoose.connect('localhost', 'main');

var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    methodOverride = require('method-override'),
      app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.locals.pretty = true;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser({ keepExtensions: true, uploadDir:__dirname + '/uploads' }));
app.use(methodOverride());
app.use(cookieParser());

app.use(session({
  key: 'mgu.sess',
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
var Publish = models.Publish;
var Author = models.Author;
var Work = models.Work;
var Project = models.Project;
var Event = models.Event;
var Press = models.Press;
var License = models.License;


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


// ------------------------
// *** Post parms Block ***
// ------------------------


// ---------------------------------------------------


// ------------------------
// *** Main Block ***
// ------------------------


var main = app.route('/');

main.get(function(req, res) {
  res.render('main');
});


// ------------------------
// *** Works Block ***
// ------------------------


app.route('/works/since').get(function(req, res) {
  res.render('works/since.jade');
});

app.route('/works/grad').get(function(req, res) {
  res.render('works/grad.jade');
});

app.route('/works/events').get(function(req, res) {
  res.render('works/events.jade');
});

app.route('/works/publications').get(function(req, res) {
  res.render('works/publications.jade');
});

app.route('/works/work').get(function(req, res) {
  res.render('works/work.jade');
});

// ------------------------
// *** Publications Block ***
// ------------------------


app.route('/publications').get(function(req, res) {
  res.render('publications');
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
// *** Admin Publications Block ***
// ------------------------


app.route('/auth/publications/:author_id').get(checkAuth, function(req, res) {
  var author_id = req.params.author_id;

  Author.findById(author_id).populate('publishes').exec(function(err, author) {
    res.render('auth/publications', {author: author});
  });
});



// ------------------------
// *** Add Publications Block ***
// ------------------------


var add_publish = app.route('/auth/publications/:author_id/add');


add_publish.get(checkAuth, function(req, res) {
  res.render('auth/publications/add.jade');
});

add_publish.post(checkAuth, function(req, res) {
  var publish = new Publish();
  var id = req.params.author_id;
  var post = req.body;

  publish.title.ru = post.ru.title;
  publish.description.ru = post.ru.description;

  publish.save(function(err, publish) {
    Author.findById(id).exec(function(err, author) {
      author.publishes.push(publish._id);
      author.save(function(err, author) {
        res.redirect('/auth/publications/' + id);
      });
    });
  });
});


// ------------------------
// *** Edit Publications Block ***
// ------------------------


var edit_publish = app.route('/auth/publications/edit/:publish_id');


edit_publish.get(checkAuth, function(req, res) {
  var id = req.params.publish_id;

  Publish.findById(id).exec(function(err, publish) {
    res.render('auth/publications/edit.jade', {publish: publish});
  });
});

edit_publish.post(checkAuth, function(req, res) {
  var id = req.params.publish_id;
  var post = req.body;

  Publish.findById(id).exec(function(err, publish) {
    publish.title.ru = post.ru.title;
    publish.description.ru = post.ru.description;

    publish.save(function(err, publish) {
      res.redirect('back');
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


app.route('/auth/projects/add').get(checkAuth, function(req, res) {
  res.render('auth/projects/add.jade');
});

app.route('/auth/projects/add').post(checkAuth, function(req, res) {
  var project = new Project();
  var post = req.body;

  project.title.ru = post.ru.title;
  project.description.ru = post.ru.description;
  project.region = post.region;

  project.save(function(err, project) {
    res.redirect('/auth/projects');
  });
});


// ------------------------
// *** Edit Projects Block ***
// ------------------------


app.route('/auth/projects/edit/:project_id').get(checkAuth, function(req, res) {
  var id = req.params.project_id;

  Project.findById(id).exec(function(err, project) {
    res.render('auth/projects/edit.jade', {project: project});
  });
});



// ------------------------
// *** Admin Works Block ***
// ------------------------


app.route('/auth/works/:project_id').get(checkAuth, function(req, res) {
  var id = req.params.project_id;

  Project.findById(id).populate('works').exec(function(err, project) {
    res.render('auth/works', {project: project});
  });
});



// ------------------------
// *** Add Work Block ***
// ------------------------


var add_work = app.route('/auth/works/:project_id/add');

add_work.get(checkAuth, function(req, res) {
  res.render('auth/works/add.jade');
});

add_work.post(function(req, res) {
  var post = req.body;
  var work = new Work();
  var id = req.params.project_id;

  work.title.ru = post.ru.title;
  work.description.ru = post.ru.description;
  work.category = post.category;
  work.region = post.region;

  work.save(function(err, work) {
    Project.findById(id).exec(function(err, project) {
      project.works.push(work._id);
      project.save(function(err, project) {
        res.redirect('back');
      });
    });
  });
});


// ------------------------
// *** Edit Works Block ***
// ------------------------

var edit_works = app.route('/auth/works/edit/:id')

edit_works.get(checkAuth, function(req, res) {
  var id = req.params.id;

  Work.findById(id).exec(function(err, work) {
    res.render('auth/works/edit.jade', {work: work});
  });
});

edit_works.post(function(req, res) {
  var id = req.params.id;
  var post = req.body;
  var date_modify = new Date();

  Work.findById(id).exec(function(err, work) {
    work.title.ru = post.ru.title;
    work.description.ru = post.ru.description;
    work.category = post.category;

    work.save(function(err, work) {
      res.redirect('back');
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