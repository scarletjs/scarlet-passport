scarlet-passport
================

> Scarlet plugin for using Passport authentication


[![Build Status](https://travis-ci.org/scarletjs/scarlet-passport.png?branch=master)](https://travis-ci.org/scarletjs/scarlet-passport)

##Install

`npm install scarlet-passport`

##Start logging

```javascript
var Scarlet = require('scarlet');
var scarlet = new Scarlet('scarlet-passport');
var scarletPassport = scarlet.plugins.scarletPassport;

//set a passport strategy
scarletPassport.use(new LocalStrategy(function(username,password,done){
	//important strategy logic here...
	done(null,someUser);
})

//Create an http server
var http = require('http');
var requestListener = function (req, res) {
  res.writeHead(200);
  res.end('Hello, World!\n');
}

//Use scarletPassport to intercept requests and validate using passport
var requestListener = scarletPassport.scarletPassport.authenticate('local',{}, requestListener);


var server = http.createServer(requestListener);
server.listen(8080);

//-> When a request comes in the following will occur
//-> 1. Request user is validated using passport 
//-> 2. If valid it will  continue
```

## Getting Started
This plugin requires Scarlet `~0.5.x`

If you haven't used [Scarlet](https://github.com/scarletjs/scarlet) before, be sure to check out the [Documentation](https://github.com/scarletjs/scarlet).  To use this plugin perform the following:

Install scarlet
```shell
npm install scarlet --save
```

Install plugin
```shell
npm install scarlet-passport --save
```

Once the plugin has been installed, you can use it in your application as follows:

```js
//load scarlet
var Scarlet = require('scarlet');

//Initialize scarlet with the plugin
var scarlet = new Scarlet('scarlet-passport');
```