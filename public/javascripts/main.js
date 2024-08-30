
// Frontend Function to call the logout in the backend
async function logout() {
    // The SID needed for logout is stored in the cookies check if it exists else return
    const sid = getCookie('synology_sid');
    if (!sid) {
        window.location.href = '/';
        return;
    }
    // The logout API is called with the SID
    try {
        const response = await fetch('/api/logout', {
            method: 'GET'
        });

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // The cookie is deleted
        document.cookie = 'synology_sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        alert('Logout successful');
        window.location.href = '/';
    } catch (error) {
        console.error("Error:", error);
        alert('Error: ' + error);
    }
}