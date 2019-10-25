<?php
$host = 'localhost';
$user = '****';
$pass = '****';
$database = '****';
$connect = new mysqli($host, $user, $pass, $database);
if (! $connect) {
	die('Couldnt connect: ' . mysql_error());
}

$code = 'SELECT code,
      		description,
		semester,
		creditsLow,
		creditsHigh,
		gradesLow,
		gradesHigh,
		isApplication,
		isIB,
		isDualCredit,
		isAP,
		isPreAP,
		isOnLevel,
		locationName,
		applicationCode,
		availabilityBitmap
	from CourseSectionsView'
	;

$dataArray = array();
if ($return = $connect->query($code)) {
	while ($row = $return->fetch_row()) {
		array_push($dataArray, $row);
	}
 }
if (! $return) {
	die('Failed to get data: ' . mysql_error());
}
mysqli_close($connect);
echo json_encode($dataArray);
?>
