var http = require('http');
var should = require("should");
var Scarlet = require('scarlet');
var passport = require("passport");

var scarlet = new Scarlet(['../lib/scarlet-passport']);
var scarletPassport = scarlet.plugins.scarletPassport;

function localStrategyContext(mockUser){
	LocalStrategy = require('passport-local').Strategy;

	scarletPassport.serializeUser(function(user, done) {
		done(null, user);
	});

	scarletPassport.deserializeUser(function(id, done) {
		done(null, mockUser);
	});

	scarletPassport.use(new LocalStrategy(

		function(username, password, done) {
			process.nextTick(function () {

				if(username !== mockUser.username || password !== mockUser.password){
					done(null, false, {message : "Invalid Username or Password"});
					return;
				}

				done(null, mockUser);

			});
		})
	);
}

function createMockRequest(mockUser) {
	var request = new http.IncomingMessage();
	request.body = {
				username : mockUser.username,
				password : mockUser.password
			};

	return request;
}

function createMockResponse() {
	return {
			redirect: function(){}
		};
}

describe("Given we are authenticating with ScarletPassport", function(){

	describe("Given we are using Passport-Local strategy", function(){
		var mockUser = {username : "username", password : "password"};

		localStrategyContext(mockUser);

		it("Should set request user object with the user object", function(done){
			var httpRequest = function  (request, response){
				request.user.username.should.be.eql(mockUser.username);
				request.user.password.should.be.eql(mockUser.password);
				done();
			};

			httpRequest = scarletPassport.authenticate('local',{failureRedirect: '/login'}, httpRequest);
			httpRequest(createMockRequest(mockUser),createMockResponse());

		});
		
		describe("Given we will redirect on invalid access", function(){
			it("Should redirect", function(done){
				var mockRequest = createMockRequest({username:"invalidUserName",password:"invalidPassword"});
				var mockResponse = createMockResponse();
				
				mockResponse.redirect = function(){
					done();
				};

				var httpRequest = function(request, response){
					throw new Error("Shouldn't call main request when error occurs");
				};

				httpRequest = scarletPassport.authenticate('local',{failureRedirect: '/login'}, httpRequest);
				httpRequest(mockRequest,mockResponse);

			});
		});
	});
});
