import json

with open("/home/ubuntu/protocolos-app/client/src/data/protocols.json", "r", encoding="utf-8") as f:
    protocols = json.load(f)
    
for p in protocols:
    print(f"ID: {p['id']} -> Title: {p['title']}")
