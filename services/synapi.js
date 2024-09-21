const validUrl = require('valid-url');
const https = require('https');
const agent = new https.Agent({
    rejectUnauthorized: false
});

let fetch;

(async () => {
    fetch = (await import('node-fetch')).default;
})();


//
async function login(protocol, url, username, password, otp_code) {
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
        const data = await makeRequest(location);

        if (data.data && data.data.sid) {
            const sid = data.data.sid;
            console.log("Sid:", sid);
            return data;
        }

        return false;
    } catch (error) {
        error(error);
        return false;
    }
}

async function logout(protocol, url, sid) {
    if (!sid) {
        return false;
    }

    const location = `${protocol}${url}/webapi/auth.cgi?api=SYNO.API.Auth&version=3&method=logout&session=FileStation&_sid=${sid}`;

    if (!validUrl.isUri(location)) {
        console.log("Invalid URL");
        return false;
    }

    try {
        const data = await makeRequest(location);

        if(data.success) {
            console.log("Logout successful");
            return true;
        }
        throw new Error("Logout failed");
    } catch (error) {
        err(error);
        return false;
    }
}

// Folder Functions

async function list_share(protocol, url, sid) {
    if(!sid || !protocol || !url) {
        return false;
    }
    const encodedSid = encodeURIComponent(sid);

    const location = `${protocol}${url}/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&sort_by=name&method=list_share&_sid=${encodedSid}`;
    console.log("API location Shared Folders:", location);
    try {
        const data = await makeRequest(location);


        if(data.success === 'false' || data.error) {
            throw new Error("API error");
        }else {
            return data.data.shares;
        }
    } catch (error) {
        console.log("Error:", error);
        return false;
    }
}

async function list(protocol, url, sid, folderPath) {
    if(!sid || !protocol || !url || !folderPath) {
        return false;
    }
    const encodedSid = encodeURIComponent(sid);
    const encodedFolderPath = encodeURIComponent(`"${folderPath}"`);

    const location = `${protocol}${url}/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&folder_path=${encodedFolderPath}&sort_by=name&method=list&_sid=${encodedSid}`;
    console.log("API location List Folder:", location);
    try {
        const data = await makeRequest(location);
        console.log("Raw Response Data: " + data);

        if(data.success === false || data.error) {
            throw new Error("API error");
        }else {
            const files = data.data.files;
            console.log("Files:", files);
            return files;
        }
    } catch (error) {
        console.log("Error:", error);
        return false;
    }
}

async function makeRequest(location) {
    const response = await fetch(location, { agent });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Response status:", response.status);

    const data = await response.json();
    console.log("Response JSON:", data);

    if (!data.success || data.error) {
        err(data.error);
        return false;
    }
    return data;
}

function err(error) {
    console.error("Error:", error);
    if (error instanceof TypeError && error.message === 'fetch failed') {
        console.error("Network error:", error.cause);
    }
    return false;
}

module.exports = {
    login,
    logout,
    list_share,
    list
}