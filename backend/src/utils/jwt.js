const jwt = require('jsonwebtoken');

function signToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const secret = process.env.JWT_SECRET || 'change_me';
  const expiresIn = '1h';

  return jwt.sign(payload, secret, { expiresIn });
}

module.exports = {
  signToken,
};


