import requests
import sys
import urllib.parse
import time

sys.stdout.reconfigure(encoding='utf-8')
BASE_URL = "https://vrebro.onrender.com/api"

def login():
    r = requests.post(f"{BASE_URL}/admin/login", data={"username": "admin", "password": "admin"})
    r.raise_for_status()
    return r.json()["access_token"]

def upload_image(token, image_bytes):
    r = requests.post(
        f"{BASE_URL}/admin/upload-image",
        headers={"Authorization": f"Bearer {token}"},
        files={"image": ("image.jpg", image_bytes, "image/jpeg")}
    )
    r.raise_for_status()
    return r.json()["url"]

def update_product_image(token, product_id, product_data, image_url):
    product_data["image_url"] = image_url
    r = requests.put(
        f"{BASE_URL}/admin/products/{product_id}",
        headers={"Authorization": f"Bearer {token}"},
        json=product_data
    )
    r.raise_for_status()

def generate_image(prompt):
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=800&height=600&nologo=true"
    r = requests.get(url)
    r.raise_for_status()
    return r.content

def main():
    print("Logging in...")
    try:
        token = login()
    except Exception as e:
        print("Login failed!", e)
        sys.exit(1)
        
    print("Fetching products...")
    r = requests.get(f"{BASE_URL}/admin/products", headers={"Authorization": f"Bearer {token}"})
    r.raise_for_status()
    products = r.json()
    
    prompts = {
        "Фірмове ребро": "delicious smoked BBQ pork ribs on wooden board dark cinematic food photography",
        "Ошийок ''Смокер''": "juicy smoked pork neck meat sliced on rustic wooden board professional food photography",
        "Курка": "whole smoked grilled chicken crispy skin on a plate with herbs professional food photography",
        "Підчеревина": "crispy roasted pork belly meat with herbs dark background food photography",
        "Перепел": "roasted quail meat dish on plate elegant food photography",
        "Шашлик смажений ХРЮ": "pork shashlik meat skewers grilled over charcoal food photography",
        "Шашлик КУРКА": "chicken shashlik meat skewers grilled over charcoal food photography",
        "Раки солдатські": "small boiled red crayfish on a wooden plate with dill beer snack food photography",
        "Раки сержантські": "boiled red crayfish on a platter with herbs food photography",
        "Раки лейтенантські": "large boiled red crayfish crawfish on a rustic table food photography",
        "Раки майорські": "extra large premium boiled red crayfish crawfish with lemon dill food photography",
        "Раки генералські": "giant premium boiled red crawfish lobster size luxurious food photography"
    }
    
    for p in products:
        name = p["name"]
        if name in prompts:
            print(f"Generating image for: {name}...")
            try:
                img_bytes = generate_image(prompts[name])
                print(f"Uploading image for: {name}...")
                img_url = upload_image(token, img_bytes)
                print(f"Updating product {name} with url {img_url}...")
                update_product_image(token, p["id"], p, img_url)
                print(f"Success: {name}")
                time.sleep(1)
            except Exception as e:
                print(f"Failed for {name}: {e}")
        else:
            print(f"Skipping {name}, no prompt defined.")

if __name__ == "__main__":
    main()
