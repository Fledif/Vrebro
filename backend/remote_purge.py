import requests

API_URL = "https://vrebro.onrender.com/api"

# Login
response = requests.post(f"{API_URL}/admin/login", data={
    "username": "admin",
    "password": "admin"
})

if response.status_code == 200:
    token = response.json()["access_token"]
    print("Logged in successfully.")
    
    # Purge
    purge_response = requests.post(
        f"{API_URL}/admin/purge",
        headers={"Authorization": f"Bearer {token}"}
    )
    if purge_response.status_code == 200:
        print("Database purged successfully!")
        print(purge_response.json())
    else:
        print("Failed to purge:", purge_response.text)
else:
    print("Login failed:", response.text)
