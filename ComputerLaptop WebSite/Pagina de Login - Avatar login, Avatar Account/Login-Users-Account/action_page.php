<?php
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $username = $_POST["username"];
        $password = $_POST["password"];

    // Replace these with your actual username and password validation logic
        $validUsername = "example";
        $validPassword = "password";
    }

    if ($username == $validUsername && $password == $validPassword) {
    // Redirect to the main index page
        header("Location: index.php");
        exit;

    } else {
    echo "Invalid username or password";
    }
    ?>

<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>