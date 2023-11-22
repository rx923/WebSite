<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $psw = $_POST['psw'];
    $servername = "localhost";
    $pswRepeat = $_POST['psw-repeat'];
    $conn = new mysqli($servername, $username, $password);


    // Perform server-side validation
    if (empty($email) || empty($psw) || empty($pswRepeat)) {
        http_response_code(400);
        echo "Please fill in all fields";
        exit;
    }

    if ($psw !== $pswRepeat) {
        http_response_code(400);
        echo "Passwords do not match";
        exit;
    }

    // Additional validation logic (e.g., email format validation) can be added here

    // If validation passes, proceed with further actions (e.g., saving to database)
    // ...
    // Check connection
    if ($conn->connect_error) {
        exit("Connection failed: " . $conn->connect_error);
    }
    echo "Connected successfully";

    // Respond with success message or redirect
    http_response_code(200);
    echo "Registration successful!";
}
?>