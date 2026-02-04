const router = require('express').Router();
const c = require('../controllers/auth.controller');

router.post('/signup', c.signup);
router.post('/signup/verify', c.verifySignup);
router.post('/login', c.login);
router.post('/google', c.googleLogin);
router.post('/forgot-password', c.forgotPassword);
router.post('/reset-password', c.resetPassword);

module.exports = router;
