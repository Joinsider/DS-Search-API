document.addEventListener('DOMContentLoaded', async function () {
    const sharedFolders = document.querySelector('.shared_folders');
    const loading = document.querySelector('.loadingContainer');
    loading.setAttribute('active', 'true');

    const pathParameter = window.location.search;
    console.log("Path parameter:", pathParameter);
    if(pathParameter !== '') {
        const path = new URLSearchParams(pathParameter).get('path');

        const decodedPath = decodeURIComponent(path);
        console.log("Decoded path:", decodedPath);
        if(decodedPath !== null || decodedPath !== '') {
            setCookie('selectedFolder', decodedPath, 1);
        }
    } else {
        document.cookie = 'selectedFolder=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

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
    const selectedFolder = document.getElementById(id);
    if(selectedFolder.classList.contains('file')) {
        console.log("Selected folder is a file");

        // Download the file
        const folderPath = selectedFolder.getAttribute('path');
        console.log("Downloading file:", folderPath);
        // const encodedPath = encodeURIComponent(`"${folderPath}"`);
        const encodedPath = `"${folderPath}"`;
        window.location.href = `/api/download?path=${encodedPath}`;
        return;
    }else {
        console.log("Selected folder:", path);
        setCookie('selectedFolder', path, 1);
        localStorage.setItem('selectedFolderId', id);

        // Find the folder with the correct path element
        const folders = document.querySelectorAll('.folder');
        folders.forEach(folder => {
            if(folder.getAttribute('path') === path) {
                folder.setAttribute('selected', 'true');
            }else {
                folder.removeAttribute('selected');
            }
        });
        const urlpath = encodeURIComponent(path);
        window.location.href = '/folder?path=' + urlpath;
    }
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
    } else if (path === '' || path === null) {
        console.log("Empty path found");
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
        }else {
            folderDiv.classList.add('file');
            folderDiv.classList.add('folder');
        }
        folderDiv.id = id.toString();


        folderDiv.setAttribute('onclick', "selectFolder('" + folder.path + "', " + id + ")");

        id++;

        const icon = document.createElement('img');
        icon.classList.add('file_icon');
        icon.src = check_type(folder, isShare);
        folderDiv.appendChild(icon);

        const name = document.createElement('h3');
        name.classList.add('name');
        name.textContent = folder.name;
        folderDiv.appendChild(name);

        folderDiv.setAttribute('path', folder.path);
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

    const header = document.querySelector('.editContainer');

    header.innerHTML = '';
    header.innerHTML = `
    <form id="searchForm">
        <input type="text" id="search" name="search" placeholder="Search in current folder">
        <button type="submit" onclick="search()">Search</button>
    </form>
    <button class="backBtn" onclick="back()">Back</button>
    `
    /*
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
    */

    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        search();
    });
}

function back() {
    console.log("Going back");
    // Get Path from url parameter
    const pathParameter = window.location.search;
    let path = decodeURIComponent(new URLSearchParams(pathParameter).get('path'));
    console.log("Path from URL:", path);
    if(path === null || path === '') {
        path = getCookie('selectedFolder');
        if(path === null || path === '') {
            return window.location.href= '/sharedFolders'
        }
    }

    // Split the path
    const splitPath = path.split('/');
    splitPath.pop();
    const newPath = splitPath.join('/');

    // if the path is empty, go to the shared folders
    if(newPath === '') {
        window.location.href = '/sharedFolders';
    }

    // Set the new path
    setCookie('selectedFolder', newPath, 1);
    window.location.href = '/folder?path=' + newPath;


    updateFolders();
}


// Search for a file in the current folder
async function search() {

    const searchInput = document.getElementById('search');
    const pattern = searchInput.value;
    const path = getCookie('selectedFolder');
    if(pattern === '' || pattern === null || !path) {
        console.log("No search pattern or path found");
        return;
    }

    // Empty folders and deactivate form
    const sharedFolders = document.querySelector('.shared_folders');
    sharedFolders.innerHTML = '';

    const loading = document.querySelector('.loadingContainer');
    loading.setAttribute('active', 'true');

    const searchForm = document.getElementById('searchForm');
    searchForm.setAttribute('active', 'false');


    // Make POST request to start search
    try {
        const response = await fetch('/api/start_search?pattern=' + pattern, {
            method: 'GET'
        });

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Search response:", data);
        const taskId = data.data.taskid;

        console.log("Api response:", response);

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Task ID:", taskId);

        await checkSearch(taskId);

    } catch (error) {
        console.error("Error:", error);
    }

}

// Check the search
async function checkSearch(taskid) {
    try {
        const response = await fetch(`/api/search?taskid=${taskid}`, {
            method: 'GET'
        });

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const res = await response.json();
        console.log("Search response:", res);
        if(res.data.finished === false) {
            setTimeout(() => {
                checkSearch(taskid);
            }, 1000);
        } else if( res.data.files !== undefined) {
            implementFolders(res.data.files, false);

            // Deactivate Loading and activate form
            const loading = document.querySelector('.loadingContainer');
            loading.setAttribute('active', 'false');

        } else {
            noFolders();
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
