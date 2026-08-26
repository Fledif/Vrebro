import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://vrebro.onrender.com/api"

def login():
    r = requests.post(f"{BASE_URL}/admin/login", data={
        "username": "admin",
        "password": "admin"
    })
    r.raise_for_status()
    return r.json()["access_token"]

def get_categories(token):
    r = requests.get(f"{BASE_URL}/admin/categories", headers={"Authorization": f"Bearer {token}"})
    r.raise_for_status()
    return r.json()

def add_category(token, name):
    r = requests.post(f"{BASE_URL}/admin/categories", headers={"Authorization": f"Bearer {token}"}, json={
        "name": name
    })
    r.raise_for_status()
    return r.json()

def add_product(token, name, price, category_id, is_weighted, desc):
    weight_step = 100 if is_weighted else None
    r = requests.post(f"{BASE_URL}/admin/products", headers={"Authorization": f"Bearer {token}"}, json={
        "name": name,
        "description": desc,
        "price": price,
        "category_id": category_id,
        "is_weighted": is_weighted,
        "weight_step": weight_step
    })
    r.raise_for_status()
    return r.json()

def main():
    print("Logging in...")
    try:
        token = login()
    except Exception as e:
        print("Login failed! The admin password on production might not be admin.")
        sys.exit(1)

    print("Fetching categories...")
    categories = get_categories(token)
    cat_map = {c['name']: c['id'] for c in categories}
    
    if "М'ясо" not in cat_map:
        print("Creating М'ясо...")
        res = add_category(token, "М'ясо")
        cat_map["М'ясо"] = res['id']
        
    if "Раки" not in cat_map:
        print("Creating Раки...")
        res = add_category(token, "Раки")
        cat_map["Раки"] = res['id']
        
    meat_id = cat_map["М'ясо"]
    raki_id = cat_map["Раки"]
    
    products = [
        ("Ошийок ''Смокер''", 880, meat_id, True, "Неймовірно ніжний та соковитий свинячий ошийок, томлений у смокері за фірмовим рецептом. Ідеально підходить для компанії!"),
        ("Курка", 480, meat_id, True, "Ароматна курочка зі скоринкою, приготована з натуральними спеціями на живому вогні."),
        ("Підчеревина", 680, meat_id, True, "М'ясиста підчеревина з ідеальним балансом м'яса та сала, запечена до хрусткої скоринки."),
        ("Перепел", 146, meat_id, False, "Делікатесний перепел, маринований у спеціальному соусі та запечений до рум'яності. (ціна за 1 шт)"),
        ("Шашлик смажений ХРЮ", 840, meat_id, False, "Класичний шашлик зі свинини, щедро приправлений спеціями та обсмажений на вугіллі."),
        ("Шашлик КУРКА", 560, meat_id, False, "Ніжний та дієтичний курячий шашлик, який просто тане у роті."),
        ("Раки солдатські", 1200, raki_id, True, "Свіжі раки невеликого розміру. Ідеальний варіант для дружніх посиденьок під келих пінного!"),
        ("Раки сержантські", 1700, raki_id, True, "Смачні раки середнього розміру з ніжним, солодкуватим м'ясом."),
        ("Раки лейтенантські", 2300, raki_id, True, "Добірні раки розміру вище середнього. Відмінна закуска для справжніх гурманів."),
        ("Раки майорські", 2500, raki_id, True, "Великі раки преміум якості. Багато смачного м'яса та насичений смак."),
        ("Раки генералські", 2800, raki_id, True, "Елітні, гігантські раки. Найбільший розмір, королівське задоволення!")
    ]
    
    for p in products:
        try:
            print(f"Adding {p[0]}...")
            add_product(token, p[0], p[1], p[2], p[3], p[4])
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 403:
                print("Error: Invalid Master Password!")
                sys.exit(1)
            else:
                print(f"Error adding {p[0]}: {e.response.text}")

if __name__ == "__main__":
    main()
