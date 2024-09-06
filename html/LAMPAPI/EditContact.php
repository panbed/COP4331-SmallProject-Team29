<?php

include "Config.php";

$inData = getRequestInfo();

$id = $inData["id"];
$name = $inData["name"];
$phone = $inData["phone"];
$email = $inData["email"];
$picture = $inData["picture"];
$addr = $inData["address"];
$birthday = $inData["birthday"];
$notes = $inData["notes"];


$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
  returnWithError($conn->connect_error);
} else {
  $stmt = $conn->prepare("UPDATE Contacts SET Name=?, Phone=?, Email=?, Picture=?, Address=?, Birthday=?, Notes=? WHERE ID=?");
  $stmt->bind_param("sssssssd", $name, $phone, $email, $picture, $addr, $birthday, $notes, $id);
  if (!$stmt->execute()) {
    returnWithError("Unable to edit contact.");
  }
  $stmt->close();
}
$conn->close();

function getRequestInfo()
{
  return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj)
{
  header('Content-type: application/json');
  echo $obj;
}

function returnWithError($err)
{
  $retValue = '{"error":"' . $err . '"}';
  sendResultInfoAsJson($retValue);
}
