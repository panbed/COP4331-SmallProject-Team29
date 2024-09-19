<?php

include "Config.php";

$inData = getRequestInfo();

$userId = $inData["userId"];
if (isset($inData["limit"])) {
    $limit = $inData["limit"];
} else {
    // When limit is not specified, set limit to -1 (inf)
    $limit = -1;
}
if (isset($inData["offset"])) {
    $offset = $inData["offset"];
} else {
    // note that offset can only be used when limit is also specified
    $offset = 0;
}


$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    if ($limit >= 0) {
        $stmt = $conn->prepare("select ID,Name,Phone,Email,Picture,Address,Birthday,Notes,Favorite from Contacts where UserID=? limit ? offset ? ORDER BY Favorite DESC");
        $stmt->bind_param("sss", $userId, $limit, $offset);
    } else {
        $stmt = $conn->prepare("select ID,Name,Phone,Email,Picture,Address,Birthday,Notes,Favorite from Contacts where UserID=? ORDER BY Favorite DESC");
        $stmt->bind_param("s", $userId);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $postJSON = array();
    $resultCount = 0;
    while ($row = $result->fetch_assoc()) {
        $jsonResult = array();
        $jsonResult["id"] = $row["ID"];
        $jsonResult["name"] = $row["Name"];
        $jsonResult["phone"] = $row["Phone"];
        $jsonResult["email"] = $row["Email"];
        $jsonResult["picture"] = $row["Picture"];
        $jsonResult["address"] = $row["Address"];
        $jsonResult["birthday"] = $row["Birthday"];
        $jsonResult["notes"] = $row["Notes"];
        $jsonResult["favorite"] = $row["Favorite"];

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
