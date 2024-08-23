<?php

	include "Config.php";

	$inData = getRequestInfo();
	
	$searchResults = "";
	$searchCount = 0;

	$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
	if ($conn->connect_error) {
		returnWithError( $conn->connect_error );
	} 
	else {
		$stmt = $conn->prepare(
			"select Name,Phone,Email from Contacts where Name like ? or Phone like ? or Email like ? and UserID=?"
		);
		$searchQuery = "%" . $inData["search"] . "%";
		$stmt->bind_param("ssss", $searchQuery, $searchQuery, $searchQuery, $inData["userId"]);
		$stmt->execute();
		
		$result = $stmt->get_result();
		
		$postJSON = array();
		while($row = $result->fetch_assoc()) {
			$jsonResult = array();
			$jsonResult["name"] = $row["Name"];
			$jsonResult["phone"] = $row["Phone"];
			$jsonResult["email"] = $row["Email"];


			// if($searchCount > 0) {
			// 	$searchResults .= ",";
			// }
			$searchCount++;
			// $searchResults .= '"' . $row["Name"] . '"';
			array_push($postJSON, $jsonResult);
		}
		
		if($searchCount == 0) {
			returnWithError("No Records Found");
		}
		else {
			returnWithInfo(json_encode($postJSON));
		}
		
		$stmt->close();
		$conn->close();
	}

	function getRequestInfo() {
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj ) {
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err ) {
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $searchResults ) {
		$retValue = '{"results":' . $searchResults . ',"error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>