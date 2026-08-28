import urllib.request
import re

req = urllib.request.Request('https://vrebro.onrender.com/index.html')
try:
    res = urllib.request.urlopen(req).read().decode()
    js_files = re.findall(r'src="/assets/index-([^\"]+)\.js"', res)
    if js_files:
        js_url = f'https://vrebro.onrender.com/assets/index-{js_files[0]}.js'
        js_content = urllib.request.urlopen(js_url).read().decode()
        if '1500' in js_content:
            print('1.5s interval is LIVE!')
        elif '5000' in js_content:
            print('5s interval is still LIVE! (Not updated)')
        else:
            print('Unknown interval')
    else:
        print('No js found')
except Exception as e:
    print(e)
