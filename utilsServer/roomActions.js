const users = [];

const removeUser = async (socketId) => {
  const indexOf = users.map((user) => user.socketId).indexOf(socketId);

  await users.splice(indexOf, 1);
};

const addUser = async (userId, socketId) => {
  const user = users.find((user) => user.userId === userId);

  if (user && user.socketId === socketId) {
    return users;
  }
  if (user && user.socketId !== socketId) {
    await removeUser(user.socketId);
  }

  const newUser = { userId, socketId };

  users.push(newUser);

  return users;
};

module.exports = { addUser, removeUser };
