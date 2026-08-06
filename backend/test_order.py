import requests
import json

API_URL = "https://vrebro.onrender.com/api"

order_data = {
    "user_id": 123456789,
    "customer_name": "Test Name",
    "phone": "+380501234567",
    "address": "Kyiv",
    "comment": "Test comment",
    "items": [
        {"product_id": 1, "quantity": 1} # Need a valid product ID here, wait, I can fetch a product first
    ]
}

# Fetch products first
prods = requests.get(f"{API_URL}/catalog/products").json()
if not prods:
    print("No products available to test order.")
else:
    order_data["items"][0]["product_id"] = prods[0]["id"]
    print("Testing with product:", prods[0]["name"])
    
    response = requests.post(f"{API_URL}/orders/", json=order_data)
    print("STATUS:", response.status_code)
    print("BODY:", response.text)
