const express = require("express");
const querystring = require('node:querystring');
const request = require('request');

const PORT = process.env.PORT || 3001;
const app = express();
const client_id = "";
const client_secret = "";
const redirect_uri = "http://localhost:3001/callback";

function generateRandomString(lenght) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var randomString = ""
    for (let index = 0; index < lenght; index++) {
        randomString += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return randomString
}

app.get('/login', function (req, res) {

    var state = generateRandomString(16);
    var scope = 'user-read-private user-read-email user-library-read user-top-read';

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }))
})

app.get('/callback', function (req, res) {
    var code = req.query.code || null
    var state = req.query.state || null

    if (state === null) {
        res.redirect('/' + querystring.stringify({
            error: 'state_missing'
        }))
    } else {
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        }

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var access_token = body.access_token, refresh_token = body.refresh_token

                res.cookie('access_token', access_token, { expires: new Date(Date.now() + (1 * 24 * 60 * 60 * 1000)) })
                res.redirect('http://localhost:3000/?')
            } else {
                res.redirect('/' + querystring.stringify({
                    error: 'invalid_token'
                }))
            }
        })
    }
})

// app.get("/api", (req, res) => {
//     res.json({ message: "Hello from server!" });
// })

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});