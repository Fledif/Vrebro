import requests
import json
import traceback

API_URL = "https://vrebro.onrender.com/api"

def run():
    try:
        prods = requests.get(f"{API_URL}/catalog/products").json()
        if not prods:
            print("No products")
            return
        
        prod_id = prods[0]["id"]
        
        order_data = {
            "user_id": 123456789000, # Large ID
            "customer_name": "Test",
            "phone": "+380501234567",
            "address": "Kyiv",
            "comment": "Test",
            "items": [
                {"product_id": prod_id, "quantity": 1}
            ]
        }
        
        print("Sending POST request...")
        headers = {"Origin": "https://vrebro.vercel.app"}
        res = requests.post(f"{API_URL}/orders/", json=order_data, headers=headers)
        print("Status Code:", res.status_code)
        print("Response:", res.text)
        print("Headers:", res.headers)
    except Exception as e:
        print("Exception occurred:")
        traceback.print_exc()

run()
