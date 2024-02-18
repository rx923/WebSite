<?php
// Output the CSS styles before the HTML form
    echo $css_styles;

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $username = $_POST['uname']; // Assuming username field name is 'uname'
        $password = $_POST['password']; // Assuming password field name is 'password'

        // Your MySQL database credentials
        $servername = "localhost";
        $db_username = "your_db_username";
        $db_password = "your_db_password";
        $db_name = "your_database_name";

        // Create connection to MySQL database
        $conn = new mysqli($servername, $db_username, $db_password, $db_name);

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
        // Hash the password (using a strong hashing algorithm like bcrypt)
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        // Perform validation by checking username and hashed password against the database
        $sql = "SELECT * FROM users WHERE username = '$username'";
        $result = $conn->query($sql);
        
        echo "Connected successfully";
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $stored_hashed_password = $row['password'];
            echo '<script>window.location.href = "path/to/your/page.php";</script>';
            exit(); // Terminate further execution to prevent showing the form again
        } else {
            // Username and password do not match or user not found
            // Display an error message or perform actions accordingly
            echo "Invalid username or password";
        }
        // Close database connection
        $conn->close();
        //  Verify the hashed password
        if (password_verify($password, $stored_hashed_password)) {
            // Password matches the stored hashed password
            // Start a PHP session and set session variables
            session_start();
            $_SESSION['username'] = $username;
            $_SESSION['logged_in'] = true;

            // Redirect to a page after successful login
            echo '<script>window.location.href = "path/to/your/page.php";</script>';
            exit(); // Terminate further execution to prevent showing the form again
        }

        if ($validation_passed) {
            // Store the CSS styles in a variable
            $css_styles = "
                form {
                    border: 1px solid #c58e8e;
                    border-radius: 20px;
                    background-color: rgba(252, 252, 252, 0.8);
                    box-sizing: border-box;
                    box-shadow: 2px 2px 20px rgba(0, 0, 0, 0.4);
                    display: inline-block;
                    width: auto;
                    padding-bottom: 0px;
                    margin-top: 18px;
                    text-align: center;
                }
                .container {
                    padding: 10px;
                }
                input[type='text'],
                input[type='password'] {
                    width: 160px;
                    padding: 2px;
                    margin: 0px 0px;
                    border: 1px solid #772727;
                    border-radius: 20px;
                }
                #submit-button-form {
                    background-color: #875050;
                    border-radius: 20px;
                    padding: 10px 20px;
                    margin: 10px 0;
                    border: none;
                    cursor: pointer;
                    width: auto;
                }
                .imgcontainer img {
                    width: 45%;
                    height: 50%;
                }
                label {
                    display: block;
                    text-align: left;
                    margin-top: 10px;
                }
            ";
        }
        // Save the CSS styles to a CSS file on the server
        $file_path = 'path/to/your/css_styles.css';
        file_put_contents($file_path, $css_styles);

        // Respond with success message or redirect
        http_response_code(200);
        echo "Registration successful!";
    }
?>

<form action="Pagina_Inregistrare.php" id="InregistrareForm" class="form-container" method="post">
      <div class="container_pagina_inregistrare">
      <h2>Inregistrare</h2>
        <p style="border: 1px solid; background-color: whitesmoke; border-radius: 20px;">Completeaza campurile de mai jos cu datele personale pentru a crea un cont!</p>
        <label for="email">
          <b style="position: relative;
                    background: linear-gradient(20deg, rgb(130 90 36) 51%, rgb(204 184 142)33%, #9b6930 66%);
                    border-radius: 15px;
                    padding: 5px;
                    border: 1px solid;">Email
          </b>
        </label>
        <input type="text" placeholder="Introdu adresa de Email" name="email" required>
        <label for="psw">
          <b style="position: relative;
          background: linear-gradient(20deg, rgb(130 90 36) 51%, rgb(204 184 142)33%, #9b6930 66%);
          border-radius: 15px;
          padding: 5px;
          border: 1px solid;">Parola
          </b>
        </label>
        <input type="password" placeholder="Introdu Parola:" name="psw" required>
        <label for="psw-repeat">
          <b style="position: relative;
          background: linear-gradient(20deg, rgb(130 90 36) 51%, rgb(204 184 142)33%, #9b6930 66%);
          border-radius: 15px;
          padding: 5px;
          border: 1px solid;">Repeta Parola
          </b>
        </label>
        <input type="password" placeholder="Repeta Parola:" name="psw-repeat" required>
        <label>
        <input type="checkbox" checked="checked" name="remember" style="background: linear-gradient(20deg, rgb(255, 255, 255) 21% rgba(113, 113, 113)61%, #b60000 95%);"> Tine minte datele de conectare
        </label>
        <p>Creandu-ti un cont, esti de acord cu 
          <a href="#link" style="background: linear-gradient(65deg, #e0c8ae 35%,rgb(77, 94, 100)70%, #563939) 80%; text-decoration: wavy;">Termenele & Conditiile
          </a>.</p>
        <div class="clearfix">
          <button type="button" class="cancelbtn" style="background-color: #8c4141;">Anuleaza
          </button>
          <button type="submit" class="signupbtn" style="background: linear-gradient(35deg, #ffefde 55%,rgb(58, 155, 188)70%, #00171f) 80%;">Inregistreaza-te
          </button>
        </div>
      </div>
    </form>