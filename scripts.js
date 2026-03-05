const DEFAULT_USERS = 
{
    user1: "password123",
    user2: "password456",
};

let authMode = 'signin';

// Each uploaded file is stored as: { name: string, dataUrl: string }
let uploadedFiles = [];

function getCurrentUser() 
{
    return localStorage.getItem('loggedInUser') || null;
}

function getFilesForCurrentUser() 
{
    const user = getCurrentUser();
    if (!user) 
    {
        return [];
    }
    const key = `uploadedFiles_${user}`;
    const stored = localStorage.getItem(key);
    if (!stored) 
    {
        return [];
    }
    try 
    {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } 
    catch 
    {
        return [];
    }
}

function saveFilesForCurrentUser(files) 
{
    const user = getCurrentUser();
    if (!user) 
    {
        return;
    }
    const key = `uploadedFiles_${user}`;
    localStorage.setItem(key, JSON.stringify(files));
}

function getUsers() 
{
    const stored = localStorage.getItem('users');
    if (stored) 
    {
        try 
        {
            return JSON.parse(stored);
        } 
        catch 
        {
            // fall through to reset
        }
    }
    localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
    return { ...DEFAULT_USERS };
}

function saveUsers(users) 
{
    localStorage.setItem('users', JSON.stringify(users));
}

function showNotification(message, type = 'success') 
{
    const notificationEl = document.getElementById('notification');
    if (!notificationEl) 
    {
        return;
    }
    notificationEl.textContent = message;
    notificationEl.className = `notification ${type}`;

    if (type === 'success') 
    {
        setTimeout(() => 
        {
            notificationEl.className = 'notification';
            notificationEl.textContent = '';
        }, 2500);
    }
}

function login(event) 
{
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    const errorEl = document.getElementById('loginError');

    if (!username || !password) 
    {
        if (errorEl) 
        {
            errorEl.innerText = "Please fill in all required fields.";
        }
        return;
    }

    let users = getUsers();

    if (authMode === 'signin') 
    {
        if (users[username] && users[username] === password) 
        {
            if (errorEl) errorEl.innerText = "";
            localStorage.setItem('loggedInUser', username);
            window.location.href = "dashboard.html";
        } 
        else 
        {
            if (errorEl) 
            {
                errorEl.innerText = "Invalid username or password.";
            }
        }
    } 
    else 
    {
        if (users[username]) 
        {
            if (errorEl) 
            {
                errorEl.innerText = "That username is already taken. Choose another.";
            }
            return;
        }

        if (password.length < 6) 
        {
            if (errorEl) 
            {
                errorEl.innerText = "Password should be at least 6 characters.";
            }
            return;
        }

        if (password !== confirmPassword) 
        {
            if (errorEl) 
            {
                errorEl.innerText = "Passwords do not match.";
            }
            return;
        }

        users[username] = password;
        saveUsers(users);

        if (errorEl) errorEl.innerText = "";
        localStorage.setItem('loggedInUser', username);
        window.location.href = "dashboard.html";
    }
}

function switchAuthMode(mode) 
{
    authMode = mode === 'signup' ? 'signup' : 'signin';

    const signInTab = document.getElementById('signInTab');
    const signUpTab = document.getElementById('signUpTab');
    const confirmGroup = document.getElementById('confirmGroup');
    const heading = document.getElementById('authHeading');
    const subtitle = document.getElementById('authSubtitle');
    const submitButton = document.getElementById('authSubmitButton');
    const errorEl = document.getElementById('loginError');

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');

    if (signInTab && signUpTab) 
    {
        if (authMode === 'signin') 
        {
            signInTab.classList.add('active');
            signUpTab.classList.remove('active');
        } 
        else 
        {
            signUpTab.classList.add('active');
            signInTab.classList.remove('active');
        }
    }

    if (confirmGroup) 
    {
        confirmGroup.style.display = authMode === 'signup' ? 'block' : 'none';
    }

    if (heading) 
    {
        heading.textContent = authMode === 'signup' ? "Create your account" : "Secure File Manager";
    }

    if (subtitle) 
    {
        subtitle.textContent = authMode === 'signup'
            ? "Sign up to start storing and managing files."
            : "Sign in to manage and organize your files.";
    }

    if (submitButton) 
    {
        submitButton.textContent = authMode === 'signup' ? "Create account" : "Continue";
    }

    if (errorEl) 
    {
        errorEl.innerText = "";
    }

    if (usernameInput) usernameInput.value = "";
    if (passwordInput) passwordInput.value = "";
    if (confirmInput) confirmInput.value = "";
}

