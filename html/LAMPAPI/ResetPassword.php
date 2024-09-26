<?php
// team29beast@gmail.com
// #@dPL?89q'8RU.H

// google app password tjky cpdl hztd xfer

include "Config.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once 'vendor/autoload.php';

$inData = getRequestInfo();

$email = $inData["email"];

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if($conn->connect_error) {
  returnWithError($conn->connect_error);
}
else {
  $stmt = $conn->prepare("SELECT FirstName,LastName,ID FROM Users WHERE Email=?");
  $stmt->bind_param("s", $email);
  $stmt->execute();
  $result = $stmt->get_result();
  $stmt->close();

  if($row = $result->fetch_assoc()) {
    $fname = $row['FirstName'];
    $lname = $row['LastName'];
    $newpass = random_str(8);
    $stmt = $conn->prepare("UPDATE Users SET Password=? WHERE Email=?");

    $mail = new PHPMailer(true);

    //Configure SMTP
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'team29beast@gmail.com';
    $mail->Password = 'tjkycpdlhztdxfer';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // $mail->addCC('email');
    // $mail->BCC('user@gmail.com');
    $mail->setFrom('team29beast@gmail.com', 'The Beast');
    $mail->addAddress($email, $fname . ' ' . $lname);

    $mail->isHTML(true); // Set email format to HTML
 
    $mail->Subject = 'Contact Manager - Password Reset';
    $mail->Body    = "<h1>Contact Manager - Team29</h1>
                  <p>Your password has been reset to the following temporary password:</p>
                  <p>" . $newpass . "</p>
                  <p>Please change your password once you've logged in.</p>";

    // Attempt to send the email
    if (!$mail->send()) {
        echo 'Email not sent. An error was encountered: ' . $mail->ErrorInfo;
    } else {
        echo 'Message has been sent.';
    }

    $mail->smtpClose();


  } 
  else {
    returnWithError("Account not Found");
  }
}
$conn->close();


function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
function returnWithError( $err )
	{
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
}


function random_str(
    $length,
    $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
) {
    $str = '';
    $max = mb_strlen($keyspace, '8bit') - 1;
    if ($max < 1) {
        throw new Exception('$keyspace must be at least two characters long');
    }
    for ($i = 0; $i < $length; ++$i) {
        $str .= $keyspace[random_int(0, $max)];
    }
    return $str;
}

?>
