// ** PRODUCTION SHOULD USE THE CORRECT URL **
const urlBase = `http://${document.location.host}/LAMPAPI`;
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

let globalPage = 1;

function doLogin() {
  userId = 0;
  firstName = "";
  lastName = "";

  let login = document.getElementById("loginName").value;
  let password = document.getElementById("loginPassword").value;
  password = md5(password);

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
            <div class="p-2 m-2 d-flex alert alert-warning fade alert-dismissable" role="alert">
              <div>Incorrect username or password!</div>
              <button type="button" class="btn-close ms-1" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          `);

          $("#toasts").html(`
          <div class="toast show fade">
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
      <h1 id="userName" class="navbar-brand" href="#">Hello, <strong>${firstName} ${lastName}</strong>!</h1>
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
  password = md5(password);

  if (!firstName || !lastName || !login || !password) {
    console.log("missing information! not creating user...")
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
          let jsonObject = JSON.parse(xhr.responseText);
          if(jsonObject.error) {
            $("#toasts").append(`
              <div class="toast show">
                <div class="toast-header">
                  <strong class="me-auto">An error has occured!</strong>
                  <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                  ${jsonObject.error}
                </div>
              </div>
          `)
          }
          else {
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
        }
      };
      xhr.send(json);
    }
    catch(err) {
      $("#createAccountResult").text(err.message);
    }
  }
}

function setNullIfBlank(str) {
  if (str && str.trim()) {
    return str
  }
  return null;
}

async function refreshContacts() {
  // $("#allContactsView").fadeOut(500, function() {
  //   $(this).empty();
  //   showContacts(globalPage);
  //   $(this).fadeIn();
  // });

  // await $("#contactsNav").fadeOut().promise();
  $("#contactsNav").hide();
  await $("#allContactsView").fadeOut().promise();
  $("#allContactsView").empty();
  showContacts(globalPage);
  await $("#allContactsView").fadeIn().promise();
  $("#contactsNav").show();
}

function addContact() {
  console.log("Trying to add contact...");

  let form = document.getElementById("addContactForm");
  console.log(form.checkValidity());


  if (form.checkValidity()) {
    // Get necessary information for a contact from inputs
    let name = $("#fullNameInput").val();
    let phone = setNullIfBlank($("#phoneInput").val());
    let email = setNullIfBlank($("#emailInput").val());
    let address = setNullIfBlank($("#addressInput").val());
    let birthday = setNullIfBlank($("#birthdayInput").val());
    let favorite = $("#favoriteInput").is(":checked");
    let picture = setNullIfBlank($("#pictureInput").val());
    let notes = setNullIfBlank($("#noteInput").val());

    // Create JSON object to send to database
    let json = JSON.stringify({
      name: name,
      phone: phone,
      email: email,
      address: address,
      birthday: birthday,
      userId: userId,
      favorite: favorite,
      picture: picture,
      notes: notes,
    });

    let url = `${urlBase}/AddContact.${extension}`;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
      xhr.onreadystatechange = function () {

        if (this.readyState == 4 && this.status == 200) {
          $("#toasts").html(`
          <div class="toast show">
            <div class="toast-header">
              <strong class="me-auto">Success!</strong>
              <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
              ${name} was added to your contacts!
            </div>
          </div>
        `)
        }
      };
      xhr.send(json);
      refreshContacts();
    }
    catch (err) {
      $("#toasts").html(`
      <div class="toast show" role="alert" data-bs-delay="1000">
        <div class="toast-header">
          <strong class="me-auto">An error has occurred!</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${err.message}
        </div>
      </div>
    `)
    }
  }
  
}


