import requests
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
API_URL = "https://vrebro.onrender.com/api"
response = requests.get(f"{API_URL}/catalog/categories")
if response.status_code == 200:
    print(json.dumps(response.json(), ensure_ascii=False, indent=2))
