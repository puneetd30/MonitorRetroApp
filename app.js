const express = require('express');
const app = express();
const port = process.env.PORT || 3003;
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const config = require('./config');
var MongoClient = require('mongodb').MongoClient;


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const cron = require('node-cron');

cron.schedule('0 1 * * *', () => {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  MongoClient.connect(`${config.url}`, async (err, client) => {
    if (err) throw err;
    let db = client.db();

    db.collection('app').find({}).toArray((err, result) => {
      if (err) throw err;
      result.forEach(r => {
        const appRetro = {};
        db.collection(r._id).find({ 'status': 'down', 'createTime': { '$gte': yesterday, '$lt': today } })
          .toArray((err, res) => {
            console.log(res);
            if (res.length == 0) {
              appRetro.status = 'green';
              return;
            }
            res.forEach(r => {
              appRetro.status = 'yellow';
            });
          });

        db.collection('incidents').find({ 'appName': r._id, 'startTime': { '$gte': yesterday, '$lt': today } })
          .toArray((err, res) => {
            let incidentsArr = []

            if (res.length == 0) {
              db.collection(`${r._id}_retro`).insertOne({ status: appRetro.status, incidents: [], reportDate: yesterday, createTime: new Date(Date.now()) });
              return;
            }
            res.forEach(r => {
              console.log(r);
              incidentsArr.push(r);
            });
            db.collection(`${r._id}_retro`).insertOne({ status: appRetro.status, incidents: incidentsArr.length == 0 ? [] : incidentsArr, reportDate: yesterday, createTime: new Date(Date.now()) });
          });

        console.log(appRetro);

      });


    });
  });


});