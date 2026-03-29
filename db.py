from pymongo import MongoClient
import os
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = 'dermai'

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

users_collection = db['users']
cases_collection = db['cases']

def init_db():
    # Create default admin if not exists
    admin_email = 'admin@dermai.com'
    existing_admin = users_collection.find_one({'email': admin_email, 'role': 'admin'})
    if not existing_admin:
        print("Seeding default admin user...")
        users_collection.insert_one({
            'name': 'System Administrator',
            'email': admin_email,
            'password': generate_password_hash('admin123'),
            'role': 'admin',
            'approved': True 
        })
        print("Admin user created (admin@dermai.com / admin123)")

# Call it once when imported
init_db()
