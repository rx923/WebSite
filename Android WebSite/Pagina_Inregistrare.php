<!-- Pagina_Inregistrare.php -->
<?php
// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // Process form data
  // Retrieve data from $_POST array
  $email = $_POST['email'];
  $password = $_POST['psw'];
  
  // Perform necessary backend operations (e.g., database operations, authentication, etc.)
  // Replace the below example with your actual backend logic
  
  // Display submitted data (for demonstration)
  echo "Email: " . $email . "<br>";
  echo "Password: " . $password . "<br>";
} else {
  // Handle if form is not submitted
  echo "Form not submitted.";
}
?>