const express = require('express')
const app = express();
const dbManager = require('./dbManager');
const bodyParser = require('body-parser');
const request = require('request');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/getRequests', (req, res) => {
  dbManager.requests.getAll()
    .then((docs) => {
       res.send(docs);
    })
})

app.post('/addRequests', (req, res) => {
  const input = req.body.input;
  request.get(`https://lenta.ru/search/v2/process?from=0&size=10&sort=2&title_only=0&domain=1&modified%2Cformat=yyyy-MM-dd&query=${input}`, (err, data) => {
    const articles = JSON.parse(data.body).matches;
    const testReg = new RegExp(input, 'ig');
    const result = [];
    articles.forEach((article) => {
      if (testReg.test(article.title)) {
        result.push(
          {
            text: article.text,
            title: article.title,
            url: article.url,
            timestamp: article.modified
          }
        )
      };
    })
    res.send(result);
  })
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
