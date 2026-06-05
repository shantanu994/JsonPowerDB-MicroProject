// JPDB connection details
var jpdbBaseURL = "http://api.login2explore.com:5577";
var jpdbIRL = "/api/irl";
var jpdbIML = "/api/iml";
var dbName = "SCHOOL-DB";
var relName = "STUDENT-TABLE";
var connToken = "90935198|-31949240309766556|90958784";

// on page load
$(document).ready(function () {
  resetForm();
  $("#rollNo").on("blur", function () {
    checkRollNo();
  });
});

function getTrimmedValue(selector) {
  return $(selector).val().trim();
}

// check if roll no exists in db
function checkRollNo() {
  var rollNo = getTrimmedValue("#rollNo");
  if (rollNo === "") {
    alert("Please enter Roll No!");
    $("#rollNo").focus();
    return;
  }

  var getReq = createGET_BY_KEYRequest(
    connToken,
    dbName,
    relName,
    JSON.stringify({ "Roll-No": rollNo }),
  );

  jQuery.ajaxSetup({ async: false });
  var result = executeCommandAtGivenBaseUrl(getReq, jpdbBaseURL, jpdbIRL);
  jQuery.ajaxSetup({ async: true });

  if (result.status === 400) {
    // new record
    enableFormForSave();
  } else if (result.status === 200) {
    // existing record
    var data = JSON.parse(result.data).record;
    fillFormData(data);
    localStorage.setItem("recno", JSON.parse(result.data).rec_no);
    enableFormForUpdate();
  } else {
    showStatus("Unable to fetch record. Please try again.", "alert-danger");
  }
}

// fill form with data from db
function fillFormData(data) {
  $("#fullName").val(data["Full-Name"]);
  $("#class").val(data["Class"]);
  $("#birthDate").val(data["Birth-Date"]);
  $("#address").val(data["Address"]);
  $("#enrollDate").val(data["Enrollment-Date"]);
}

// validate all fields
function validateForm() {
  if (getTrimmedValue("#rollNo") === "") {
    alert("Roll No is required!");
    $("#rollNo").focus();
    return false;
  }
  if (getTrimmedValue("#fullName") === "") {
    alert("Full Name is required!");
    $("#fullName").focus();
    return false;
  }
  if (getTrimmedValue("#class") === "") {
    alert("Class is required!");
    $("#class").focus();
    return false;
  }
  if ($("#birthDate").val() === "") {
    alert("Birth Date is required!");
    $("#birthDate").focus();
    return false;
  }
  if (getTrimmedValue("#address") === "") {
    alert("Address is required!");
    $("#address").focus();
    return false;
  }
  if ($("#enrollDate").val() === "") {
    alert("Enrollment Date is required!");
    $("#enrollDate").focus();
    return false;
  }
  return true;
}

// get form data as json
function getFormData() {
  return JSON.stringify({
    "Roll-No": getTrimmedValue("#rollNo"),
    "Full-Name": getTrimmedValue("#fullName"),
    Class: getTrimmedValue("#class"),
    "Birth-Date": $("#birthDate").val(),
    Address: getTrimmedValue("#address"),
    "Enrollment-Date": $("#enrollDate").val(),
  });
}

// save new record
function saveData() {
  if (!validateForm()) return;

  var putReq = createPUTRequest(connToken, getFormData(), dbName, relName);

  jQuery.ajaxSetup({ async: false });
  var result = executeCommandAtGivenBaseUrl(putReq, jpdbBaseURL, jpdbIML);
  jQuery.ajaxSetup({ async: true });

  if (result.status === 200 || result.status === 304) {
    showStatus("Student record saved successfully!", "alert-success");
    resetForm();
  } else {
    showStatus("Something went wrong. Please try again.", "alert-danger");
  }
}

// update existing record
function updateData() {
  if (!validateForm()) return;

  var recno = localStorage.getItem("recno");
  if (!recno) {
    showStatus(
      "No record selected for update. Please fetch by Roll No.",
      "alert-danger",
    );
    return;
  }

  var jsonStr = JSON.stringify({
    "Full-Name": getTrimmedValue("#fullName"),
    Class: getTrimmedValue("#class"),
    "Birth-Date": $("#birthDate").val(),
    Address: getTrimmedValue("#address"),
    "Enrollment-Date": $("#enrollDate").val(),
  });

  var updateReq = createUPDATERecordRequest(
    connToken,
    jsonStr,
    dbName,
    relName,
    recno,
  );

  jQuery.ajaxSetup({ async: false });
  var result = executeCommandAtGivenBaseUrl(updateReq, jpdbBaseURL, jpdbIML);
  jQuery.ajaxSetup({ async: true });

  if (result.status === 200) {
    showStatus("Student record updated successfully!", "alert-success");
    resetForm();
  } else {
    showStatus("Something went wrong. Please try again.", "alert-danger");
  }
}

// reset form to initial state
function resetForm() {
  $("#rollNo").val("");
  $("#fullName").val("");
  $("#class").val("");
  $("#birthDate").val("");
  $("#address").val("");
  $("#enrollDate").val("");

  localStorage.removeItem("recno");

  $("#rollNo").prop("disabled", false);
  $("#fullName").prop("disabled", true);
  $("#class").prop("disabled", true);
  $("#birthDate").prop("disabled", true);
  $("#address").prop("disabled", true);
  $("#enrollDate").prop("disabled", true);

  $("#saveBtn").prop("disabled", true);
  $("#updateBtn").prop("disabled", true);
  $("#resetBtn").prop("disabled", true);

  $("#statusMsg").hide();
  $("#rollNo").focus();
}

// enable fields for new record
function enableFormForSave() {
  $("#fullName").prop("disabled", false);
  $("#class").prop("disabled", false);
  $("#birthDate").prop("disabled", false);
  $("#address").prop("disabled", false);
  $("#enrollDate").prop("disabled", false);

  $("#saveBtn").prop("disabled", false);
  $("#updateBtn").prop("disabled", true);
  $("#resetBtn").prop("disabled", false);

  $("#fullName").focus();
}

// enable fields for existing record
function enableFormForUpdate() {
  $("#rollNo").prop("disabled", true);
  $("#fullName").prop("disabled", false);
  $("#class").prop("disabled", false);
  $("#birthDate").prop("disabled", false);
  $("#address").prop("disabled", false);
  $("#enrollDate").prop("disabled", false);

  $("#saveBtn").prop("disabled", true);
  $("#updateBtn").prop("disabled", false);
  $("#resetBtn").prop("disabled", false);

  $("#fullName").focus();
}

// show status message
function showStatus(msg, type) {
  $("#statusMsg")
    .removeClass("alert-success alert-danger")
    .addClass(type)
    .text(msg)
    .show();
  setTimeout(function () {
    $("#statusMsg").hide();
  }, 3000);
}
