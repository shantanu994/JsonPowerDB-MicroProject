// JPDB connection details
var jpdbBaseURL = "http://api.login2explore.com:5577";
var jpdbIRL = "/api/irl";  // for read operations
var jpdbIML = "/api/iml";  // for write operations
var dbName = "SCHOOL-DB";
var relName = "STUDENT-TABLE";

// i stored my connection token here
var connToken = "YOUR-CONNECTION-TOKEN-HERE";

// when page loads, setup the form
$(document).ready(function() {
    resetForm();
    
    // check roll no when user leaves the field
    $("#rollNo").on("blur", function() {
        checkRollNo();
    });
});

// check if roll no exists in database
function checkRollNo() {
    var rollNo = $("#rollNo").val();
    
    if (rollNo === "") {
        alert("Please enter Roll No first!");
        $("#rollNo").focus();
        return;
    }
    
    // create GET request to check if record exists
    var getReq = createGET_BY_KEYRequest(
        connToken, 
        dbName, 
        relName, 
        JSON.stringify({"Roll-No": rollNo})
    );
    
    jQuery.ajaxSetup({async: false});
    var result = executeCommandAtGivenBaseUrl(getReq, jpdbBaseURL, jpdbIRL);
    jQuery.ajaxSetup({async: true});
    
    if (result.status === 400) {
        // record not found - new student, allow save
        enableFormForSave();
    } else if (result.status === 200) {
        // record found - show data, allow update
        var data = JSON.parse(result.data).record;
        fillFormData(data);
        localStorage.setItem("recno", JSON.parse(result.data).rec_no);
        enableFormForUpdate();
    }
}

// fill form with existing data from database
function fillFormData(data) {
    $("#fullName").val(data["Full-Name"]);
    $("#class").val(data["Class"]);
    $("#birthDate").val(data["Birth-Date"]);
    $("#address").val(data["Address"]);
    $("#enrollDate").val(data["Enrollment-Date"]);
}

// validate that no fields are empty
function validateForm() {
    if ($("#rollNo").val() === "") {
        alert("Roll No is required!");
        $("#rollNo").focus();
        return false;
    }
    if ($("#fullName").val() === "") {
        alert("Full Name is required!");
        $("#fullName").focus();
        return false;
    }
    if ($("#class").val() === "") {
        alert("Class is required!");
        $("#class").focus();
        return false;
    }
    if ($("#birthDate").val() === "") {
        alert("Birth Date is required!");
        $("#birthDate").focus();
        return false;
    }
    if ($("#address").val() === "") {
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

// get all form data as json
function getFormData() {
    return JSON.stringify({
        "Roll-No": $("#rollNo").val(),
        "Full-Name": $("#fullName").val(),
        "Class": $("#class").val(),
        "Birth-Date": $("#birthDate").val(),
        "Address": $("#address").val(),
        "Enrollment-Date": $("#enrollDate").val()
    });
}

// save new student record
function saveData() {
    if (!validateForm()) return;
    
    var jsonStr = getFormData();
    var putReq = createPUTRequest(connToken, jsonStr, dbName, relName);
    
    jQuery.ajaxSetup({async: false});
    var result = executeCommandAtGivenBaseUrl(putReq, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({async: true});
    
    if (result.status === 200 || result.status === 304) {
        alert("Student data saved successfully!");
        resetForm();
    } else {
        alert("Something went wrong. Please try again.");
    }
}

// update existing student record
function updateData() {
    if (!validateForm()) return;
    
    // dont include roll no in update since its primary key
    var jsonStr = JSON.stringify({
        "Full-Name": $("#fullName").val(),
        "Class": $("#class").val(),
        "Birth-Date": $("#birthDate").val(),
        "Address": $("#address").val(),
        "Enrollment-Date": $("#enrollDate").val()
    });
    
    var updateReq = createUPDATERecordRequest(
        connToken, 
        jsonStr, 
        dbName, 
        relName, 
        localStorage.getItem("recno")
    );
    
    jQuery.ajaxSetup({async: false});
    var result = executeCommandAtGivenBaseUrl(updateReq, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({async: true});
    
    if (result.status === 200) {
        alert("Student data updated successfully!");
        resetForm();
    } else {
        alert("Something went wrong. Please try again.");
    }
}

// reset form to initial state
function resetForm() {
    // clear all fields
    $("#rollNo").val("");
    $("#fullName").val("");
    $("#class").val("");
    $("#birthDate").val("");
    $("#address").val("");
    $("#enrollDate").val("");
    
    // disable all fields except roll no
    $("#rollNo").prop("disabled", false);
    $("#fullName").prop("disabled", true);
    $("#class").prop("disabled", true);
    $("#birthDate").prop("disabled", true);
    $("#address").prop("disabled", true);
    $("#enrollDate").prop("disabled", true);
    
    // disable all buttons
    $("#saveBtn").prop("disabled", true);
    $("#updateBtn").prop("disabled", true);
    $("#resetBtn").prop("disabled", true);
    
    // focus on roll no
    $("#rollNo").focus();
}

// enable form fields and save button for new record
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

// enable form fields and update button for existing record
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