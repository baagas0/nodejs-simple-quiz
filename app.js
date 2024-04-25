const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', require('./src/routes/route-auth'));
app.use('/question', require('./src/routes/route-question'));
app.use('/quiz', require('./src/routes/route-quiz'));

app.listen(8000, ()=>{
    console.log('Server Berjalan di Port : 8000');
});