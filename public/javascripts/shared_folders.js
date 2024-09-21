document.addEventListener('DOMContentLoaded', async function () {
    const sharedFolders = document.querySelector('.shared_folders');
    const loading = document.querySelector('.loadingContainer');
    loading.setAttribute('active', 'true');

    await updateFolders();

    loading.setAttribute('active', 'false');
});

function noFolders(error) {
    const sharedFolders = document.querySelector('.shared_folders');
    const noFolders = document.createElement('div');
    noFolders.classList.add('no-shared-folders');
    if(error) {
        noFolders.innerHTML = '<h3>Error: ' + error + '</h3>';
    }else {
        noFolders.innerHTML = '<h3>No shared folders found</h3>';
    }
    sharedFolders.appendChild(noFolders);
}

// Get the folders from the API endpoint
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

// Select a folder, then update the folders
async function selectFolder(path, id) {
    console.log("Selected folder:", path);
    setCookie('selectedFolder', path, 1);
    localStorage.setItem('selectedFolderId', id);

    // Find the folder with the correct path element
    const folders = document.querySelectorAll('.folder');
    folders.forEach(folder => {
        if(folder.querySelector('p').textContent.includes(path)) {
            folder.setAttribute('selected', 'true');
        }else {
            folder.removeAttribute('selected');
        }
    });

    await updateFolders();
}

// Update the folders on the page
async function updateFolders() {
    const sharedFolders = document.querySelector('.shared_folders');
    sharedFolders.innerHTML = '';
    const path = check_path();

    let endpoint = '/api/list_share';
    let isShare = true;
    if(path !== false) {
        endpoint = `/api/list`;
        isShare = false;
    }

    try {
        const res = await fetchFolders(endpoint);
        if (res === false) {
            return noFolders();
        }
        sharedFolders.innerHTML = '';
        implementFolders(res, isShare);
    } catch (error) {
        console.error("Error:", error);
        noFolders(error);
    }
}

// Check if a path is set in the cookies
function check_path() {
    const path = getCookie('selectedFolder');
    if(!path) {
        console.log("No path found");
        return false;
    }
    return path;
}

// Implement the folders on the page
function implementFolders(folders, isShare) {
    const sharedFolders = document.querySelector('.shared_folders');
    let id = 0;
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
        if(folder.isdir === true) {
            if(isShare === true) {
                folderDiv.innerHTML = `
                <img src="images/share-icon.svg" alt="Folder" class="file_icon">
                <h3 class="name">${folder.name}</h3>
                <p class="path">${folder.path}</p>`;
            }else {
                folderDiv.innerHTML = `
            <img src="images/folder-icon.svg" alt="Share" class="file_icon">
            <h3 class="name">${folder.name}</h3>
            <p class="path">${folder.path}</p>`;
            }
        } else {
            folderDiv.innerHTML = `
            <img src="images/file-icon.svg" alt="Share" class="file_icon">
            <h3 class="name">${folder.name}</h3>
            <p class="path">${folder.path}</p>`;
        }

        const icon = document.createElement('img');
        icon.classList.add('file_icon');
        icon.src = check_type(folder, isShare);
        folderDiv.appendChild(icon);

        const name = document.createElement('h3');
        name.classList.add('name');
        name.textContent = folder.name.toString;
        folderDiv.appendChild(name);

        const pathElement = document.createElement('p');
        pathElement.classList.add('path');
        pathElement.textContent = folder.path.toString;
        folderDiv.appendChild(pathElement);

        sharedFolders.appendChild(folderDiv);
    });

    // Update the heading
    const h2 = document.getElementById('fType');
    if(isShare === true) {
        h2.textContent = 'Shared Folders';
    } else {
        h2.textContent = 'Folders';
    }

    // Set the header
    setHeader();
}

function check_type(element, isShare) {
    const imageArr = [".ico", ".jpeg", ".jpg", ".png", ".raw", ".gif", ".tiff", ".svg", ".bmp", ".webp", ".heif"]
    let src = '';
    if(element.isdir === true) {
        if(isShare === true) {
            src = 'images/share-icon.svg';
        } else if(element.path.includes('#recycle')){
            src = 'images/recycle-icon.svg';
        } else {
            src = 'images/folder-icon.svg';
        }
    } else {
        if(element.path.includes('.pdf')) {
            src = 'images/pdf-icon.svg';
        } else if(imageArr.some(img => element.path.includes(img))) {
            src = 'images/image-icon.svg';
        }else {
            src = 'images/file-icon.svg';
        }
    }
    return src;
}

// Set header
function setHeader() {

    const header = document.querySelector('.headerContainer');
    const backBtn = document.querySelector('.backBtn');

    if(backBtn) {
        header.removeChild(backBtn);
    }
    // Add a back button
    const backButton = document.createElement('button');
    backButton.classList.add('backBtn');
    backButton.textContent = 'Back';
    backButton.setAttribute('onclick', 'back()');
    header.appendChild(backButton);



    // Add a path element with the current path
    const pathElement = document.createElement('p');
    pathElement.classList.add('pathElement');
    pathElement.textContent = folder.path;

    header.appendChild(pathElement);

    // Add a search bar
    const searchForm = document.createElement('form');
    searchForm.classList.add('searchForm');

    const searchInput = document.createElement('input');
    searchInput.classList.add('searchInput');
    searchInput.setAttribute('type', 'text');
    searchInput.setAttribute('placeholder', 'Search in current folder');
    searchInput.setAttribute('name', 'search');
    searchForm.appendChild(searchInput);

    const searchButton = document.createElement('button');
    searchButton.classList.add('searchButton');
    searchButton.textContent = 'Search';
    searchButton.setAttribute('type', 'submit');
    searchForm.appendChild(searchButton);

    header.appendChild(searchForm);
}

function back() {
    const path = getCookie('selectedFolder');

    if(path) {
        const splitPath = path.split('/');
        splitPath.pop();
        const newPath = splitPath.join('/');
        setCookie('selectedFolder', newPath, 1);
    }

    updateFolders();
}