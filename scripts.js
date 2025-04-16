const users = 
{
    user1: "password123",
    user2: "password456",
};

let uploadedFiles = []; //used to store uploaded file names

function login(event) 
{
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (users[username] && users[username] === password) 
    {
        localStorage.setItem('loggedInUser', username);
        window.location.href = "dashboard.html";
    } 
    else 
    {
        document.getElementById('loginError').innerText = "Invalid username or password.";
    }
}

function uploadFile() 
{
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) 
    {
        uploadedFiles.push(file.name); //save file name
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles)); // save to localStorage
        displayFiles(); 
        alert('File uploaded successfully!');
    }
}

function displayFiles() 
{
    // load from localStorage
    const storedFiles = localStorage.getItem('uploadedFiles');
    uploadedFiles = storedFiles ? JSON.parse(storedFiles) : [];

    const fileTable = document.getElementById('fileTable');
    fileTable.innerHTML = `<tr><th>Filename</th><th>Actions</th></tr>`;
    uploadedFiles.forEach(file => 
    {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${file}</td>
            <td>
                <button onclick="downloadFile('${file}')">Download</button>
                <button onclick="deleteFile('${file}')">Delete</button>
            </td>
        `;
        fileTable.appendChild(row);
    });
}

function downloadFile(filename) 
{
    alert('Pretending to download: ' + filename); 
}

function deleteFile(filename) 
{
    // remove from list
    uploadedFiles = uploadedFiles.filter(file => file !== filename);
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles)); // update storage
    displayFiles(); 
}

function logout() 
{
    localStorage.removeItem('loggedInUser');
    window.location.href = "index.html";
}

document.getElementById('loginForm')?.addEventListener('submit', login); // safe check

window.onload = function () 
{
    if (window.location.pathname.includes("dashboard.html")) 
    {
        if (!localStorage.getItem('loggedInUser')) 
        {
            window.location.href = "index.html";
        } 
        else 
        {
            displayFiles(); // show saved file names
        }
    }
};
