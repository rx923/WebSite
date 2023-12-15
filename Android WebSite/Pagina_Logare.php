<?php
// Retrieve user input from the login form
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Establish a database connection
    $servername = "localhost"; // Replace with your server name
    $username = "your_username"; // Replace with your database username
    $password = "your_password"; // Replace with your database password
    $dbname = "your_database"; // Replace with your database name

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Get username and password from the form
    $input_username = $_POST['uname'];
    $input_password = $_POST['password'];

    // Sanitize input to prevent SQL injection (Note: Use prepared statements for better security)
    $safe_username = mysqli_real_escape_string($conn, $input_username);
    $safe_password = mysqli_real_escape_string($conn, $input_password);

    // Query to check if user credentials match
    $sql = "SELECT * FROM users WHERE username = '$safe_username'";
    $result = $conn->query($sql);

    // If there is a match
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($safe_password, $user['password'])) {
            // Successful login
            echo "Login successful!";
            // Redirect the user to another page or perform any necessary actions
            // For example: header("Location: dashboard.php");
        } else {
            // Invalid credentials
            return; // Exit the script without revealing specific error details
        }
    } else {
        // Invalid credentials
        return; // Exit the script without revealing specific error details
    }

    $conn->close(); // Close the database connection
}
?>
