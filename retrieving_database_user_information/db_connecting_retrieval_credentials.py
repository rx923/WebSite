import psycopg2
import requests
import time

def fetch_user_data_and_send():
    try:
        # Send a request to the server to indicate the start of data fetching
        server_endpoint_start = "http://192.168.100.53:8081"
        response_start = requests.post(server_endpoint_start)
        if response_start.status_code == 200:
            print("Server notified about the start of data fetching.")
        else:
            print("Failed to notify server about the start of data fetching:", response_start.text)
            return

        # Connect to the PostgresQL database
        connection = psycopg2.connect(
            user="postgres",
            password="MainAdministrator",
            host="192.168.100.53",
            port="5432",
            database="AccountCreation"
        )

        # Creating a cursor object to execute SQL queries
        cursor = connection.cursor()

        # Fetching data from the AccountCreation table
        cursor.execute("SELECT username, password FROM AccountCreation")
        user_data = cursor.fetchall()

        # Close the cursor and connection
        cursor.close()
        connection.close()

        # Printing fetched data
        for row in user_data:
            username = row[1]
            password = row[2]
            print("Username:", username)
            print("Password:", password)
            print()

        # Send the fetched data to the server
        server_endpoint = "http://192.168.100.53:8081/user-data"
        response = requests.post(server_endpoint, json=user_data)
        if response.status_code == 200:
            print("Data sent successfully to the server.")
        else:
            print("Failed to send data to the server:", response.text)

    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL:", error)

    finally:
        # Close the cursor and connection
        if connection:
            connection.close()
            print("PostgreSQL connection is closed")

while True:
    fetch_user_data_and_send()
    time.sleep(60)