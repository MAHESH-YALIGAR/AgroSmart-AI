import os
from pymongo import MongoClient
from dotenv import load_dotenv

# 1. Load variables from the .env file into the script
load_dotenv()

# 2. Fetch the URI string and assign it to the variable
MONGO_URI = os.getenv("MONGO_URI")

# 3. Create the MongoDB client
Mongo_client = MongoClient(MONGO_URI)

# Optional: Ping the database to verify the connection
try:
    Mongo_client.admin.command('ping')
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(f"Connection failed: {e}")
