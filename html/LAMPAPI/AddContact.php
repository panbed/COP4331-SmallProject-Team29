<?php

include "Config.php";

$inData = getRequestInfo();

$name = $inData["name"];
$phone = $inData["phone"];
$email = $inData["email"];
$address = $inData["address"];
$birthday = $inData["birthday"];
$userId = $inData["userId"];
$fav = $inData["favorite"];
$pic = $inData["picture"];
$notes = $inData["notes"];

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
  returnWithError($conn->connect_error);
} else {
  $stmt = $conn->prepare("INSERT into Contacts (Name,Phone,Email,Address,Birthday,UserID,Favorite,Picture,Notes) VALUES (?,?,?,?,?,?,?,?,?)");
  $stmt->bind_param("ssssssiss", $name, $phone, $email, $address, $birthday, $userId, $fav, $pic, $notes);
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
