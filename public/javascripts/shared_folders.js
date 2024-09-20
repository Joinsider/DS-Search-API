document.addEventListener('DOMContentLoaded', async function () {
    const sharedFolders = document.querySelector('.shared_folders');
    const loading = document.querySelector('.loadingContainer');
    loading.setAttribute('active', 'true');

    setCookie('selectedFolder', '', 0);

    const res = await fetchFolders('/api/sharedFolders');
    loading.setAttribute('active', 'false');
    if (res === false) {
        const noFolders = document.createElement('div');
        noFolders.classList.add('no-shared-folders');
        noFolders.innerHTML = '<h3>No shared folders found</h3>';
        sharedFolders.appendChild(noFolders);
        return;
    }
    console.log("now implement folders");
    implementFolders(res);
});

async function fetchFolders() {
    let folders;
    try {
        const response = await fetch('/api/sharedFolders', {
            method: 'GET'
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);

        }

        folders = await response.json();

        if (folders.length === 0) {
            return false;
        }
        console.log(folders);
        return folders;

    } catch (error) {
        console.error("Error:", error);
        alert('Error: ' + error);
        window.location.href = '/';
    }
}

function selectFolder(path) {
    console.log("Selected folder:", path);
    setCookie('selectedFolder', path, 1);

    // Find the folder with the correct path element
    const folders = document.querySelectorAll('.folder');
    folders.forEach(folder => {
        if(folder.querySelector('p').textContent.includes(path)) {
            folder.setAttribute('selected', 'true');
        }else {
            folder.removeAttribute('selected');
        }
    });
}