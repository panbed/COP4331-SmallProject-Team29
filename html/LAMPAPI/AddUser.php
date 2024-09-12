<?php

include "Config.php";

$inData = getRequestInfo();

$firstName = $inData["firstName"];
$lastName = $inData["lastName"];
$login = $inData["login"];
$password = $inData["password"];

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
  returnWithError($conn->connect_error);
} else {
    $stmt = $conn->prepare("SELECT firstName,lastName FROM Users WHERE login=?");
    $stmt->bind_param("s", $inData["login"]);
    $stmt->execute();
    $result = $stmt->get_result();

    if($row = $result->fetch_assoc()) {
        returnWithError("User Already Exists");
    }
    else {
        $stmt = $conn->prepare("INSERT into Users (firstName,lastName,Login,Password) VALUES (?,?,?,?)");
        $stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
        $stmt->execute();
        returnWithError("");
    }

    $stmt->close();
    $conn->close();
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
