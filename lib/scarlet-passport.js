var http = require("http");
var assert = require("assert");
var passport = require("passport");
var clone = require("./extensions/clone");

var ScarletPassport = module.exports = exports = function(scarlet) {
	var self = this;

	clone(passport,self);

	self.passport = passport;
	self.persistSession = false;
	self.passportSession = self.passport.session();
	self.initializePassportRequest = self.passport.initialize();

	self.initialize = function(){
		var self = this;
		scarlet.plugins.passport = self;

		return self;
	};

	self.authenticate = function(strategyName, options, requestToAuthenticate){
		var self = this;

		if(!requestToAuthenticate)
			requestToAuthenticate = function(request,response){};

		var auth = self.passport.authenticate(strategyName, options);

		return scarlet.intercept(requestToAuthenticate)
					.using(function(invocation,proceed){
						assert(invocation.args.length === 2, "ScarletPassport::authenticate - route must contain request response arguments");
						assert((invocation.args[0] instanceof http.IncomingMessage),"ScarletPassport::authenticate - Passport requires request to be of type http.IncomingMessage");
						
						invocation.request = invocation.args[0];
						invocation.response = invocation.args[1];

						proceed();

					})
					.using(function(invocation,proceed){
						self.initializePassportRequest(invocation.request,invocation.response,function(){
							proceed();
						});
					})
					.using(function(invocation,proceed){
						if(!self.persistSession){
							proceed();
							return;
						}

						self.passportSession(invocation.request,invocation.response,function(){
							proceed();
						});
					})
					.using(function(invocation,proceed){
						auth(invocation.request,invocation.response,function(){

							proceed();
						});
					}).proxy();
	};
};