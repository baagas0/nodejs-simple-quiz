const router = require('express').Router();
const { question } = require('../controllers');
const verifyToken = require('../configs/verify');

router.get('/list', verifyToken, question.list);
router.post('/create', verifyToken, question.create);
router.post('/update', verifyToken, question.update);
router.delete('/delete', verifyToken, question.delete);

module.exports = router;