function editContact(id) {
  let contact = $(`#contact-${id}`)[0];

  // ensures that editContact function cannot be called multiple times on same contact
  if ($(`#contact-${id}`).find(`[id^='editContactForm-${id}']`)[0] !== undefined) {
    return;
  }

  let contactClone = contact.cloneNode(true);  // for cancel function

  // function to create input objects
  var createInput = function (field, placeholderIn, actuallyValue) {
    let input;
    if (actuallyValue) {
      input = $("<input>", {
        class: 'form-control form-control-sm',
        id: `editContactInput-${field}`,
        type: 'text',
        value: placeholderIn
      });
    }
    else {
      input = $("<input>", {
        class: 'form-control form-control-sm',
        id: `editContactInput-${field}`,
        type: 'text',
        placeholder: placeholderIn
      });
    }

    return input
  }

  //  function to create input objects as HTML string
  var createInputHTMLString = function (field, placeholderIn, actuallyValue, type = "text") {
    let input;
    if (actuallyValue) {
      input = `<input class="form-control form-control-sm" id="editContactInput-${field}" type="${type}" value="${placeholderIn}" />`
    }
    else {
      input = `<input class="form-control form-control-sm" id="editContactInput-${field}" type="${type}" placeholder="${placeholderIn}" />`
    }
    return input
  }

  var submitForm = function (event) {
    event.preventDefault();
    let emailVal = setNullIfBlank($("#editContactInput-email").val());
    let phoneVal = setNullIfBlank($("#editContactInput-phone").val());
    let addressVal = setNullIfBlank($("#editContactInput-address").val());
    let birthdayVal = setNullIfBlank($("#editContactInput-birthday").val());
    let notesVal = setNullIfBlank($("#editContactInput-notes").val());
    let nameVal = setNullIfBlank($("#editContactInput-name").val());
    let pfpVal = setNullIfBlank($("#editContactInput-pfp").val());
    let favoriteVal;


    if ($(`#favContact-${id}`).children().first().attr("class") === "bi bi-star") {
      favoriteVal = false;
    }
    else {
      favoriteVal = true;
    }

    let json = JSON.stringify({
      name: nameVal,
      phone: phoneVal,
      email: emailVal,
      address: addressVal,
      birthday: birthdayVal,
      id: id,
      favorite: favoriteVal,
      picture: pfpVal,
      notes: notesVal
    });

    console.log(json);

    let url = `${urlBase}/EditContact.${extension}`;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
      if (!name) {
        throw new Error("No name defined!");
      }
      xhr.onreadystatechange = function () {

        if (this.readyState == 4 && this.status == 200) {
          console.log("Successfully edited contact!");
        }
      };
      xhr.send(json);
    }
    catch (err) {
      $("#toasts").html(`
        <div class="toast show">
          <div class="toast-header">
          <strong class="me-auto">An error has occurred!</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">
          ${err.message}
          </div>
        </div>
	  `)
    }

    refreshContacts();

  }

  // Create a form element
  let form = $("<form>", {
    id: `editContactForm-${id}`,
    //action: `submitForm(event)`
  });
  contact.append(form[0]);

  // append header and body of contact container into form tag
  let cardHeader = $(`#contact-${id}`).find(`[class*="card-header d-flex"]`);
  let cardBody = $(`#contact-${id}`).find(`[class*="card-body d-flex"]`);
  cardHeader.detach().appendTo(`#editContactForm-${id}`);
  cardBody.detach().appendTo(`#editContactForm-${id}`);

  //handle name input
  let name = $(`#contact-${id}`).find(`[class*="mb-0 name"]`);
  name.hide();
  // name.after(createInput("name", name.text(), true));
  name.after(`<input class="form-control" id="editContactInput-name" type="text" value="${name.text()}" maxlength="50" required>`)

  // handle pfp input
  let pfpSrc = cardBody.find(`[class*="profilePicture rounded-circle"]`);
  pfpSrc.hide();
  // pfpSrc.after(createInput("pfp", pfpSrc.attr("src").toString(), true));
  // let inputPfpString = createInput("pfp", pfpSrc.attr("src").toString(), true);

  //handle fields											
  let infoContainer = $(`#contact-${id}`).find(`[class*="contactInfo my-auto"]`);
  let phone = $(`#contact-${id}`).find(`[class*="bi bi-telephone-fill me-1"]`).next();
  let email = $(`#contact-${id}`).find(`[class*="bi bi-envelope-fill me-1"]`).next();
  let address = $(`#contact-${id}`).find(`[class*="bi bi-house-door-fill me-1"]`).next();
  let birthday = $(`#contact-${id}`).find(`[class*="bi bi-cake-fill me-1"]`).next();
  let notes = $(`#contact-${id}`).find(`[class*="bi bi-sticky-fill me-1"]`).next();

  infoContainer.addClass("p-1");

  let inputPhoneString;
  if (phone.text() === "") {
    inputPhoneString = createInputHTMLString("phone", "***-***-****", null, "tel");
  } else { inputPhoneString = createInputHTMLString("phone", phone.text(), true, "tel"); }

  let inputEmailString;
  if (email.text() === "") {
    inputEmailString = createInputHTMLString("email", "example@domain.com", null, "email");
  } else { inputEmailString = createInputHTMLString("email", email.text(), true, "email"); }

  let inputAddressString;
  if (address.text() === "") {
    inputAddressString = createInputHTMLString("address", "123 Example Street");
  } else { inputAddressString = createInputHTMLString("address", address.text(), true); }

  let inputBirthdayString;
  if (birthday.text() === "") {
    inputBirthdayString = `<input type="date" data-format="yyyy-MM-dd" class="form-control form-control-sm" id="editContactInput-birthday">`;
  } else { inputBirthdayString = `<input type="date" data-format="yyyy-MM-dd" value="${birthday.text()}" class="form-control form-control-sm" id="editContactInput-birthday">` }

  let inputNotesString;
  if (notes.text() === "") {
    inputNotesString = createInputHTMLString("notes", "Write some notes!");
  } else { inputNotesString = createInputHTMLString("notes", notes.text(), true); }

  infoContainer.empty();

  let htmlString =
    `
    <div class="d-flex align-items-center mb-1">
        <i class="bi bi-card-image me-2"></i>
        <input class="form-control form-control-sm" id="editContactInput-pfp" type="url" value="${pfpSrc.attr("src").toString()}" />
    </div>` +
    `
	 <div class="d-flex align-items-center mb-1">
        <i class="bi bi-telephone-fill me-2"></i>` +
    inputPhoneString +
    `</div>
    
      <div class="d-flex align-items-center mb-1">
        <i class="bi bi-envelope-fill me-2"></i>` +
    inputEmailString +
    `</div>
    
      <div class="d-flex align-items-center mb-1">
        <i class="bi bi-house-door-fill me-2"></i>` +
    inputAddressString +
    `</div>
    
      <div class="d-flex align-items-center">
        <i class="bi bi-cake-fill me-2"></i> ` +
    inputBirthdayString +
    `</div>
    
      <div class="d-flex align-items-center">
        <i class="bi bi-sticky-fill me-2"></i> ` +
    inputNotesString +
    `</div>
	`

  infoContainer.append(htmlString);

  // function so that clicking the cancel button restores the contact
  var cancelEditContact = function (event) {
    event.preventDefault();
    let parent = $(`#allContactsView`);
    parent[0].insertBefore(contactClone, contact);
    contact.remove();
    parent[0].insert
  };

  // cancel button
  let cancelButton = $("<button>", {
    id: `editContact-cancelButton-${id}`,
    class: "btn",
    html: `<i class="bi bi-x-circle"></i>`,
    "aria-label": "Cancel Editing",
  });

  // submit button
  let submitButton = $("<button>", {
    id: `editContact-submitButton-${id}`,
    type: "submit",
    form: `editContactForm-${id}`,
    class: "btn",
    html: `<i class="bi bi-check-circle-fill"></i>`,
    "aria-label": "Submit Edits",
  });

  cancelButton.on("click", function () { cancelEditContact(event); });
  submitButton.on("click", function () { submitForm(event); });

  // Append cancel and apply buttons to header (inside the contact options div)
  let contactOptions = $(`#contact-${id}`).find(`[class*="contactOptions"]`);
  contactOptions.hide();
  
  cardHeader.append(cancelButton);
  cardHeader.append(submitButton);
  //infoContainer.append(submitButton);

}
	


