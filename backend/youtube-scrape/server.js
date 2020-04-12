const express = require('express');
const scraper = require('./scraper')
const app = express();

//Home page
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + "/index.html");
// });

//API route
app.get('/api/search', (req, res) => {
    scraper.youtube(req.query.q, req.query.page)
        .then(x => res.json(x))
        .catch(e => res.send(e));
});

app.listen(process.env.PORT || 8080, function () {
  console.log('Listening on port 8080');
});

module.exports = app;

// const scraper = require('./scraper')
// scraper.youtube('korn - freak on a leash')
//   .then(x => {
//     console.log(JSON.stringify(x))
//   })
