# krax

`npm install`, then

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
let krax = require('./krax.js')
  , log = xs => xs.forEach(x => console.log(x.name));
krax.search('john smith', 5).then(log);
krax.searchByDistance('john smith', 12.34, -12.34, 5).then(log);
```
