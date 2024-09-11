
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