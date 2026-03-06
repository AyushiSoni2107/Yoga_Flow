const requirePractitioner = (req, res, next) => {
  if (!req.user || req.user.role !== 'practitioner') {
    return res.status(403).json({ message: 'Learner access required.' });
  }
  if (req.user.account_status !== 'active') {
    return res.status(403).json({ message: 'Your learner account is not active.' });
  }
  return next();
};

module.exports = requirePractitioner;
