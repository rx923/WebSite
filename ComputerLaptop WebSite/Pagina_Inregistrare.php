<?php
$css_styles = "
<style>
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
</style>
";
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

<form action="Pagina_Logare.php" id="Logheaza-teForm" method="post" class="form-container" style=" width:auto; background: linear-gradient(65deg, #e0c8ae 35%,rgb(155, 202, 218)70%, #003d51) 80%;" >
      <div class="imgcontainer">
        <img src="https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png" type="img" media="all" alt="Avatar" class="img" style="height: 31px; width: 31px;" loading="lazy">
      </div>
      <div class="container-pagina-logare" id="form-container-1" style="width: auto; background-color: (55deg, #c4833e 35%,rgb(89, 161, 184)20%, #084f66) 80%;">
        <label for="uname">
          <b style="background:#537d8b; border-style: outset; border-radius: 0px; margin-bottom: 10px; border: 3px; text-align: center; text-wrap: wrap; position: sticky;">Nume Utilizator:</b>
        </label>
        <input type="text" placeholder="Username/ User" id="uname" name="uname" required>
          <label for="password">
            <b style="background:#537d8b; border-style: outset; border-radius: 20px; border: 2px;">Parola:</b>
          </label>
        <input type="password" id="password" accept="file" placeholder="Scrie Parola" name="password" required>
          <button type="submit" id="submit-button-form">Logheaza-te</button>
          <label>
            <input type="checkbox" accept="file" checked="checked" name="remember"> Memoreaza informatiile de conectare.
        </label>
      </div>

      <div class="container" style="background-color:#444741">
        <button type="button" class="cancelbtn">Anuleaza</button>
          <span class="psw">Ai uitat <a href="#Link">parola?</a></span>
      </div>
    </form>