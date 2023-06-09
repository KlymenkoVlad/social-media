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
const {
  addUser,
  removeUser,
  findConnectedUser,
} = require('./utilsServer/roomActions');
const {
  loadMessages,
  sendMsg,
  setMsgToUnread,
  deleteMsg,
} = require('./utilsServer/messageActions');

const { likeOrUnlikePost } = require('./utils/likeOrUnlikePost');

const signup = require('./api/signup');
const auth = require('./api/auth');
const search = require('./api/search');
const posts = require('./api/posts');
const profile = require('./api/profile');
const notifications = require('./api/notifications');
const chats = require('./api/chats');
const reset = require('./api/reset');

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

  socket.on('likePost', async ({ postId, userId, like }) => {
    const { success, error, name, profilePicUrl, username, postByUserId } =
      await likeOrUnlikePost(postId, userId, like);

    if (success) {
      socket.emit('postLiked');

      if (postByUserId !== userId) {
        const receiverSocket = findConnectedUser(postByUserId);

        if (receiverSocket && like) {
          // when you want ot send date to one particular client
          io.to(receiverSocket.socketId).emit('newNotificationReceived', {
            name,
            profilePicUrl,
            username,
            postId,
          });
        }
      }
    }
  });

  socket.on('loadMessages', async ({ userId, messagesWith }) => {
    const { chat, error } = await loadMessages(userId, messagesWith);

    !error
      ? socket.emit('messagesLoaded', { chat })
      : socket.emit('noChatFound');
  });

  socket.on('sendNewMsg', async ({ userId, msgSendToUserId, msg }) => {
    const { newMsg, error } = await sendMsg(userId, msgSendToUserId, msg);
    const receiverSocket = findConnectedUser(msgSendToUserId);

    if (receiverSocket) {
      // WHEN YOU WANT TO SEND MESSAGE TO A PARTICULAR SOCKET
      io.to(receiverSocket.socketId).emit('newMsgReceived', { newMsg });
    }
    //
    else {
      await setMsgToUnread(msgSendToUserId);
    }

    !error && socket.emit('msgSent', { newMsg });
  });

  socket.on('deleteMsg', async ({ userId, messagesWith, messageId }) => {
    const { success } = await deleteMsg(userId, messagesWith, messageId);

    if (success) socket.emit('msgDeleted');
  });

  socket.on(
    'sendMsgFromNotification',
    async ({ userId, msgSendToUserId, msg }) => {
      const { newMsg, error } = await sendMsg(userId, msgSendToUserId, msg);
      const receiverSocket = findConnectedUser(msgSendToUserId);

      if (receiverSocket) {
        // WHEN YOU WANT TO SEND MESSAGE TO A PARTICULAR SOCKET
        io.to(receiverSocket.socketId).emit('newMsgReceived', { newMsg });
      }
      //
      else {
        await setMsgToUnread(msgSendToUserId);
      }

      !error && socket.emit('msgSentFromNotification');
    }
  );

  socket.on('userDisconnect', () => removeUser(socket.id));
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
  app.use('/api/reset', reset);

  app.all('*', (req, res) => handle(req, res));

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.warn(`Express server running on ${PORT}`);
  });
});
