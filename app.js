const express = require('express');
const app = express();
// шаблонизатор ejs
const ejs = require('ejs');
app.set('view engine', 'ejs');

// использование статических файлов
app.use(express.static('public'));

app
  .get('/', (req, res, next) => {
    res.render('index', {
      name: 'Zolo'
    });
  })
  .listen(3000, () => {
    console.log('Server started');
  });
