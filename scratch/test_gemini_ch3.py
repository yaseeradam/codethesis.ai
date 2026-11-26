import os, json, urllib.request

api_key = None
with open('/var/www/codethesis/web/.env.local') as f:
    for line in f:
        if line.startswith('GEMINI_API_KEY='):
            api_key = line.split('=', 1)[1].strip().strip('"').strip("'")
            break

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

prompt = """Write Chapter 3 for dissertation: 'Design and Implementation of an Automated Door security for Police Stations in Nigeria'. Follow canonical structure:
3.1 Introduction (Design philosophy and objectives of system analysis)
3.2 Analysis of the Existing System & Current Workflow
Write complete academic text."""

payload = {
    "contents": [{"parts": [{"text": prompt}]}],
    "generationConfig": {"temperature": 0.78, "maxOutputTokens": 2000}
}
req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    raw = data['candidates'][0]['content']['parts'][0]['text']
    for line in raw.split('\n')[:25]:
        if line.strip():
            print("LINE:", repr(line))