function deleteContact(id) {
	// console.log("deleteContact-" + id + " called");
	let json = JSON.stringify
	(
		{
			contactID:id
		}
	);
	// console.log(json);
	let url = `${urlBase}/DeleteContact.${extension}`;
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	xhr.send(json);
	
	refreshContacts();
}

function showDeleteModal(id, name){	
	let modalContent = $(document).find("#deleteContactModalContent")[0];
	modalContent.innerHTML = 
	`
		<div class="modal-header">
			<h1 class="modal-title fs-5">Delete Contact Confirmation</h1>
		</div>
    <div>
      <p class="modal-body fs-5" id="deleteContactModalLabel">Are you sure you want to remove <strong>${name}</strong>? This action cannot be undone.</p>
    </div>
		<div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
			  <input type="submit" class="btn btn-danger" data-bs-dismiss="modal" onclick="deleteContact(${id});" value="Delete Contact">
          </div>
	`;

}

function createContactDiv(id, name, phone, email, picture, address, birthday, notes, favorite) {
  // creates a nicely styled div that looks nice in a list
  let htmlString = `
  <div id="contact-${id}" class="card mb-3 shadow-sm" data-contact-id="${id}">
    <div class="card-header d-flex">
      <div class="nameContainer flex-fill my-auto">
        <h6 class="mb-0 name"><strong>${name}</strong></h6>
      </div>

      <div class="contactOptions">
  `

  if (favorite == false) {
    htmlString += `
      <button type="button" aria-label="Favorite ${name}. Currently set to ${favorite}" onclick="toggleFavorite(${id}, ${favorite})" id="favContact-${id}" class="btn p-2"><i class="bi bi-star"></i></button>
    `
  }
  else {
    htmlString += `
      <button type="button" aria-label="Favorite ${name}. Currently set to ${favorite}" onclick="toggleFavorite(${id}, ${favorite})" id="favContact-${id}" class="btn p-2"><i class="bi bi-star-fill"></i></button>
    `
  }

  htmlString += `
        <button type="button" aria-label="Edit information for ${name}"  onclick='editContact(${id})' id="editContact-${id}" class="btn"><i class="bi bi-pencil-square"></i></button>
        <button type="button" aria-label="Delete ${name}" onclick='showDeleteModal(${id}, "${name}")'  id="deleteContact-${id}" class="btn" data-bs-toggle="modal" data-bs-target="#deleteContactModal"><i class="bi bi-trash3-fill"></i></button>
      </div>
    </div>
  `

  htmlString += `
    <div class="card-body d-flex">
  `

  if (picture != null) {
    htmlString += `
      <div class="my-auto pe-4 d-flex">
        <img src="${picture}" class="profilePicture rounded-circle" alt="">
      </div>
    `
  }
  else {
    htmlString += `
      <div class="my-auto pe-4 d-flex">
        <img src="/images/default.png" class="profilePicture rounded-circle" alt="">
      </div>
    `
  }

  htmlString += `
    <div class="contactInfo my-auto">
  `

  if (phone != null) {
    htmlString += `
      <div class="d-flex align-items-center mb-1">
        <i class="bi bi-telephone-fill me-1"></i>
        <p class="mb-0">${phone}</p>
      </div>
    `
  }

  if (email != null) {
    htmlString += `
      <div class="d-flex align-items-center mb-1">
        <i class="bi bi-envelope-fill me-1"></i>
        <p class="mb-0">${email}</p>
      </div>
    `
  }

  if (address != null) {
    htmlString += `
      <div class="d-flex align-items-center mb-1">
        <i class="bi bi-house-door-fill me-1"></i>
        <p class="mb-0">${address}</p>
      </div>
    `
  }

  if (birthday != null) {
    htmlString += `
      <div class="d-flex align-items-center">
        <i class="bi bi-cake-fill me-1"></i>
        <p class="mb-0">${birthday}</p>
      </div>
    `
  }

  if (notes != null) {
    htmlString += `
      <div class="d-flex align-items-center">
        <i class="bi bi-sticky-fill me-1"></i>
        <p class="mb-0">${notes}</p>
      </div>
    `
  }

  htmlString += `
        </div>
    </div>
  </div>
  `

  return htmlString;
}

