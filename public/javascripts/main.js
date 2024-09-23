
// Frontend Function to call the logout in the backend
async function logout() {
    // The SID needed for logout is stored in the cookies check if it exists else return
    const sid = getCookie('synology_sid');
    // The logout API is called with the SID
    try {
        const response = await fetch(`/api/logout?_sid=${sid}`, {
            method: 'GET'
        });

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        window.location.href = '/';
    } catch (error) {
        console.error("Error:", error);
        alert('Error: ' + error);
    }
}

function check_webp_feature(feature, callback) {
    var kTestImages = {
        lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
        lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
        alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
        animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
    };
    var img = new Image();
    img.onload = function () {
        var result = (img.width > 0) && (img.height > 0);
        callback(feature, result);
    };
    img.onerror = function () {
        callback(feature, false);
    };
    img.src = "data:image/webp;base64," + kTestImages[feature];
}

function loadLoading() {
    const loading = document.querySelector('.loading');

    check_webp_feature('animation', (feature, isSupported) => {
        if(isSupported) {
            loading.innerHTML = '<img src="/images/loading.webp" alt="Loading">';
        } else {
            loading.innerHTML = '<img src="/images/loading.gif" alt="Loading">';
        }
    });
}

// On page load check if loadingContainer is present and set the loading animation
window.addEventListener('DOMContentLoaded', () => {
    const loading = document.querySelector('.loadingContainer');
    if(loading) {
        loadLoading();
    }
});


