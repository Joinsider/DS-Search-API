const connectionForm = document.querySelector('.connection-form');

connectionForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const loading = document.querySelector('.loadingContainer');
    loading.setAttribute('active', 'true');
    connectionForm.setAttribute('active', 'false');

    const formData = new FormData(connectionForm);
    const protocolSelect = document.getElementById('protocolSelector');
    const protocol = protocolSelect.options[protocolSelect.selectedIndex].value
    const url = formData.get('url');
    const username = formData.get('username');
    const password = formData.get('password');
    const otp_code = formData.get('otp_code');

    if(!protocol || !url || !username || !password) {
        loading.setAttribute('active', 'false');
        connectionForm.setAttribute('active', 'true');
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                protocol,
                url,
                username,
                password,
                otp_code
            })
        })

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if(response.statusCode === 500) {
            throw new Error('Connection failed');
        }
        const data = await response.json();
        alert('Connection successful: SID: ' + data.sid);

    } catch (error) {
        console.error("Error:", error);
        loading.setAttribute('active', 'false');
        connectionForm.setAttribute('active', 'true');
        alert('Error: ' + error);
    }

});