function showContacts(page = 1) {
  globalPage = page;
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
        num_contacts = results.length
        page_length = 15
        num_pages = Math.ceil(num_contacts / page_length)
        starting_i = (page-1)*page_length
        ending_i = starting_i + 11

        if (ending_i > num_contacts) {
          ending_i = num_contacts
        }
        sendContactsToPage(results.slice(starting_i, ending_i))

        num_page_buttons = Math.min(num_pages, 24)

        if (page == 1) {
          li1_class = "page-item disabled"
        } else {
          li1_class = "page-item"
        }

        let htmlString = `
          <nav aria-label="Pagination">
            <ul class="pagination justify-content-center flex-wrap m-5">
              <li class="${li1_class}">
                <a class="page-link" href="#" onclick="showContacts(${page-1})" tabindex="-1" aria-label="Previous">&laquo;</a>
              </li>
        `

        first_page_button = Math.max(1, page - Math.floor(num_page_buttons / 2))
        last_page_button = Math.min(num_pages, page + Math.floor(num_page_buttons /2) - 1)

        for (let i = first_page_button; i <= last_page_button; i++) {
          if (i == page) {
            li_class = "page-item active"
          } else {
            li_class = "page-item"
          }
          htmlString += `
              <li class="${li_class}">
                <a class="page-link" href="#" onclick="showContacts(${i})">${i}</a>
              </li>
          `
        }

        if (page == num_pages) {
          lie_class = "page-item disabled"
        } else {
          lie_class = "page-item"
        }

        htmlString += `
              <li class="${lie_class}">
                <a class="page-link" href="#" onclick="showContacts(${page+1})" tabindex="-1" aria-label="Next">&raquo;</a>
              </li>
            </ul>
          </nav>
        `

        $("#contactsNav").empty()
        $("#contactsNav").append(htmlString);

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
        // console.log(json);
        results = json["results"];
        sendContactsToPage(results)
      }
    }
    xhr.send(postJSON)
  }
  catch (err) {
    console.log(err);
  }
}

