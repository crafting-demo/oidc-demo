const path = require('path');
const http = require('http');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc');
const OIDCStrategy = require('passport-openidconnect').Strategy;
const morgan = require('morgan');

// Load configs from env or file.
const CONFIG = require('./config');

// This is the regular endpoint URL for OIDC providers doesn't verify the
// callback hostname for exact match (e.g. wildcard used in Okta OIDC callbacks).
const BASE_URL = `https://app${process.env.SANDBOX_ENDPOINT_DNS_SUFFIX}`;
// This is the callback URL for OIDC providers require exact match of callback
// hostname (e.g. Google). In this case, a PASSTHROUGH endpoint must be used in sandbox.
const PASSTHROUGH_CALLBACK_URL = 'https://login.sandboxes.cloud/oauth/callback';

// The common options for passport.authenticate in auth callback.
const AUTH_CALLBACK_OPTIONS = {
    successReturnToOrRedirect: '/profile',
    failureRedirect: '/fail',
    failureMessage: true,
};

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'session-secret',
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.authenticate('session'));

passport.serializeUser((user, cb) => {
    process.nextTick(() => {
        cb(null, user);
    });
});

passport.deserializeUser((user, cb) => {
    process.nextTick(() => {
        cb(null, user);
    });
});

if (CONFIG.google) {
    // Activate google as OIDC provider.
    // Google requires exact match of callback hostname,
    // so a PASSTHROUGH endpoint must be used to access the app and complete the login flow.
    // And the "callbackURL" must be set to PASSTHROUGH_CALLBACK_URL.
    passport.use(new GoogleStrategy({
        clientID: CONFIG.google.clientID,
        clientSecret: CONFIG.google.clientSecret,
        callbackURL: PASSTHROUGH_CALLBACK_URL,
        scope: ['openid', 'profile'],
        prompt: 'consent',
    }, function verify(issuer, profile, cb) {
        cb(null, profile);
    }));
    app.get('/login/google', passport.authenticate('google'));
    app.get('/auth/google', passport.authenticate('google', AUTH_CALLBACK_OPTIONS));
}

if (CONFIG.okta) {
    // Activate Okta as OIDC provider.
    // Okta supports wildcard matching of callback hostnames.
    // A regular "unauthenticated" endpoint will work for auth callback.
    passport.use('okta', new OIDCStrategy({
        issuer: `https://${CONFIG.okta.domain}/oauth2/default`,
        authorizationURL: `https://${CONFIG.okta.domain}/oauth2/default/v1/authorize`,
        tokenURL: `https://${CONFIG.okta.domain}/oauth2/default/v1/token`,
        userInfoURL: `https://${CONFIG.okta.domain}/oauth2/default/v1/userinfo`,
        clientID: CONFIG.okta.clientID,
        clientSecret: CONFIG.okta.clientSecret,
        callbackURL: `${BASE_URL}/auth/okta`,
        scope: ['openid', 'profile'],
        prompt: 'consent',
    }, (issuer, profile, cb) => {
        cb(null, profile);
    }));
    app.get('/login/okta', passport.authenticate('okta'));
    app.get('/auth/okta', passport.authenticate('okta', AUTH_CALLBACK_OPTIONS));
}

app.get('/auth/providers', (req, res) => {
    res.json(Object.keys(CONFIG));
});

app.get('/profile', (req, res) => {
    res.json(req.user);
});

app.get('/fail', (req, res) => {
    res.json(req.session.messages);
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

http.createServer(app).listen(process.env.PORT || 3000);
