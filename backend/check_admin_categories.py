import requests
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
API_URL = "https://vrebro.onrender.com/api"

# Login
response = requests.post(f"{API_URL}/admin/login", data={
    "username": "admin",
    "password": "admin"
})

if response.status_code == 200:
    token = response.json()["access_token"]
    # Get categories
    cat_response = requests.get(
        f"{API_URL}/admin/categories",
        headers={"Authorization": f"Bearer {token}"}
    )
    print("ADMIN CATEGORIES:")
    print(json.dumps(cat_response.json(), ensure_ascii=False, indent=2))
else:
    print("Login failed:", response.text)
