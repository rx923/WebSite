<?php
// Connect to your PostgreSQL database
$host = "192.168.100.53";
$port = "5432";
$dbname = "AccountCreation";
$user = "postgres";
$password = "MainAdministrator";

// Attempt connection
$conn = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");

// Check connection
if (!$conn) {
  die("Connection failed: " . pg_last_error());
} else {
  echo "Connected successfully<br>";
}

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $message = $_POST['msg'];

  // Sanitize input to prevent SQL injection
  $sanitized_message = pg_escape_string($conn, $message);

  // Insert message into database
  $query = "INSERT INTO chat_messages (message) VALUES ('$sanitized_message')";

  // Execute query
  $result = pg_query($conn, $query);

  // Check query execution
  if ($result) {
    echo "Message sent successfully";
  } else {
    echo "Error executing query: " . pg_last_error();
  }
}

// Close database connection
pg_close($conn);
?>
