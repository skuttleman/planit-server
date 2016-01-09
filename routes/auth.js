var route = require('express').Router();
var session = require('express-session');
var passport = require('passport');
var LinkedIn = require('passport-linkedin-oauth2').Strategy;
var knex = require('../db/knex');

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
  incorporateUser(profile, done);
}));


route.get('/auth/linkedin',
  passport.authenticate('linkedin')
);

route.get('/auth/linkedin/callback',
  passport.authenticate('linkedin'),
  function(request, response, next) {
    response.json({ user: request.user });
  }
);

route.get('/logout', function(request, response, next) {
  request.logout();
});



function incorporateUser(profile, done) {
  getOrCreateUser(profile).then(function(user) {
    var newProfile = {
      id: user.id,
      is_banned: user.is_banned,
      role_id: user.role_id,
      role: user.role,
      social_id: profile.id,
      displayName: profile.displayName,
      photos: profile.photos
    };
    done(null, newProfile)
  });
}

function getOrCreateUser(profile) {
  return knex('members').where('social_id', profile.id).then(function(users) {
    var user = users[0];
    if (user && !user.is_banned) {
      return Promise.resolve(user);
    } else if (user) {
      return Promise.reject('user has been banned');
    } else {
      return knex('roles').where('name', 'normal').then(function(roles) {
        return Promise.resolve(roles[0]);
      }).then(function(role) {
        return knex('members').returning('*').insert({
          social_id: profile.id,
          is_banned: false,
          role_id: role.id
        }).then(function(users) {
          return Promise.resolve(users[0]);
        });
      });
    }
  });
}
