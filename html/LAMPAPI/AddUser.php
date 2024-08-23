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
    $stmt = $conn->prepare("SELECT (firstName,lastName) FROM Users WHERE login=?");
    $stmt->bind_param("s", $inData["login"]);
    $stmt->execute();
    $result = $stmt->get_result();

    if($row = $result->fetch_assoc()) {
        returnWithError("User already exists, please try another Username.");
    }
    else {
        $add = $conn->prepare("INSERT into Users (firstName,lastName,login,password) VALUES (?,?,?,?)");
        $add->bind_param("ssss", $firstName, $lastName, $login, $password);
        $add->execute();
        $add->close();
    }

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
