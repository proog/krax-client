# krax

`$ npm install`, then

```
$ node cli.js "john smith" 5
```

or

```
$ node server.js
$ curl "http://localhost:11181/?q=john%20smith"
$ curl "http://localhost:11181/?q=john%20smith&limit=5"
$ curl "http://localhost:11181/?q=john%20smith&limit=5&lat=12.34&lon=-12.34"
```

or

```
let krax = require('./krax.js');
krax.search("john smith", 5).then(results => {
  results.forEach(x => console.log(x.name));
});
```
