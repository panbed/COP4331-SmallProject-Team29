// ** PRODUCTION SHOULD USE THE CORRECT URL **
const urlBase = `http://${document.location.host}/LAMPAPI`;
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin() {
  userId = 0;
  firstName = "";
  lastName = "";

  let login = document.getElementById("loginName").value;
  let password = document.getElementById("loginPassword").value;
  //	var hash = md5( password );

  document.getElementById("loginResult").innerHTML = "";

  let tmp = { login: login, password: password };
  //	var tmp = {login:login,password:hash};
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + '/Login.' + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);
        userId = jsonObject.id;

        if (userId < 1) {
          // Print error message below the login window
          $("#toasts").html(`
            <div class="p-2 m-2 d-flex alert alert-warning alert-dismissable" role="alert">
              <div>Incorrect username or password!</div>
              <button type="button" class="btn-close ms-1" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          `);

          $("#toasts").html(`
          <div class="toast show">
            <div class="toast-header">
              <strong class="me-auto">Incorrect username or password!</strong>
              <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
              Please ensure you entered your information correctly, or sign up if needed.
            </div>
          </div>
        `)

          return;
          
        }

        firstName = jsonObject.firstName;
        lastName = jsonObject.lastName;

        saveCookie();

        window.location.href = "home.html";
      }
    };
    xhr.send(jsonPayload);
  }
  catch (err) {
    $("#loginResult").html(`
      <div class="p-2 m-2 d-flex alert alert-warning alert-dismissable" role="alert">
        <div>${err.message}</div>
        <button type="button" class="btn-close ms-1" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
		`);
  }

}

function saveCookie() {
  let minutes = 20;
  let date = new Date();
  date.setTime(date.getTime() + (minutes * 60 * 1000));
  document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie() {
  userId = -1;
  let data = document.cookie;
  let splits = data.split(",");
  for (var i = 0; i < splits.length; i++) {
    let thisOne = splits[i].trim();
    let tokens = thisOne.split("=");
    if (tokens[0] == "firstName") {
      firstName = tokens[1];
    }
    else if (tokens[0] == "lastName") {
      lastName = tokens[1];
    }
    else if (tokens[0] == "userId") {
      userId = parseInt(tokens[1].trim());
    }
  }

  if (userId < 0) {
    window.location.href = "index.html";
  }
  else {
    $("#userNameContainer").html(`
      <div id="userName" class="navbar-brand" href="#">Hello, <strong>${firstName} ${lastName}</strong>!</div>
    `);
  }
}

function doLogout() {
  userId = 0;
  firstName = "";
  lastName = "";
  document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
  window.location.href = "index.html";
}

function addUser() {
  let firstName = $("#regFirstName").val();
  let lastName = $("#regLastName").val();
  let login = $("#regUserName").val();
  let password = $("#regPassword").val();

  if (!firstName || !lastName || !login || !password) {
    console.log("missing information! not creating contact...")
  }
  else {
    let json = JSON.stringify({
      firstName: firstName,
      lastName: lastName,
      login: login,
      password: password
    });
  
    let url = `${urlBase}/AddUser.${extension}`;
    
    let xhr = new XMLHttpRequest();
    
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  
    try {
      xhr.onreadystatechange = function () {
        if(this.readyState == 4 && this.status == 200) {
          // $("#createAccountResult").text("Account created successfully!");
          $("#toasts").append(`
            <div class="toast show">
              <div class="toast-header">
                <strong class="me-auto">Successfully created account!</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
              </div>
              <div class="toast-body">
                Account has been created, redirecting to login page...
              </div>
            </div>
          `)

          setTimeout(() => window.location.href = "index.html", 3000);
        }
      };
      xhr.send(json);
    }
    catch(err) {
      $("#createAccountResult").text(err.message);
    }
  }
}

function addContact() {
  // Get necessary information for a contact from inputs
  let name = $("#fullNameInput").val();
  let phone = $("#phoneInput").val();
  let email = $("#emailInput").val();

  // Create JSON object to send to database
  let json = JSON.stringify({
    name: name,
    phone: phone,
    email: email,
    userId: userId
  });

  let url = `${urlBase}/AddContact.${extension}`;
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        $("#colorAddResult").text("Contact has been added");
      }
    };
    xhr.send(json);
  }
  catch (err) {
    $("#colorAddResult").text(err.message);
  }
}

function deleteContact(id) {
  // todo...
}

function showDeleteModal(id) {
  
}

