const express = require('express');
const router = express.Router();

const api = require('../services/synapi');

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
        const api_res = await api.login(protocol, url, username, password, otp_code);
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
        const api_res = await api.logout(protocol, url, sid);
        if (!api_res) {
            return res.status(500).send('Logout failed');
        }else {
            // Delete the three cookies
            res.clearCookie('synology_sid').send('Logout successful');
        }
    }catch (error) {
        console.error("Error:", error);
        return res.status(500).send('Error: ' + error);
    }

});

router.get('/checkLogin', async (req, res) => {
   const sid = req.cookies.synology_sid;

    const protocol = req.cookies.protocol;
    const url = req.cookies.url;
    if(!sid || !protocol || !url) {
        return res.status(400).send('false');
    }

    try {
        const api_res = await api.list_share(protocol, url, sid);
        if(api_res === false) {
            return res.status(500).send('false');
        }
        return res.status(200).send('true');
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send('false');
    }
});

// Folders
router.get('/list_share', async (req, res) => {
    const sid = req.cookies.synology_sid;
    const protocol = req.cookies.protocol;
    const url = req.cookies.url;
    console.log("Cookies:", sid, protocol, url);

    if (!sid) {
        return res.status(400).send('No SID found');
    }

    try {
        const api_res = await api.list_share(protocol, url, sid);
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

router.get('/list', async (req, res) => {
    const sid = req.cookies.synology_sid;
    const protocol = req.cookies.protocol;
    const url = req.cookies.url;
    const path = req.cookies.selectedFolder;

    if (!sid ) {
        return res.status(400).redirect('/');
    }

    try {
        console.log("Cookies:", sid, protocol, url)
        const api_res = await api.list(protocol, url, sid, path);
        console.log("API response:", api_res);
        if (!api_res) {
            return res.status(500).send('Error: No files found');
        } else if (api_res === false) {
            return res.status(500).send('Error: API error');
        }
        return res.json(api_res);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send('Error: ' + error);
    }
});



router.get('/download', async (req, res) => {
    const sid = req.cookies.synology_sid;
    const protocol = req.cookies.protocol;
    const url = req.cookies.url;
    const path = req.query.path;

    if (!sid) {
        return res.status(400).redirect('/');
    }

    console.log("Cookies:", sid, protocol, url);
    console.log("Download path:", path);
    try {
        const api_res = await api.download(protocol, url, sid, path);
        console.log("API response:", api_res);
        if (!api_res) {
            return res.status(500).send('Error: Download failed');
        } else if (api_res === false) {
            return res.status(500).send('Error: API error');
        }

        const contentDisposition = api_res.headers.get('content-disposition');
        const contentType = api_res.headers.get('content-type');

        if (contentDisposition) {
            res.setHeader('Content-Disposition', contentDisposition);
            console.log("Content-Disposition:", contentDisposition);
        }
        if (contentType) {
            res.setHeader('Content-Type', contentType);
            console.log("Content-Type:", contentType);
        }
        // Set file name from path if no content-disposition header is present
        if (!contentDisposition) {
            // Filename but without the " at the end
            const fileName = path.split('/').pop().replace(/"/g, '');
            res.setHeader('Content-Disposition', `inline; filename=${fileName}`);
            console.log("Content-Disposition:", res.getHeader('Content-Disposition'));
        }

        api_res.body.pipe(res);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send('Error: ' + error);
    }
});

router.get('/start_search', async (req, res) => {
    const sid = req.cookies.synology_sid;
    const protocol = req.cookies.protocol;
    const url = req.cookies.url;
    const folder = req.cookies.selectedFolder;
    const pattern = req.query.pattern;

    if (!sid) {
        return res.status(400).redirect('/');
    }

    try {
        const api_res = await api.start_search(protocol, url, sid, folder, pattern);
        if (!api_res) {
            return res.status(500).send('Error: Search failed');
        } else if (api_res === false) {
            return res.status(500).send('Error: API error');
        }

        return res.json(api_res);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send('Error: ' + error);
    }
});

router.get('/search', async (req, res) => {
   const sid = req.cookies.synology_sid;
    const protocol = req.cookies.protocol;
    const url = req.cookies.url;
    const searchID = decodeURIComponent(req.query.taskid);

    if (!sid || !protocol || !url) {
        return res.status(400).redirect('/');
    } else if (!searchID) {
        return res.status(400).send('No search ID found');
    }

    try {
        const api_res = await api.search(protocol, url, sid, searchID);
        console.log("API_RES:")
        console.log(api_res);
        console.log("Files:");
        console.log(api_res.data);
        if (!api_res) {
            return res.status(500).send('Error: Search failed');
        } else if (api_res === false) {
            return res.status(500).send('Error: API error');
        } else if (api_res === 'searching') {
            return res.status(202).send('searching');
        }

        return res.json(api_res);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send('Error: ' + error);
    }
});

module.exports = router;