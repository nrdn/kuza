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
var Member = models.Member;


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


function toMatrix(arr, row) {
  var a = [];
  for (var i = 0; i < row;) {
    a[i] ? a[i].push(arr.shift()) : (a[i] = []);
    i = ++i % row;
    if (!arr.length) return a;
  }
}


// ------------------------
// *** Post parms Block ***
// ------------------------


app.route('/upload').post(function(req, res) {
  var files = req.files;
  var date = new Date();
  date = date.getTime();
  var newPath = '/preview/' + date + '.' + files.image.extension;

  gm(files.image.path).resize(1600, false).quality(80).noProfile().write(__dirname + '/public' + newPath, function() {
    res.send(newPath);
  });
});


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
  Project.find().where('old').ne(true).sort('-date').exec(function(err, projects) {
    var columns = toMatrix(projects, 5);
    res.render('projects', {columns: columns});
  });
});

app.route('/projects/:id').get(function(req, res) {
  var id = req.params.id;

  Project.findById(id).exec(function(err, project) {
    var second = toMatrix(project.images.second, 3);
    var maps = toMatrix(project.images.maps, 5);

    res.render('projects/project.jade', {project: project, images_second_columns: second, images_maps_columns: maps});
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
// *** Admin Mmembers Block ***
// ------------------------


app.route('/auth/members').get(checkAuth, function(req, res) {
  Member.find().exec(function(err, members) {
    res.render('auth/members/', {members: members});
  });
});


// ------------------------
// *** Add Member Block ***
// ------------------------


var add_members = app.route('/auth/members/add');

add_members.get(checkAuth, function(req, res) {
  res.render('auth/members/add.jade');
});

add_members.post(checkAuth, function(req, res) {
  var post = req.body;
  var files = req.files;

  var member = new Member();

  member.name.ru = post.ru.name;
  member.description.ru = post.ru.description;
  member.category = post.category;

  member.save(function(err, member) {
    res.redirect('/auth/members');
  });
});


// ------------------------
// *** Edit Members Block ***
// ------------------------


var edit_members = app.route('/auth/members/edit/:id');


edit_members.get(checkAuth, function(req, res) {
  var id = req.params.id;

  Member.findById(id).exec(function(err, member) {
    res.render('auth/members/edit.jade', {member: member});
  });
});

edit_members.post(checkAuth, function(req, res) {
  var post = req.body;
  var id = req.params.id;

  Member.findById(id).exec(function(err, member) {

    member.name.ru = post.ru.name;
    member.description.ru = post.ru.description;

    member.save(function(err, member) {
      res.redirect('/auth/members');
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
  project.old = post.old;

  var public_path = __dirname + '/public';

  var path = {
    main: '/images/projects/' + project._id + '/main/',
    second: '/images/projects/' + project._id + '/second/',
    maps: '/images/projects/' + project._id + '/maps/'
  }

  fs.mkdir(public_path + '/images/projects/' + project._id);

  var single = function(type, callback) {
    fs.mkdir(public_path + path[type], function() {
      fs.rename(public_path + post.images[type], public_path + path[type] + post.images[type].split('/')[2]);
      project.images[type] = path[type] + post.images[type].split('/')[2];
      callback(null, type);
    });
  }

  var multi = function(type, callback) {
    fs.mkdir(public_path + path[type], function() {
      async.forEach(post.images[type], function(image, loop_callback) {
        fs.rename(public_path + image.path, public_path + path[type] + image.path.split('/')[2]);
        project.images[type].push({
          path: path[type] + image.path.split('/')[2],
          description: image.description
        });
        loop_callback();
      }, function() {
        callback(null, type);
      });
    });
  }

  async.parallel([
    async.apply(single, 'main'),
    async.apply(multi, 'second'),
    async.apply(multi, 'maps')
  ], function(err, results) {
    project.save(function(err, project) {
      res.send(project);
    });
  });

});


// ------------------------
// *** Edit Projects Block ***
// ------------------------


var edit_projects = app.route('/auth/projects/edit/:project_id');

edit_projects.get(checkAuth, function(req, res) {
  var id = req.params.project_id;
  var public_path = __dirname + '/public';
  var images = {
    main: '',
    second: [],
    maps: []
  }

  Project.findById(id).exec(function(err, project) {

    var single_move = function(type, callback) {
      var preview_path = '/preview/' + project.images[type].split('/')[5];
      images.main = preview_path;
      fs.createReadStream(public_path + project.images[type]).pipe(fs.createWriteStream(public_path + preview_path));
      callback(null, type);
    }

    var multi_move = function(type, callback) {
      async.forEach(project.images[type], function(image, loop_callback) {
        var preview_path = '/preview/' + image.path.split('/')[5];

        images[type].push(preview_path);
        fs.createReadStream(public_path + image.path).pipe(fs.createWriteStream(public_path + preview_path));
        loop_callback();

      }, function() {
        callback(null, type);
      });
    }

    async.parallel([
      async.apply(single_move, 'main'),
      async.apply(multi_move, 'second'),
      async.apply(multi_move, 'maps')
    ], function() {
      res.render('auth/projects/edit.jade', {project: project, images: images});
    });

  });
});

edit_projects.post(checkAuth, function(req, res) {
  var id = req.params.project_id;
  var post = req.body;

  Project.findById(id).exec(function(err, project) {

    project.title.ru = post.ru.title;
    project.description.ru = post.ru.description;
    project.category = post.category;
    project.old = post.old;

    var public_path = __dirname + '/public';

    var path = {
      main: '/images/projects/' + project._id + '/main/',
      second: '/images/projects/' + project._id + '/second/',
      maps: '/images/projects/' + project._id + '/maps/'
    }

    fs.mkdir(public_path + '/images/projects/' + project._id);

    var single = function(type, callback) {
      fs.mkdir(public_path + path[type], function() {
        fs.rename(public_path + post.images[type], public_path + path[type] + post.images[type].split('/')[2]);
        project.images[type] = path[type] + post.images[type].split('/')[2];
        callback(null, type);
      });
    }

    var multi = function(type, callback) {
      project.images[type] = [];
      fs.mkdir(public_path + path[type], function() {
        async.forEach(post.images[type], function(image, loop_callback) {
          fs.rename(public_path + image.path, public_path + path[type] + image.path.split('/')[2]);
          project.images[type].push({
            path: path[type] + image.path.split('/')[2],
            description: image.description
          });
          loop_callback();
        }, function() {
          callback(null, type);
        });
      });
    }

    async.parallel([
      async.apply(single, 'main'),
      async.apply(multi, 'second'),
      async.apply(multi, 'maps')
    ], function(err, results) {
      project.save(function(err, project) {
        res.send(project);
      });
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