function createContactDiv(id, name, phone, email) {
  // creates a nicely styled div that looks nice in a list
  let htmlString = `
  <div id="contact-${id}" class="card mb-3">
    <div class="card-header d-flex">
      <div class="nameContainer flex-fill my-auto">
        <h6 class="mb-0 name"><strong>${name}</strong></h6>
      </div>

      <div class="">
        <button type="button" id="favContact" class="btn p-2"><i class="bi bi-star"></i></button>
        <button type="button" id="editContact" class="btn"><i class="bi bi-pencil-square"></i></button>
        <button type="button" id="deleteContact" class="btn"><i class="bi bi-trash3-fill"></i></button>
      </div>
    </div>
    <div class="card-body d-flex">
      <div class="my-auto pe-4 d-flex">
        <img src="/images/default.png" class="profilePicture rounded-circle" alt="">
      </div>
      <div class="contactInfo my-auto">
        <div class="d-flex align-items-center mb-1">
          <i class="bi bi-telephone-fill me-1"></i>
          <p class="mb-0">${phone}</p>
        </div>
        <div class="d-flex align-items-center mb-1">
          <i class="bi bi-envelope-fill me-1"></i>
          <p class="mb-0">${email}</p>
        </div>
        <div class="d-flex align-items-center mb-1">
          <i class="bi bi-house-door-fill me-1"></i>
          <p class="mb-0">${"123 Example St"}</p>
        </div>
        <div class="d-flex align-items-center">
          <i class="bi bi-cake-fill me-1"></i>
          <p class="mb-0">${"Jan 1st, 2000"}</p>
        </div>
      </div>
    </div>
  </div>
  `

  return htmlString;
}

function showContacts() {
  let postJSON = JSON.stringify({
    userId: userId
  });

  let url = `${urlBase}/ShowContacts.${extension}`;
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let json = JSON.parse(xhr.responseText);
        results = json["results"];

        $("#allContactsView").empty();
        if (results != null) {
          results.forEach(contact => {
            let id = contact["id"];
            let name = contact["name"];
            let phone = contact["phone"];
            let email = contact["email"];

            $("#allContactsView").append(createContactDiv(id, name, phone, email));
          });
        }
        else {
          $("#allContactsView").append(`
            <div class="alert alert-warning" role="alert">
              No contacts found :-(
            </div>
          `);
        }
      }
    }
    xhr.send(postJSON)
  }
  catch (err) {
    console.log(err);
  }
}

function searchContacts() {
  let search = $("#searchBar").val();
  let postJSON = JSON.stringify({
    search: search,
    userId: userId
  });

  let url = `${urlBase}/SearchContacts.${extension}`;
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let json = JSON.parse(xhr.responseText);
        console.log(json);
        results = json["results"];

        $("#allContactsView").empty();
        if (results != null) {
          results.forEach(contact => {
            let id = contact["id"];
            let name = contact["name"];
            let phone = contact["phone"];
            let email = contact["email"];

            $("#allContactsView").append(createContactDiv(id, name, phone, email));
          });
        }
        else {
          $("#allContactsView").append(`
            <div class="alert alert-warning" role="alert">
              No contacts found :-(
            </div>
          `);
        }
      }
    }
    xhr.send(postJSON)
  }
  catch (err) {
    console.log(err);
  }
}

function toggleThemeLocalStorage() {
  let theme = localStorage.getItem("theme");
  if (theme == "dark") localStorage.setItem("theme", "light");
  else if (theme == "light") localStorage.setItem("theme", "dark");
  else {
    console.log("Unknown theme! Defaulting to light mode...")
    localStorage.setItem("theme", "light");
  }

  setTheme();
}

function setTheme() {
  if (localStorage.getItem("theme") == null) {
    // set theme based on user's dark/light mode preference on first load
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      localStorage.setItem("theme", "dark");
    }
    else {
      localStorage.setItem("theme", "light");
    }
  }
  
  // set theme based on localstorage
  $("html").attr("data-bs-theme", localStorage.getItem("theme"));
  setThemeIcon();
}

function setThemeIcon() {
  if (localStorage.getItem("theme") == "dark") {
    // currently in dark mode, icon should show dark mode (moon)
    // <i class=""></i>
    $("#themeIcon").attr("class", "bi bi-moon-fill")
  }
  else {
    // otherwise, assume we're in light mode and we need to show light mode icon
    $("#themeIcon").attr("class", "bi bi-sun-fill")
  }
}

// extra functions to load after the window loads
$(function () {
  console.log("Document ready.")

  // read localstorage and set options
  setTheme();
  setThemeIcon();

  $("#searchBar").on("input", () => {
    if ($("#searchBar").val() == "") {
      showContacts();
    } else {
      searchContacts();
    }
  });

  $("#loginName, #loginPassword").on("keydown", (event) => {
    if (event.key === "Enter") {
      if (!$("#loginButton").prop("disabled")) {
        doLogin();
      }
    }
  });

  // handle add contact modal
  $("#addContactModal").on("show.bs.modal", e => {
    console.log("contact modal shown!");
  });



  const forms = $(document).find('.needs-validation')

  console.log(forms);

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.checkValidity()) {
        event.stopPropagation();
      }

      form.classList.add('was-validated')
    }, false)
  })


})
