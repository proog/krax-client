'use strict';

let jsdom = require('jsdom')
  , jQuery = require('jquery');

module.exports = {
  search: searchByRelevance,
  searchByRelevance: searchByRelevance,
  searchByDistance: searchByDistance
};

function searchByRelevance (query, limit) {
  let url = 'http://www.krak.dk/person/resultat/' + encodeURIComponent(query);
  return search (url, limit);
}

function searchByDistance (query, lat, lon, limit) {
  let url = 'http://www.krak.dk/query?what=ps&proximity_area=proximity_all'
    + '&search_word=' + encodeURIComponent(query)
    + '&xcoord=' + lon
    + '&ycoord=' + lat;
  return search (url, limit);
}

function search (url, limit) {
  let results = []
    , page = 1
    , agents = [
      'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
    ];

  limit = Math.max(0, limit)

  return process(url).then(() => {
    results.sort((a, b) => a.rank - b.rank);
    return results.slice(0, limit > 0 ? limit : results.length);
  });

  function process (url) {
    let options = {
      userAgent: agents[Math.floor(Math.random() * agents.length)]
    };

    console.error('Processing %s', url);

    return new Promise((resolve, reject) => {
      jsdom.env(url, options, (err, window) => {
        if (err) {
          reject(err);
          return;
        }

        let $ = jQuery(window)
          , pages = $('.paging .page-count span').text().replace('...', '').trim() || 1
          , next = $('.paging .page-next a[href]');

        if (page++ === 1) {
          console.error('%s pages', pages);
        }

        $('#hit-list li')
        .get()
        .map(element => {
          let text = x => x.text().trim()
            , find = x => $(element).find(x)
            , get = x => text(find(x))
            , email = find('.self-info-list li').get().map(x => text($(x))).filter(x => x.indexOf('@') > -1)
            , coordAttr = find('.hit-address-location').first().attr('data-coordinate')
            , coordinates = null;

          try {
            coordinates = JSON.parse(coordAttr).coordinate;
          } catch (e) { }

          return {
            rank: Number(get('.hit-pin-number')),
            name: get('.hit-name-ellipsis a'),
            phone: get('.hit-phone-number').replace(/\s/g, '') || null,
            address: get('.hit-street-address') || null,
            zip: get('.hit-postal-code') || null,
            city: get('.hit-address-locality') || null,
            place: get('.hit-postal-place-name') || null,
            title: get('.hit-name-ellipsis .person-title-result') || null,
            email: email.length ? email[0] : null,
            lat: coordinates ? coordinates.lat : null,
            lon: coordinates ? coordinates.lon : null
          };
        })
        .filter(x => x.rank && x.name)
        .filter(x => results.every(y => x.rank !== y.rank))
        .forEach(x => results.push(x));

        if (next.length && (!limit || results.length < limit))
          process(next.attr('href')).then(resolve);
        else
          resolve();
      });
    });
  }
}
