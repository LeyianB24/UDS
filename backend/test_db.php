<?php
$conn = new mysqli('localhost', 'root', '', 'umoja-drivers-sacco');
$out = [];
$res = $conn->query("SELECT member_id, email, password FROM members WHERE email='1704781@students.kcau.ac.ke'");
$out['member_exact'] = $res->fetch_all(MYSQLI_ASSOC);

$res2 = $conn->query("SELECT admin_id, email, password FROM admins WHERE email='1704781@students.kcau.ac.ke'");
$out['admin_exact'] = $res2->fetch_all(MYSQLI_ASSOC);

$res3 = $conn->query("SELECT member_id, email, password FROM members LIMIT 2");
$out['members_sample'] = $res3->fetch_all(MYSQLI_ASSOC);

$res4 = $conn->query("SELECT admin_id, email, password FROM admins LIMIT 2");
$out['admins_sample'] = $res4->fetch_all(MYSQLI_ASSOC);

file_put_contents('backend/test_output.json', json_encode($out, JSON_PRETTY_PRINT));
