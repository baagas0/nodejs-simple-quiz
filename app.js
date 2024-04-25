const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', require('./src/routes/route-auth'));
app.use('/question', require('./src/routes/route-question'));
app.use('/quiz', require('./src/routes/route-quiz'));

const port = process.env.PORT
app.listen(port, ()=>{
    console.log(`Server Berjalan di Port : ${port}`);
});