'use strict';

let { Krax } = require('krax')
  , krax = new Krax()
  , app = require('express')()
  , port = 11181;

app.get('/', (req, res) => {
  let query = req.query.q && decodeURIComponent(req.query.q).trim()
    , limit = parseInt(req.query.limit) || 0
    , lat = parseFloat(req.query.lat)
    , lon = parseFloat(req.query.lon)
    , promise;

  if (!query) {
    res.status(400).send('Missing ?q parameter');
    return;
  }

  promise = lat && lon
    ? krax.searchByDistance(query, lat, lon, limit)
    : krax.searchByRelevance(query, limit);

  promise
    .then(results => res.send(results))
    .catch(reason => res.status(500).send(reason));
});

app.listen(port);
console.log('Listening on http://localhost:%s/', port);