function toggleFavorite(id, favoriteStatus) {
  let json = JSON.stringify({
    id: id,
    favorite: favoriteStatus,
  });

  let url = `${urlBase}/ToggleFavorite.${extension}`;
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        if (favoriteStatus == false) {
          // now its true
          $(`#favContact-${id}`).attr("onclick", `toggleFavorite(${id}, ${!favoriteStatus})`)
          $(`#favContact-${id}`).children().removeClass('bi-star');
          $(`#favContact-${id}`).children().addClass('bi-star-fill');
        }
        else {
          // now its false
          $(`#favContact-${id}`).attr("onclick", `toggleFavorite(${id}, ${!favoriteStatus})`)
          $(`#favContact-${id}`).children().removeClass('bi-star-fill');
          $(`#favContact-${id}`).children().addClass('bi-star');
        }
      }
    }
    xhr.send(json)
  }
  catch (err) {
    console.log(err);
  }
}

function sendContactsToPage(contacts) {
  $("#allContactsView").empty();
  if (contacts != null) {
    contacts.forEach(contact => {
      let id = contact["id"];
      let name = contact["name"];
      let phone = contact["phone"];
      let email = contact["email"];
      let picture = contact["picture"];
      let address = contact["address"];
      let birthday = contact["birthday"];
      let notes = contact["notes"];
      let favorite = contact["favorite"];

      $("#allContactsView").append(createContactDiv(id, name, phone, email, picture, address, birthday, notes, favorite));
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

function clearAddContactForm() {
  $("#addContactForm")[0].reset();
  $("#addContactForm").removeClass("was-validated");
}

// function validateForm(name, phone, email, address, birthday, favorite, picture, notes) {
//   if ()
// }

// extra functions to load after the window loads
$(function () {
  console.log("Contact Manager!!!")

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

  $("#addContactModal").on("hidden.bs.modal", function() {
    clearAddContactForm();
  });

  // bro..
  const addContactForm = $(document).find("#addContactForm")[0];
  if (addContactForm) {
    addContactForm.addEventListener('submit', event => {
      event.preventDefault();
    })
  }

  const forms = $(document).find('.needs-validation')

  // Loop over all forms and prevent submission if validation fails
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.checkValidity()) {
        event.stopPropagation();
        console.log("invalid form");
      }

      form.classList.add('was-validated');

    }, false)
  })


})
