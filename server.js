const app = require('express')();
const server = require('http').Server(app);
const next = require('next');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const io = require('socket.io')(server);

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const connectDb = require('./utilsServer/connectDb');
const { addUser, removeUser } = require('./utilsServer/roomActions');
const { loadMessages } = require('./utilsServer/messageActions');

const signup = require('./api/signup');
const auth = require('./api/auth');
const search = require('./api/search');
const posts = require('./api/posts');
const profile = require('./api/profile');
const notifications = require('./api/notifications');
const chats = require('./api/chats');

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 3000;
connectDb();

io.on('connection', (socket) => {
  socket.on('join', async ({ userId }) => {
    const users = await addUser(userId, socket.id);

    setInterval(() => {
      socket.emit('connectedUsers', {
        users: users.filter((user) => user.userId !== userId),
      });
    }, 10000);
  });

  socket.on('loadMessages', async ({ userId, messagesWith }) => {
    const { chat, error } = await loadMessages(userId, messagesWith);

    if (!error) {
      socket.emit('messagesLoaded', { chat });
    }
  });

  socket.on('disconnect', () => {
    removeUser(socket.id);
    console.log('User disconnected');
  });
});

nextApp.prepare().then(() => {
  app.use(bodyParser.json());

  app.use('/api/signup', signup);
  app.use('/api/auth', auth);
  app.use('/api/search', search);
  app.use('/api/posts', posts);
  app.use('/api/profile', profile);
  app.use('/api/notifications', notifications);
  app.use('/api/chats', chats);

  app.all('*', (req, res) => handle(req, res));

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.warn(`Express server running on ${PORT}`);
  });
});
