var route = require('express').Router();
var session = require('express-session');
var passport = require('passport');
var LinkedIn = require('passport-linkedin-oauth2').Strategy;
module.exports = route;


route.use(session({
  secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true
}));
route.use(passport.initialize());
route.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});



passport.use(new LinkedIn({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.HOST + "/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_basicprofile'],
  state: true
}, function(accessToken, refreshToken, profile, done) {
  var newProfile = { id: profile.id, displayName: profile.displayName };
  done(null, newProfile);
}));


route.get('/auth/linkedin',
  passport.authenticate('linkedin')
);

route.get('/auth/linkedin/callback', passport.authenticate('linkedin'), function(request, response, next) {
  response.redirect('/');
});

route.get('/logout', function(request, response, next){
  request.logout();
  response.redirect('/');
});
