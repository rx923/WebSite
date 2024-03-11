import psycopg2
import bcrypt
import os
import json
from datetime import datetime
import time

# Connect to the PostgreSQL database
conn = psycopg2.connect(
    dbname='AccountCreation',
    user='postgres',
    password='MainAdministrator',
    host='localhost',
    port='5432'
)

# Function to hash existing passwords
def hash_existing_passwords(password_pattern):
    try:
        # Create a cursor
        cur = conn.cursor()

        # Retrieve users with passwords matching the specified pattern
        cur.execute("""
            SELECT * FROM users 
            WHERE 
                password IS NOT NULL AND 
                password != '' AND 
                LENGTH(password) = LENGTH(REPLACE(password, ' ', '')) AND
                password ~ %s
        """, (password_pattern,))

        # Fetch all rows
        users_with_matching_passwords = cur.fetchall()

        print(f"Found {len(users_with_matching_passwords)} users with passwords matching the specified pattern.")

        # Write original users to a text file
        original_users_file_path = os.path.join('U:\\Plan_Afacere\\WebSite', 'original_users.txt')
        with open(original_users_file_path, 'w') as f:
            for idx, user in enumerate(users_with_matching_passwords, start=1):
                user_data = {
                    'id': idx,  # Start id at 1 for each user
                    'username': user[1],
                    'email': user[2],
                    'password': user[3],
                    'created_at': user[4].strftime('%Y-%m-%d %H:%M:%S'),  # Format datetime object as string
                    'updated_at': user[5].strftime('%Y-%m-%d %H:%M:%S') if user[5] else None  # Format datetime object as string or None
                }
                f.write(json.dumps(user_data, indent=2) + '\n')
                time.sleep(1)  # Delay for 1 second before processing the next user

        print(f"Original users written to file: {original_users_file_path}")

        # Hash passwords for each user
        updated_users = []
        for user in users_with_matching_passwords:
            time.sleep(1)  # Delay for 1 second before hashing the password
            hashed_password = bcrypt.hashpw(user[3].encode(), bcrypt.gensalt())  # Hash password with bcrypt
            # Update user's password in the database with the hashed password
            cur.execute("UPDATE users SET password = %s, updated_at = NOW() WHERE id = %s", (hashed_password.decode(), user[0]))
            updated_users.append({'id': user[0], 'username': user[1]})
            print(f"Password hashed for user: {user[1]}")

        print('Passwords hashed successfully for existing users.')

        # Write updated users to a text file
        updated_users_file_path = os.path.join('U:\\Plan_Afacere\\WebSite', 'updated_users.txt')
        with open(updated_users_file_path, 'w') as f:
            f.write('\n'.join([f"{user['id']}, {user['username']}" for user in updated_users]))
        print(f"Updated users written to file: {updated_users_file_path}")

        # Commit changes
        conn.commit()
    except Exception as e:
        print('Error hashing existing passwords:', e)
        conn.rollback()
    finally:
        # Close cursor and connection
        cur.close()
        conn.close()

# Call the function to hash existing passwords with different patterns
# For example, for passwords containing only numbers and strings
hash_existing_passwords('^[a-zA-Z0-9]{6,20}$')

# For passwords containing only numbers
# hash_existing_passwords('^[0-9]{6,20}$')

# For passwords containing only strings
# hash_existing_passwords('^[a-zA-Z]{6,20}$')

# For passwords containing only special characters
# hash_existing_passwords('^[!@#$%^&*]{6,20}$')
