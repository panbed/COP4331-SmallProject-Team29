<?php

include "Config.php";

$inData = getRequestInfo();

$name = $inData["name"];
$phone = $inData["phone"];
$email = $inData["email"];
$address = $inData["address"];
$birthday = $inData["birthday"];
$userId = $inData["userId"];

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
  returnWithError($conn->connect_error);
} else {
  $stmt = $conn->prepare("INSERT into Contacts (Name,Phone,Email,Address,Birthday,UserID) VALUES (?,?,?,?,?,?)");
  $stmt->bind_param("ssssss", $name, $phone, $email, $address, $birthday, $userId);
  $stmt->execute();
  $stmt->close();
  $conn->close();
  returnWithError("");
}

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
