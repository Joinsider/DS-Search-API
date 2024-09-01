document.addEventListener('DOMContentLoaded', async function() {
    const sharedFolders = document.querySelector('.shared-folders');
    let folders = [];

    const res = await fetchFolders(folders);
    if (!res) {
        sharedFolders.innerHTML = '<h2>No shared folders found</hjson>';
        return;
    }

    implementFolders(sharedFolders, folders);
});


function implementFolders(sharedFolders, folders) {
    folders.forEach(folder => {
        const folderDiv = document.createElement('div');
        folderDiv.classList.add('sharedFolder');
        folderDiv.innerHTML = `<h3>${folder.name}</h3><p>${folder.path}</p>`;
        sharedFolders.appendChild(folderDiv);
    });
}

async function fetchFolders(folders) {
    try {
        const response = await fetch('/api/sharedFolders', {
            method: 'GET'
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        folders = await response.json();
        console.log(folders);

        if (folders.length === 0) {
            return false;
        }

        return folders;

    } catch (error) {
        console.error("Error:", error);
        alert('Error: ' + error);
    }
}