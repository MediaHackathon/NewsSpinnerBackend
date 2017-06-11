const express = require('express');
const app = express();
const dbManager = require('./dbManager');
const bodyParser = require('body-parser');
const request = require('request');
const moment = require("moment");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/addRequests', (req, res) => {
  const input = req.body.input;
  const result = [];
  const promises = [];

  promises.push(new Promise(function(resolve, reject) {
    request.get(`https://kloop.kg/?s=${input}`, (err, data) => {
      const dom = new JSDOM(data.body);
      const urlsAndTitles = dom.window.document.querySelectorAll('.td-module-thumb');
      const results = [];
      const date = new Date();
      for (let i = 0; i < urlsAndTitles.length; i++) {
        results.push({
          url: urlsAndTitles[i].children[0].href,
          timestamp: moment(date).format(),
          title: urlsAndTitles[i].children[0].title
        })
      }
      resolve(results);
    })
  }));

  promises.push(new Promise(function(resolve, reject) {
    request.get(`http://zanoza.kg/?search=${input}`, (err, data) => {
      const dom = new JSDOM(data.body);
      const titles = dom.window.document.querySelectorAll('.n');
      const timestamps = dom.window.document.querySelectorAll('.topic_time_create');
      const urls = dom.window.document.querySelectorAll('.t');
      const results = [];

      for (let i = 0; i < titles.length; i++) {
        const date = timestamps[i].textContent;

        results.push(
          {
            title: titles[i].textContent,
            timestamp: moment(date, 'DD.MM.YYYY'),
            url: urls[i].children[0].href
          }
        )
      }

      resolve(results);
    })
  }));

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
              timestamp: moment(article.mediaDateUts, 'HH:mm A, MMM DD, YYYY').format()
            }
          )
        }
      });
      resolve(results);
  })
  }));

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
              timestamp: moment(new Date().setMilliseconds(article.modified)).format()
            }
          )
        }
      });
      resolve(results);
    })
  }));

  Promise.all(promises)
    .then((values) => {
      res.send({
        kloop: values[0],
        zanoza: values[1],
        cnn: values[2],
        lenta: values[3]
      })
    })
});

app.listen(3032, () => {
  console.log('Example app listening on port 3032!')
});
