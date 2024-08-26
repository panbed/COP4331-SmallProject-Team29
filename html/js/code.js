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
          $("#loginResult").html(`
            <div class="p-2 m-2 d-flex alert alert-warning alert-dismissable" role="alert">
              <div>Incorrect username or password!</div>
              <button type="button" class="btn-close ms-1" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          `);

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
    document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
    $("#userName").html(`
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

function addContact() {
  // Get necessary information for a contact from inputs
  let name = $("#contactNameInput").val();
  let phone = $("#contactPhoneInput").val();
  let email = $("#contactEmailInput").val();

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

function createContactDiv(name, phone, email) {
  // creates a nicely styled div that looks nice in a list
  let htmlString = `
  <div class="card mb-3">
    <div class="card-header d-flex">
      <div class="flex-fill my-auto">
        <h3 class="mb-0"><strong>${name}</strong></h3>
      </div>

      <div class="">
        <button type="button" id="favContact" class="btn p-2""><i class="bi bi-star"></i></button>
        <button type="button" id="editContact" class="btn btn-secondary"><i class="bi bi-pencil-square"></i></button>
        <button type="button" id="deleteContact" class="btn btn-secondary"><i class="bi bi-trash3-fill"></i></button>
      </div>
    </div>
    <div class="card-body">
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
  `

  return htmlString;
}

function showContacts() {
  let search = "";
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
            let name = contact["name"];
            let phone = contact["phone"];
            let email = contact["email"];

            $("#allContactsView").append(createContactDiv(name, phone, email));
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
            let name = contact["name"];
            let phone = contact["phone"];
            let email = contact["email"];

            $("#allContactsView").append(createContactDiv(name, phone, email));
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
  let theme = localStorage.getItem("theme");
  console.log(theme);
  if (theme == null) {
    if (window.matchMedia) {
      // set theme based on user's dark/light mode preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        localStorage.setItem("theme", "dark");
      }
      else {
        localStorage.setItem("theme", "light");
      }
    }
    // default to light mode if matchMedia attribute not available in browser
    else {
      localStorage.setItem("theme", "light");
    }
  }
  // set theme based on localstorage
  else {
    $("html").attr("data-bs-theme", theme);
  }

}

// extra functions to load after the window loads
$(function () {
  console.log("Document ready.")

  // read localstorage and set options
  setTheme();

  $("#searchBar").on("input", () => {
    searchContacts();
  });

  $("#loginName, #loginPassword").on("keydown", (event) => {
    if (event.key === "Enter") {
      if (!$("#loginButton").prop("disabled")) {
        doLogin();
      }
    }
  });

})
