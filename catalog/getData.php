<?php
$host = 'localhost';
$user = '****';
$pass = '****';
$database = '****';
$connect = new mysqli($host, $user, $pass, $database);
if (! $connect) {
	die('Couldnt connect: ' . mysql_error());
}

$code = 'SELECT courseName,
		applicationCode,
		code,
		codeLevels,
		codeSuffixes,
		placement,
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
		isHidden,
		locationName,
		categoryName,
		subcategoryName
	from CoursesView_20192020';

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
