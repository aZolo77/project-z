// === устанавливаем express ===
const express = require('express');
const app = express();

// === шаблонизатор ejs ===
const ejs = require('ejs');
app.set('view engine', 'ejs');

// === parser ===
const bodyParser = require('body-parser');

// === подключение routes ===
const routes = require('./routes');

// === использование статических файлов ===
app.use(express.static('public'));

// использовать body-parser для декодирования url, json, post-запросов и т.д.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// === routes ===
app.use('/', routes.tts);

app.get('/', (req, res, next) => {
  res.render('index', {
    name: 'Zolo'
  });
});

// === Порт ===
app.listen(3000, () => {
  console.log('Server started');
});
