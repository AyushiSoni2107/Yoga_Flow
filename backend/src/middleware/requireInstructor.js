const requireInstructor = (req, res, next) => {
  if (!req.user || req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Instructor access required.' });
  }
  if (req.user.account_status !== 'active') {
    return res.status(403).json({ message: 'Your instructor account is not active.' });
  }
  if (req.user.instructor_status !== 'approved') {
    return res.status(403).json({ message: 'Instructor approval required.' });
  }
  return next();
};

module.exports = requireInstructor;
