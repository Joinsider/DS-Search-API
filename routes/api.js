const express = require('express');
const router = express.Router();

const api = require('../controller/synapi');

require('dotenv').config();

const secureCookies = process.env.SECURE_COOKIES || false;

router.get('/', function(req, res, next) {
    res.send('API is working properly');
});


// Auth
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
        const api_res = await api.loginSynAPI(protocol, url, username, password, otp_code);
        console.log("API response:", api_res);

        if(api_res === false) {
            return res.status(500).send('Connection failed');
        }

        if (api_res.data && api_res.data.sid) {
            // Set the cookie
            res.cookie('synology_sid', api_res.data.sid, {
                httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript
                secure: secureCookies, // Ensures the cookie is only sent over HTTPS
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
                sameSite: 'strict' // Protects against CSRF attacks
            }).cookie('protocol', protocol, {
                httpOnly: false,
                secure: secureCookies,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'strict'
            }).cookie('url', url, {
                httpOnly: false,
                secure: secureCookies,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'strict'
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

router.get('/logout', async function (req, res) {
   // Get the cookie
    const sid = req.cookies.synology_sid;
    const protocol = req.cookies.protocol;
    const url = req.cookies.url;
    if(!sid) {
        return res.status(400).send('No SID found');
    }

    try {
        const api_res = await api.logoutSynAPI(protocol, url, sid);
        if (!api_res) {
            return res.status(500).send('Logout failed');
        }else {
            // Delete the three cookies
            res.clearCookie('synology_sid');
        }
    }catch (error) {
        console.error("Error:", error);
        return res.status(500).send('Error: ' + error);
    }

});

// Folders
router.get('/sharedFolders', async (req, res) => {
    const sid = req.cookies.synology_sid;
    const protocol = req.cookies.protocol;
    const url = req.cookies.url;
    console.log("Cookies:", sid, protocol, url);

    if (!sid) {
        return res.status(400).send('No SID found');
    }

    try {
        const api_res = await api.getSharedFolders(protocol, url, sid);
        if (!api_res) {
            return res.status(500).send('Error: No shared folders found');
        } else if (api_res === false) {
            return res.status(500).send('Error: API error');
        }
        return res.json(api_res);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send('Error: ' + error);
    }
})

module.exports = router;