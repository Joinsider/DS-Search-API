const express = require('express');
const router = express.Router();

const api = require('../controller/synapi');

/* API */

router.get('/', function(req, res, next) {
    res.send('API is working properly');
});

router.post('/login', async function (req, res) {

    const protocol = req.body.protocol;
    let url = req.body.url;
    const username = req.body.username;
    const password = req.body.password;
    const otp_code = req.body.otp_code;

    if (!url || !username || !password) {
        return res.status(400).send('Please fill in all fields');
    } else if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }

    try {
        const api_res = await api.loginToAPI(protocol, url, username, password, otp_code);
        console.log("API response:", api_res);

        if(api_res === false) {
            return res.status(500).send('Connection failed');
        }

        if (api_res.data && api_res.data.sid) {
            // Set the cookie
            res.cookie('synology_sid', api_res.data.sid, {
                httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript
                secure: true, // Ensures the cookie is only sent over HTTPS
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
                sameSite: 'strict' // Protects against CSRF attacks
            });

            // Return the response
            res.json({
                success: true,
                message: 'Login successful',
                sid: api_res.data.sid
            });
        } else {
            res.status(500).send('Login failed: No SID received');
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Error: ' + error);
    }
})

module.exports = router;