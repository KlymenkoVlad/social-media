const app = require('express')();
const server = require('http').Server(app);
const next = require('next');
const bodyParser = require('body-parser');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const dotenv = require('dotenv');
const connectDb = require('./utilsServer/connectDb');

const signup = require('./api/signup');
const auth = require('./api/auth');
const search = require('./api/search');
const posts = require('./api/posts');
const profile = require('./api/profile');

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 3000;
connectDb();

nextApp.prepare().then(() => {
  app.use(bodyParser.json());

  app.use('/api/signup', signup);
  app.use('/api/auth', auth);
  app.use('/api/search', search);
  app.use('/api/posts', posts);
  app.use('/api/profile', profile);

  app.all('*', (req, res) => handle(req, res));

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Express server running on ${PORT}`);
  });
});
