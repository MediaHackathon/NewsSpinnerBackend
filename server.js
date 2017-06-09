const express = require('express')
const app = express();
const dbManager = require('./dbManager');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/getRequests', (req, res) => {
  dbManager.requests.getAll()
    .then((docs) => {
       res.send(docs);
    })
})

app.post('/addRequest', )

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
