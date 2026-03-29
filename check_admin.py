import os
from dotenv import load_dotenv
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from datetime import datetime

load_dotenv()
URI = os.environ.get("MONGO_URI")
client = MongoClient(URI)
db = client['dermai']
users_collection = db['users']

admin = users_collection.find_one({"email": "admin@dermai.com"})
if admin:
    print("Admin exists! Replacing password to be sure.")
    users_collection.update_one({"email": "admin@dermai.com"}, {"$set": {"password": generate_password_hash("admin123")}})
else:
    print("Admin NOT found! Inserting forcefully...")
    users_collection.insert_one({
        "name": "System Admin",
        "email": "admin@dermai.com",
        "password": generate_password_hash("admin123"),
        "role": "admin",
        "approved": True,
        "created_at": datetime.utcnow()
    })

print("Done.")
