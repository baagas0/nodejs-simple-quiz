const router = require('express').Router();
const { quiz } = require('../controllers');
const verifyToken = require('../configs/verify');

router.post('/list', verifyToken, quiz.list);
router.post('/start', verifyToken, quiz.start);
router.post('/answer', verifyToken, quiz.answer);

module.exports = router;