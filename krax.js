"use strict";

let jsdom = require('jsdom')
  , jQuery = require('jquery')
  , Promise = require('promise');

search(process.argv[2], Number(process.argv[3]) || 0).then(results => {
  console.error(results.length + ' results');
  console.log(results);
});

function search (query, limit) {
  let results = []
    , page = 1
    , url = 'http://www.krak.dk/person/resultat/' + encodeURIComponent(query)
    , userAgents = [
      'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
    ];

  return process(url).then(() => {
    results.sort((a, b) => a.rank - b.rank);
    return results.slice(0, limit > 0 ? limit : results.length);
  });

  function process (url) {
    console.error('Processing ' + url);

    return new Promise((resolve, reject) => {
      jsdom.env(url, {
        userAgent: userAgents[Math.floor(Math.random()*userAgents.length)]
      }, (err, window) => {
        if (err) {
          reject(err);
          return;
        }

        let $ = jQuery(window)
          , pages = $('.paging .page-count span').text().replace('...', '').trim() || 1
          , next = $('.paging .page-next a[href]');

        if (page++ === 1) {
          console.error(pages + ' pages');
        }

        $('#hit-list li')
        .get()
        .map(element => {
          let text = x => $(element).find(x).first().text().trim()
            , email = $(element)
              .find('.self-info-list li')
              .get()
              .map(e => $(e).text().trim())
              .filter(x => x.indexOf('@') > -1);

          return {
            rank: Number(text('.hit-pin-number')),
            name: text('.hit-name-ellipsis a'),
            phone: text('.hit-phone-number').replace(/\s/g, '') || null,
            address: text('.hit-street-address') || null,
            zip: text('.hit-postal-code') || null,
            city: text('.hit-address-locality') || null,
            place: text('.hit-postal-place-name') || null,
            title: text('.hit-name-ellipsis .person-title-result') || null,
            email: email.length ? email[0] : null
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
