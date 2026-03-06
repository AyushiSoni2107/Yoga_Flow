const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  if (req.user.account_status !== 'active') {
    return res.status(403).json({ message: 'Your admin account is not active.' });
  }
  return next();
};

module.exports = requireAdmin;
