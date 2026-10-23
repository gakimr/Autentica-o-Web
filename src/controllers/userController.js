function me(req, res) {
  res.json({ id: req.user.user_id, email: req.user.email, role: req.user.role });
}

module.exports = { me };
