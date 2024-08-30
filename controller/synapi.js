const validUrl = require('valid-url');
const https = require('https');
const agent = new https.Agent({
    rejectUnauthorized: false
});

let fetch;

(async () => {
    fetch = (await import('node-fetch')).default;
})();

async function loginToAPI(protocol, url, username, password, otp_code) {
    if (!protocol || !url || !username || !password) {
        return false;
    }

    url = url.endsWith('/') ? url.slice(0, -1) : url;
    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);
    let location = `${protocol}${url}/webapi/auth.cgi?api=SYNO.API.Auth&version=3&method=login&account=${encodedUsername}&passwd=${encodedPassword}&session=FileStation&format=sid`;

    if (otp_code) {
        location += `&otp_code=${encodeURIComponent(otp_code)}`;
    }

    console.log("API location:", location);

    if (!validUrl.isUri(location)) {
        console.log("Invalid URL");
        return false;
    }

    try {
        const response = await fetch(location, { agent });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        const data = await response.json();
        console.log("Response JSON:", data);

        if (!data.success || data.error) {
            console.error("API error:", data.error);
            return false;
        }

        if (data.data && data.data.sid) {
            const sid = data.data.sid;
            console.log("Sid:", sid);
            return data;
        }

        return false;
    } catch (error) {
        console.error("Error:", error);
        if (error instanceof TypeError && error.message === 'fetch failed') {
            console.error("Network error:", error.cause);
        }
        return false;
    }
}
async function getSharedFolders(protocol, url, sid) {
    if (!protocol || !url || !sid) {
        return
    } else if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let location = protocol + url + '/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&sort_by=name&method=list_share&sid=' + sid;

    const response = await fetch(location, {
            method: 'GET',
            mode: 'no-cors',
        }
    )
}

module.exports = {
    loginToAPI,
    getSharedFolders
}