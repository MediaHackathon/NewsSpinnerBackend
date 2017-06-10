const express = require('express')
const app = express();
const dbManager = require('./dbManager');
const bodyParser = require('body-parser');
const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/addRequests', (req, res) => {
  const input = req.body.input;
  const result = [];
  const promises = []
  promises.push(new Promise(function(resolve, reject) {
    request.get(`http://searchapp.cnn.com/search/query.jsp?page=1&npp=10&start=1&text=${input}&type=all&bucket=true&sort=relevance&csiID=csi1`, (err, data) => {
    const dom = new JSDOM(data.body);
    const testReg = new RegExp(input, 'ig');
    const articles = JSON.parse(dom.window.document.querySelector("#jsCode").value).results;
    const results = [];
      articles[0].forEach((article) => {
        if (testReg.test(article.title)) {
          results.push(
            {
              text: article.description,
              title: article.title,
              url: article.url,
              timestamp: article.mediaDateUts
            }
          )
        };
      })
      resolve(results);
  })
  }))

  promises.push(new Promise(function(resolve, reject) {
    request.get(`https://lenta.ru/search/v2/process?from=0&size=100&sort=2&title_only=0&domain=1&modified%2Cformat=yyyy-MM-dd&query=${input}`, (err, data) => {
      const articles = JSON.parse(data.body).matches;
      const testReg = new RegExp(input, 'ig');
      const results = [];
      articles.forEach((article) => {
        if (testReg.test(article.title)) {
          results.push(
            {
              text: article.text,
              title: article.title,
              url: article.url,
              timestamp: article.modified
            }
          )
        };
      })
      resolve(results);
    })
  }))

  Promise.all(promises)
    .then((values) => {
      res.send({
        cnn: values[0],
        lenta: values[1]
      })
    })


})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
