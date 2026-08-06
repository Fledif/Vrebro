import requests

def purge():
    print("Logging in...")
    res = requests.post("https://vrebro.onrender.com/api/admin/login", data={"username": "admin", "password": "password"})
    if res.status_code != 200:
        print("Login failed with 'password', trying 'admin'...")
        res = requests.post("https://vrebro.onrender.com/api/admin/login", data={"username": "admin", "password": "admin"})
        if res.status_code != 200:
            print("Login completely failed:", res.text)
            return

    token = res.json()["access_token"]
    print("Got token, purging...")
    headers = {"Authorization": f"Bearer {token}"}
    purge_res = requests.post("https://vrebro.onrender.com/api/admin/purge", headers=headers)
    print("Purge result:", purge_res.status_code, purge_res.text)

if __name__ == "__main__":
    purge()
