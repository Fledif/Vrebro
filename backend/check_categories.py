import requests

API_URL = "https://vrebro.onrender.com/api"

response = requests.get(f"{API_URL}/catalog/categories")
if response.status_code == 200:
    print("LIVE DB CATEGORIES:")
    print(response.json())
else:
    print("ERROR:", response.text)
