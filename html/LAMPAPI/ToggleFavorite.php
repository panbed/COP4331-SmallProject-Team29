<?php

include "Config.php";

$inData = getRequestInfo();

$id = $inData["id"];
$favorite = $inData["favorite"];

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
  returnWithError($conn->connect_error);
} 
else {
  if ($favorite == true) {
    // already a favorite, unfavorite the contact
    $stmt = $conn->prepare("UPDATE Contacts SET Favorite=False WHERE ID=?");
  }
  else {
    // contact not favorite yet, mark the contact as a favorite
    $stmt = $conn->prepare("UPDATE Contacts SET Favorite=True WHERE ID=?");

  }

  $stmt->bind_param("s", $id);

  if (!$stmt->execute()) {
    returnWithError("Unable to toggle favorite for contact.");
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
