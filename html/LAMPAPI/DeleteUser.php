<?php

include "Config.php";

$inData = getRequestInfo();

$userID = $inData["userID"];

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    $stmt = $conn->prepare("DELETE FROM Contacts WHERE UserID=?");
    $stmt->bind_param("d", $userID);
    if(!$stmt->execute()) {
        returnWithError("Error emptying contacts");
    }

    $stmt = $conn->prepare("DELETE FROM Users WHERE ID=?");
    $stmt->bind_param("d", $userID);
    if (!$stmt->execute()) {
        returnWithError("Unable to delete user.");
    }

    $stmt->close();
}
$conn->close();

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function returnWithError($err)
{
    $retValue = '{"error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}
