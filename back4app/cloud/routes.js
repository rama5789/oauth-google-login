const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

// Fill these out with the values you got from Google
// https://console.cloud.google.com/apis/credentials?project={project-id}

const ClientId = 'GOOGLE_WEB_OAUTH_CLIENT_ID';
const ClientSecret = 'GOOGLE_WEB_OAUTH_CLIENT_SECRET';
// const RedirectionUrl = 'http://{domain-name}/auth/google/callback';
const RedirectionUrl = 'http://{app}.back4app.io/auth/google/callback';

// google callback route
app.use('/auth/google/callback', (req, res) => {
    console.log('\n /auth/google/callback route triggered ----->');

    const oAuth2Client = getOAuth2Client();
    console.log('req.session: ', req.session);
    console.log('req.query: ', req.query);
    const session = req.session;
    const code = req.query.code;

    oAuth2Client.getToken(code, (err, tokens) => {
        // Now tokens contains an access_token and an optional refresh_token. Save them in the session.
        if (!err) {
            console.log('tokens: ', tokens);
            session['tokens'] = tokens;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>GAuth</title>
                    </head>
                    <body>
                        <h1>Login successful!!!</h1>
                        <a href='/profile'>Profile</a>
                        <br/>
                        <a href='/'>Home</a>               
                    </body>
                </html>\n`
            );
        }
        else {
            console.log('err: ', err);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>GAuth</title>
                    </head>
                    <body>
                        <h1>Login failed!!!</h1>
                        <a href='/'>Home</a>               
                    </body>
                </html>\n`
            );
        }
    });
});

// user profile route
app.use('/profile', (req, res) => {
    console.log('\n /profile route triggered ----->');

    const oAuth2Client = new OAuth2();
    console.log('req.session: ', req.session);
    console.log('req.query: ', req.query);
    const session = req.session;
    // oAuth2Client.setCredentials(session['tokens']);
    // provide access_token, refresh_token or API_key
    oAuth2Client.setCredentials({ access_token: session['tokens']['access_token'] });

    new Promise((resolve, reject) => {
        google.oauth2({
            auth: oAuth2Client,
            version: 'v2'
        }).userinfo.get((err, response) => {
            resolve(response || err);
        });
    })
        .then(response => {
            console.log('response: ', response);
            const {
                id,
                email,
                verified_email,
                name,
                given_name,
                family_name,
                link,
                picture,
            } = response.data;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>GAuth</title>
                    </head>
                    <body>
                        <h1>Profile</h1>
                        <a href='/'>Home</a> 
                        <br/>
                        <p><b>ID:</b> ${id}</p>
                        <p><b>Email:</b> ${email}</p>
                        <p><b>Email Verified:</b> ${verified_email}</p>
                        <p><b>Name:</b> ${name}</p>
                        <p><b>Given Name:</b> ${given_name}</p>
                        <p><b>Family Name:</b> ${family_name}</p>
                        <p><b>Link:</b> ${link}</p>
                        <br/>
                        <img src=${picture} />                          
                    </body>
                </html>\n`
            );
        })
        .catch(err => {
            console.log('err: ', err);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>GAuth</title>
                    </head>
                    <body>
                        <h1>Error while getting Profile Details!!!</h1>
                        <a href='/'>Home</a>               
                    </body>
                </html>\n`
            );
        });
});

// login route
app.use('/', (req, res) => {
    console.log('\n / route triggered ----->');

    const url = getAuthUrl();
    console.log('url: ', url);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
		<!DOCTYPE html>
		<html>
			<head>
				<title>GAuth</title>
			</head>
			<body>
				<h1>Authentication using google oAuth 2.0</h1>
				<a href=${url}>Google Login</a>               
			</body>
        </html>\n`
    );
});

/*********** helper functions ***************/
// create OAuth2 Client
function getOAuth2Client() {
    return new OAuth2(ClientId, ClientSecret, RedirectionUrl);
}

/* Generating an authentication URL

To ask for permissions from a user to retrieve an access token, 
you redirect them to a consent page. To create a consent page URL:
*/
function getAuthUrl() {
    const oAuth2Client = getOAuth2Client();

    // generate a url that asks permissions for  Google+, Blogger and Google Calendar scopes
    const scopes = [
        'email', // or, 'https://www.googleapis.com/auth/userinfo.email'
        'profile', // or, 'https://www.googleapis.com/auth/userinfo.profile'
        // 'https://www.googleapis.com/auth/plus.me',
        // 'https://www.googleapis.com/auth/blogger',
        // 'https://www.googleapis.com/auth/calendar'
    ];

    const url = oAuth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        // If you only need one scope you can pass it as a string
        scope: scopes
    });

    return url;
}