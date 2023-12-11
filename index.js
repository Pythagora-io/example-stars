require('dotenv').config();
const express = require('express');
const connectToMongo = require('./config/db');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const githubRoutes = require('./routes/githubRoutes');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

connectToMongo();

app.use(session({
  secret: process.env.SESSION_SECRET || 'mysecretkey',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/stars' }),
  cookie: { secure: false }
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use(function(req, res, next) {
  const publicPaths = ['/user/login', '/user/register'];
  if (req.session.userId && publicPaths.includes(req.path)) {
    return res.redirect('/user/homepage');
  }
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', userRoutes);
app.use('/github', githubRoutes);

app.get('/', (req, res) => {
  res.redirect('/user/login');
});

app.listen(port, () => {
  console.log('Server running on port ' + port);
});
