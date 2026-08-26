import requests
import sys

sys.stdout.reconfigure(encoding='utf-8')
BASE_URL = "https://vrebro.onrender.com/api"

def login():
    r = requests.post(f"{BASE_URL}/admin/login", data={"username": "admin", "password": "admin"})
    r.raise_for_status()
    return r.json()["access_token"]

def main():
    try:
        token = login()
    except Exception as e:
        print("Login failed!", e)
        sys.exit(1)
        
    categories = requests.get(f"{BASE_URL}/admin/categories", headers={"Authorization": f"Bearer {token}"}).json()
    meat_id = next((c['id'] for c in categories if c['name'] == "М'ясо"), None)
    
    if not meat_id:
        print("Category М'ясо not found!")
        sys.exit(1)
        
    ribs = {
        "name": "Фірмове ребро",
        "description": "Наше легендарне фірмове ребро, яке тане в роті. Томиться в смокері 12 годин зі спеціальними спеціями.",
        "price": 890,
        "category_id": meat_id,
        "is_weighted": True,
        "weight_step": 100,
        "image_url": "https://i.ibb.co/6P26L5v/placeholder.png"
    }
    
    print("Restoring Фірмове ребро...")
    r = requests.post(f"{BASE_URL}/admin/products", headers={"Authorization": f"Bearer {token}"}, json=ribs)
    if r.status_code == 201:
        print("Successfully restored!")
    else:
        print("Error:", r.text)

if __name__ == "__main__":
    main()
