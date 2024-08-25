<?php

include "Config.php";

$inData = getRequestInfo();

$userId = $inData["UserId"];
if (isset($inData["Limit"])) {
    $limit = $inData["Limit"];
} else {
    // When limit is not specified, set limit to -1 (inf)
    $limit = -1;
}


$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    if ($limit >= 0) {
        $stmt = $conn->prepare("select Name,Phone,Email from Contacts where UserID=? limit ?");
        $stmt->bind_param("ss", $userId, $limit);
    } else {
        $stmt = $conn->prepare("select Name,Phone,Email from Contacts where UserID=?");
        $stmt->bind_param("s", $userId);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $postJSON = array();
    $resultCount = 0;
    while ($row = $result->fetch_assoc()) {
        $jsonResult = array();
        $jsonResult["name"] = $row["Name"];
        $jsonResult["phone"] = $row["Phone"];
        $jsonResult["email"] = $row["Email"];

        $resultCount++;
        array_push($postJSON, $jsonResult);
    }

    if ($resultCount == 0) {
        returnWithError("No Records Found");
    } else {
        returnWithInfo(json_encode($postJSON));
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
    $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithInfo($searchResults)
{
    $retValue = '{"results":' . $searchResults . ',"error":""}';
    sendResultInfoAsJson($retValue);
}
