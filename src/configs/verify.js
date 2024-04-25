const jwt = require('jsonwebtoken');
const secret_key = "ksagdiyhjUYGJHGjfsadyugjHGSjkafdu91263&^%&^%(%&^"

function verifyToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const decoded = jwt.verify(token, secret_key);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = verifyToken;