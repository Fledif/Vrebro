import requests
import re

html = requests.get('https://vrebro.vercel.app/').text
scripts = re.findall(r'src="(/assets/[^"]+\.js)"', html)
for script in scripts:
    url = f"https://vrebro.vercel.app{script}"
    print(f"Checking {url}")
    js_code = requests.get(url).text
    if 'vrebro-api.onrender.com' in js_code:
        print("FOUND BROKEN URL: vrebro-api.onrender.com")
    if 'vrebro.onrender.com' in js_code:
        print("FOUND GOOD URL: vrebro.onrender.com")
    if 'localhost' in js_code:
        print("FOUND LOCALHOST")
