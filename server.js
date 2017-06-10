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

  const result = {};
  result.cnn = [{"url":"http://edition.cnn.com/2017/03/07/politics/jason-chaffetz-health-care-iphone-twitter/index.html","title":"Twitter criticizes Chaffetz for comparing health care costs to iPhone costs JUST WATCHED Paid","timestamp":"17:29 PM, Mar 07, 2017","text":"Rep. Jason Chaffetz, R-Utah, is being criticized for defending Republicans' Obamacare replacement bill by stating lower income citizens might be forced to prioritize health care over \"getting that new iPhone.\""},{"url":"http://edition.cnn.com/2017/03/07/politics/jason-chaffetz-health-care-iphones/index.html","title":"Chaffetz walks back remarks on low-income Americans choosing health care over iPhones JUST","timestamp":"13:45 PM, Mar 07, 2017","text":"A Republican lawmaker on Tuesday walked back his remarks earlier in the day that low-income Americans may have to prioritize purchasing health care coverage over gadgets such as iPhones under Republicans' Obamacare replacement plan."},{"url":"http://money.cnn.com/video/technology/2017/01/06/happy-birthday-iphone-turns-10-years-old.cnnmoney/index.html","title":"Happy 10th birthday, iPhone","timestamp":"09:18 AM, Feb 22, 2017","text":"The first iPhone was announced on January 9th, 2007. Here's a look at a decade of iPhones."},{"url":"http://money.cnn.com/2017/02/13/technology/apple-wireless-charging/index.html","title":"Will the iPhone 8 charge wirelessly?","timestamp":"02:42 AM, Feb 13, 2017","text":"The days of plugging in an iPhone to charge won't last forever."},{"url":"http://money.cnn.com/2017/02/01/investing/apple-stock-price-earnings-iphone-8/index.html","title":"Apple soars to 18-month highs as Wall Street eyes iPhone 8","timestamp":"12:19 PM, Feb 01, 2017","text":"Apple shares surged 6% on Wednesday to their highest level since July 2015 as the company's latest earnings report raised hopes for strong demand for the iPhone 8."},{"url":"http://money.cnn.com/2017/01/25/technology/apple-india-manufacturing-iphones/index.html","title":"Apple wants to start making iPhones in India","timestamp":"09:35 AM, Jan 25, 2017","text":"Apple executives met Indian government officials this week to discuss plans to make iPhones in the country."},{"url":"http://money.cnn.com/2017/01/11/technology/foxconn-sales-slump-apple/index.html","title":"Apple's iPhone supplier posts rare sales decline","timestamp":"11:44 AM, Jan 11, 2017","text":"The iPhone sales slump may be dragging down one of Apple's top suppliers."},{"url":"http://money.cnn.com/2017/01/09/technology/iphone-10th-anniversary/index.html","title":"Apple marks iPhone's 10th anniversary The iPhone turns 10: Insiders share","timestamp":"10:24 AM, Jan 09, 2017","text":"Steve Jobs unveiled the original iPhone 10 years ago Monday. Apple insiders who were there look back on the day that changed Apple and what comes next."},{"url":"http://money.cnn.com/video/technology/2017/01/06/the-original-iphone-click-wheel-prototype.cnnmoney/index.html","title":"The original iPhone almost looked like this","timestamp":"03:38 AM, Jan 06, 2017","text":"An early prototype for Apple's original iPhone had a virtual click-wheel, but the feature was abandoned before its initial release."},{"url":"http://money.cnn.com/2017/01/06/technology/iphone-click-wheel-prototype/index.html","title":"This crazy click-wheel software was Apple's prototype for the iPhone","timestamp":"10:14 AM, Jan 06, 2017","text":"An early prototype of the iPhone reveals how Apple considered making its iconic smartphone more iPod than phone."}]

  request.get(`https://lenta.ru/search/v2/process?from=0&size=100&sort=2&title_only=0&domain=1&modified%2Cformat=yyyy-MM-dd&query=${input}`, (err, data) => {
    const articles = JSON.parse(data.body).matches;
    const testReg = new RegExp(input, 'ig');
    result.lenta = [];
    articles.forEach((article) => {
      if (testReg.test(article.title)) {
        result.lenta.push(
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
