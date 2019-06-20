// Require the module
var Session = require('express-session');

app.use(Session({
    secret: 'EXPRESS_SECRET_SESSION',
    resave: true,
    saveUninitialized: true
}));

// Require the routes.js file
require('./routes');