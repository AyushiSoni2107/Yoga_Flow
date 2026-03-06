const jwt = require('jsonwebtoken');

const signToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

module.exports = signToken;
