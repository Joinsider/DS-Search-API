document.addEventListener('DOMContentLoaded', async function () {
    const sharedFolders = document.querySelector('.shared_folders');
    const loading = document.querySelector('.loadingContainer');
    loading.setAttribute('active', 'true');

    setCookie('selectedFolder', '', 0);

    const res = await fetchFolders();
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


function implementFolders(folders) {
    const sharedFolders = document.querySelector('.shared_folders');
    console.log(folders);
    folders.forEach(folder => {
        const folderDiv = document.createElement('div');
        if(folder.isdir === true) {
            folderDiv.classList.add('folder');
            folderDiv.setAttribute('onclick', "selectFolder('" + folder.path + "')");
        }else {
            folderDiv.classList.add('file');
        }
        folderDiv.innerHTML = `
            <h3>${folder.name}</h3>
            <p>Path: ${folder.path}</p>`;
        sharedFolders.appendChild(folderDiv);
        console.log(folder);
    });
}

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