var http = require("http");
var assert = require("assert");
var Scarlet = require("scarlet");
var passport = require("passport");
var clone = require("./extensions/clone");

var scarlet = new Scarlet();

var ScarletPassport = module.exports = exports = function() {
	var self = this;

	clone(passport,self);
	scarlet.extend(self);

	self.passport = passport;
	self.persistSession = false;
	self.passportSession = self.passport.session();
	self.initializePassportRequest = self.passport.initialize();
};

ScarletPassport.prototype.authenticate = function(strategyName, options, requestToAuthenticate){
	var self = this;

	if(!requestToAuthenticate)
		requestToAuthenticate = function(request,response){};

	var auth = self.passport.authenticate(strategyName, options);

	return scarlet.interceptAsync(requestToAuthenticate)
				.using(function(proceed,invocation){
					assert(invocation.args.length === 2, "ScarletPassport::authenticate - route must contain request response arguments");
					assert((invocation.args[0] instanceof http.IncomingMessage),"ScarletPassport::authenticate - Passport requires request to be of type http.IncomingMessage");
					
					invocation.request = invocation.args[0];
					invocation.response = invocation.args[1];

					proceed();

				})
				.using(function(proceed,invocation){
					self.initializePassportRequest(invocation.request,invocation.response,function(){
						proceed();
					});
				})
				.using(function(proceed,invocation){
					if(!self.persistSession){
						proceed();
						return;
					}

					self.passportSession(invocation.request,invocation.response,function(){
						proceed();
					});
				})
				.using(function(proceed,invocation){
					auth(invocation.request,invocation.response,function(){

						proceed();
					});
				}).resolve();
};