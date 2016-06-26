<?php
$res = json_decode(stripslashes(@$_POST['jsondata']), true);


$count_images = count($res['images']);

$background = "images/bg2_ready.jpg";




/* the other images */
$new = Array();
foreach($res['images'] as $imageId=>$imageData){
	$new[$imageData['zindex']] = $imageId;
}
ksort($new);

foreach($new as $ID=>$i){
	$insert 		= $res['images'][$i]['src'];
	$insert = str_replace("thumb/T_", "edit/", $insert);
	$photoFrame2Rotation = (180-$res['images'][$i]['rotation']) + 180;
	
	$photo2 		= imagecreatefromjpeg($insert);
	
	$foto2W 		= imagesx($photo2);
	$foto2H 		= imagesy($photo2);
	$photoFrame2W	= 400;
	$photoFrame2H 	= 400;

	$photoFrame2TOP = $res['images'][$i]['top'];
	$photoFrame2LEFT= $res['images'][$i]['left'];

	$photoFrame2 	= imagecreatetruecolor($photoFrame2W,$photoFrame2H);
	$trans_colour 	= imagecolorallocatealpha($photoFrame2, 0, 0, 0, 127);
	imagefill($photoFrame2, 0, 0, $trans_colour);

	imagecopyresampled($photoFrame2, $photo2, 0, 0, 0, 0, $photoFrame2W, $photoFrame2H, $foto2W, $foto2H);
	
	$photoFrame2 	= imagerotate($photoFrame2,$photoFrame2Rotation, -1,0);
	/*after rotating calculate the difference of new height/width with the one before*/
	$extraTop		=(imagesy($photoFrame2)-$photoFrame2H)/2;
	$extraLeft		=(imagesx($photoFrame2)-$photoFrame2W)/2;

	imagecopy($photoFrame, $photoFrame2,$photoFrame2LEFT-$extraLeft, $photoFrame2TOP-$extraTop, 0, 0, imagesx($photoFrame2), imagesy($photoFrame2));	
}



imagecopyresampled($photoFrameUse, $photoFrame, 0, 0, 0, 0, 880, $_POST['heightBackground'], 880, $_POST['heightBackground']);


// Set the content type header - in this case image/jpeg
imagejpeg($photoFrameUse, "tmp/testimage.jpeg"); 
imagedestroy($photoFrameUse);

header('Content-Description: File Transfer');
header('Content-type: image/jpeg');
header('Content-Disposition: attachment; filename=image.jpeg');
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Pragma: public');
header('Content-Length: ' . filesize("tmp/testimage.jpeg"));
//ob_clean();
flush();
readfile("tmp/testimage.jpeg");
?>