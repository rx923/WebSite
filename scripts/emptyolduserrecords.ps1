# Define database connection parameters
$server = "192.168.100.53"
$database = "AccountCreation"
$username = "postgres"
$password = "MainAdministrator"

# Construct the connection string
$connectionString = "Server=$server;Port=5432;Database=$database;User Id=$username;Password=$password;"

# Define the SQL query to delete all records from the users table
$deleteQuery = "DELETE FROM users;"

# Attempt to connect to the database and execute the delete query
try {
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()

    $command = $connection.CreateCommand()
    $command.CommandText = $deleteQuery
    $rowsAffected = $command.ExecuteNonQuery()

    Write-Host "$rowsAffected user records deleted successfully."
}
catch {
    Write-Host "Error: $_"
}
finally {
    $connection.Close()
}
