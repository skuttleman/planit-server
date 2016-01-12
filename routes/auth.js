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
  incorporateUser(profile, done).catch(function(error) {
    done(error);
  });
}));

route.get('/auth', function(request, response) {
  response.json({ user: request.user });
});

route.get('/auth/linkedin', passport.authenticate('linkedin'));
route.get('/auth/linkedin/callback',
  passport.authenticate('linkedin'),
  function(request, response, next) {
    response.redirect('/');
  }
);

route.get('/auth/logout', function(request, response, next) {
  request.logout();
  response.json({ user: request.user });
});



function incorporateUser(profile, done) {
  return getOrCreateUser(profile).then(function(user) {
    done(null, user);
  });
}

function getOrCreateUser(profile) {
  return knex('members').where('social_id', profile.id).then(function(users) {
    var user = users[0];
    if (user) {
      return updateUser(user, profile);
    } else if (user) {
      return Promise.reject('user has been banned');
    } else {
      return createUser(profile);
    }
  });
}

function lookupRole(where) {
  return knex('roles').where(where).then(function(roles) {
    return Promise.resolve(roles[0]);
  });
}

function userWithRole(user, where) {
  return lookupRole(where).then(function(role) {
    user.role_name = role.name;
    return Promise.resolve(user);
  });
}

function updateUser(user, profile) {
  return knex('members').returning('*').where({ id: user.id }).update({
    display_name: profile.displayName || '',
    profile_image: photo(profile.photos)
  }).then(function(users) {
    return userWithRole(users[0], { id: user.role_id });
  });
}

function createUser(profile) {
  return lookupRole({ name: 'normal' }).then(function(role) {
    return knex('members').returning('*').insert({
      is_banned: false,
      role_id: role.id,
      social_id: profile.id,
      display_name: profile.displayName,
      profile_image: photo(profile.photos)
    }).then(function(users) {
      var user = users[0];
      user.role_name = role.name;
      user.firstLogin = true;
      return Promise.resolve(user);
    });
  });
}

function photo(photos) {
  var ret = photos[photos.length - 1];
  return ret ? ret.value : '';
}
