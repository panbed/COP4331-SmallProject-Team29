<?php

include "Config.php";

$inData = getRequestInfo();

$id = $inData["id"];
$curPass = md5($inData["currentPassword"]);
$newPass = md5($inData["newPassword"]);

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if($conn->connect_error) {
  returnWithError($conn->connect_error);
}
else {
  $stmt = $conn->prepare("SELECT Login FROM Users WHERE ID=? AND Password=?");
  $stmt->bind_param("ds", $id, $curPass);
  $stmt->execute();
  $result = $stmt->get_result();

  if($row = $result->fetch_assoc()) {
    $stmt = $conn->prepare("UPDATE Users SET Password=? WHERE ID=?");
    $stmt->bind_param("sd", $newPass, $id);
    $stmt->execute();
    returnWithError("");
  }
  else {
    returnWithError("Invalid Password, please try again");
  }
  /*
  $stmt = $conn->prepare("UPDATE Users SET Password=? WHERE ID=? AND Password=?");
  $stmt->bind_param("sds", $newPass, $id, $curPass);
  if(!$stmt->execute()) {
    returnWithError("Incorrect password, please try again");
  }
  $stmt->close();
   */
}
$conn->close();

function getRequestInfo() {
  return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj) {
  header('Content-type: application/json');
  echo $obj;
}

function returnWithError($err) {
  $retValue = '{"error" : "' . $err . '" }';
  sendResultInfoAsJson($retValue);
}

?>
