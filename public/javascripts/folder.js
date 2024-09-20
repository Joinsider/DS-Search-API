window.addEventListener('DOMContentLoaded', async () => {
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


async function fetchFolders(apiEndpoint) {
    if(!apiEndpoint) {
        return false
    }
    try {
        const response = await fetch(apiEndpoint, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const folders = await response.json();

        if (folders.length === 0) {
            return false;
        }

        return folders;
    } catch (error) {
        console.error("Error:", error);
        return false;
    }
}

function implementFolders(folders) {
    const sharedFolders = document.querySelector('.shared_folders');
    let id = 0;
    console.log(folders);
    folders.forEach(folder => {
        const folderDiv = document.createElement('div');
        if(folder.isdir === true) {
            folderDiv.classList.add('folder');
            folderDiv.setAttribute('onclick', "selectFolder('" + folder.path + "', " + id + ")");
        }else {
            folderDiv.classList.add('file');
        }
        folderDiv.id = id.toString();
        id++;
        folderDiv.innerHTML = `
            <h3>${folder.name}</h3>
            <p>Path: ${folder.path}</p>`;
        sharedFolders.appendChild(folderDiv);
        console.log(folder);
    });
}