function uploadFile() 
{
    const fileInput = document.getElementById('fileInput');
    const file = fileInput?.files?.[0];

    if (!file) 
    {
        showNotification('Please choose a file to upload.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) 
    {
        const dataUrl = e.target.result;

        // Load existing files for this user
        uploadedFiles = getFilesForCurrentUser();

        // Add or replace file with same name
        uploadedFiles = uploadedFiles.filter(f => f.name !== file.name);
        uploadedFiles.push({ name: file.name, dataUrl });

        saveFilesForCurrentUser(uploadedFiles);
        displayFiles();
        showNotification('File uploaded successfully!');
        fileInput.value = '';
    };
    reader.onerror = function () 
    {
        showNotification('Failed to read file.', 'error');
    };

    reader.readAsDataURL(file);
}

function displayFiles() 
{
    // load from localStorage for current user
    uploadedFiles = getFilesForCurrentUser();

    const fileTable = document.getElementById('fileTable');
    if (!fileTable) 
    {
        return;
    }

    fileTable.innerHTML = `<tr><th>Filename</th><th>Actions</th></tr>`;

    if (!uploadedFiles.length) 
    {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="2" style="text-align: center; color: #6b7280; font-size: 0.85rem;">
                No files yet. Upload your first file to get started.
            </td>
        `;
        fileTable.appendChild(emptyRow);
    } 
    else 
    {
        uploadedFiles.forEach(file => 
        {
            const safeName = file.name.replace(/'/g, "\\'");
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${file.name}</td>
                <td>
                    <div class="file-actions">
                        <button onclick="downloadFile('${safeName}')">Download</button>
                        <button onclick="deleteFile('${safeName}')">Delete</button>
                    </div>
                </td>
            `;
            fileTable.appendChild(row);
        });
    }

    const fileCountBadge = document.getElementById('fileCountBadge');
    if (fileCountBadge) 
    {
        const count = uploadedFiles.length;
        fileCountBadge.textContent = count === 1 ? '1 file' : `${count} files`;
    }
}

function downloadFile(filename) 
{
    const file = uploadedFiles.find(f => f.name === filename);
    if (!file) 
    {
        showNotification('File data not found. Try re-uploading.', 'error');
        return;
    }

    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`Downloading "${file.name}"`);
}

function deleteFile(filename) 
{
    // remove from list
    uploadedFiles = uploadedFiles.filter(file => file.name !== filename);
    saveFilesForCurrentUser(uploadedFiles); // update storage
    displayFiles(); 
    showNotification('File deleted.');
}

function logout() 
{
    localStorage.removeItem('loggedInUser');
    window.location.href = "index.html";
}

document.getElementById('loginForm')?.addEventListener('submit', login); // safe check

window.onload = function () 
{
    // Login page setup
    if (document.getElementById('loginForm')) 
    {
        switchAuthMode('signin');
    }

    // Dashboard page setup
    if (window.location.pathname.includes("dashboard.html")) 
    {
        if (!localStorage.getItem('loggedInUser')) 
        {
            window.location.href = "index.html";
        } 
        else 
        {
            displayFiles(); // show saved file names

            const currentUser = localStorage.getItem('loggedInUser');
            const userEl = document.getElementById('currentUser');
            const userContainer = document.getElementById('currentUserContainer');
            if (currentUser && userEl && userContainer) 
            {
                userEl.textContent = currentUser;
                userContainer.style.display = 'inline';
            }
        }
    }
};