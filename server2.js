'use strict';

const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const accessToken = 'ACCESS_TOKEN';

const oAuth2Client = new OAuth2();

oAuth2Client.setCredentials({ access_token: accessToken });
const oauth2 = google.oauth2({
    auth: oAuth2Client,
    version: 'v2'
});

oauth2.userinfo.get((err, res) => {
    if (err) {
        console.log(err);
    } else {
        console.log(res);
    }
});