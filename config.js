const fs = require('fs');

const CONFIG = {};

if (process.env['GOOGLE_CONFIG_FILE']) {
    CONFIG.google = JSON.parse(fs.readFileSync(process.env['GOOGLE_CONFIG_FILE']));
} else if (process.env['GOOGLE_CLIENT_ID']) {
    CONFIG.google = {
        clientID: process.env['GOOGLE_CLIENT_ID'],
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    };
}

if (process.env['OKTA_CONFIG_FILE']) {
    CONFIG.okta = JSON.parse(fs.readFileSync(process.env['OKTA_CONFIG_FILE']));
} else if (process.env['OKTA_CLIENT_ID']) {
    CONFIG.okta = {
        // the Okta Domain, 
        // e.g. https://example.okta.com, https://example.oktapreview.com
        domain: process.env['OKTA_DOMAIN'],
        // clientID is the public Okta Application Client Credentials, 
        // its a 20 character alphanumeric string
        // e.g. U7VYvsaiuqlDOHjIVTIA  (generated example)
        clientID: process.env['OKTA_CLIENT_ID'],
        // clientSecret is the private Okta Application Client Credentials, 
        // its a 40 character alphanumeric string with a hypen(s).
        // e.g. Vwb-R4fQnSH7uJkokDhPI-WR4qEiuWFokYANM5C  (generated example)
        clientSecret: process.env['OKTA_CLIENT_SECRET'],
    };
}

module.exports = CONFIG;
