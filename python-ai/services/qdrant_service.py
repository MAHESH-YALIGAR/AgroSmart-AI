import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, Distance, VectorParams
from qdrant_client.models import (
    Filter,
)

# ==============================
# LOAD ENVIRONMENT VARIABLES
# ==============================
load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "user_faces")

# Debug: Print loaded credentials (masked for security)
print(f"🔍 QDRANT_URL: {QDRANT_URL[:50] if QDRANT_URL else 'NOT SET'}...")
print(f"🔍 QDRANT_API_KEY: {'SET' if QDRANT_API_KEY else 'NOT SET'}")
print(f"🔍 COLLECTION_NAME: {COLLECTION_NAME}")

# ==============================
# INITIALIZE QDRANT CLIENT
# ==============================
client = None
try:
    client = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
        timeout=10,
    )
    print("✅ Connected to Qdrant successfully")
except ConnectionError as e:
    print(f"❌ Connection error - Check internet or Qdrant URL: {e}")
    raise
except Exception as e:
    print(f"❌ Qdrant initialization error: {type(e).__name__}: {e}")
    raise


# ==============================
# ENSURE COLLECTION
# ==============================
def create_collection():
    if client is None:
        print("❌ Qdrant client not initialized - skipping collection creation")
        return

    try:
        print("📦 Checking Qdrant collection...")
        collections = client.get_collections().collections
        names = [c.name for c in collections]
        print(f"   Existing collections: {names}")

        if COLLECTION_NAME not in names:
            print(f"   Creating collection: {COLLECTION_NAME}")
            client.recreate_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=512, distance=Distance.COSINE),
            )
            print(f"✅ Qdrant collection '{COLLECTION_NAME}' created")
        else:
            print(f"✅ Qdrant collection '{COLLECTION_NAME}' exists")

    except ConnectionError as e:
        print(f"❌ Connection error during collection check: {e}")
        print("   Ensure your internet is connected and Qdrant URL is accessible")
    except Exception as e:
        print(f"❌ Qdrant collection error: {type(e).__name__}: {e}")


if client is not None:
    create_collection()
else:
    print("⚠️  Skipping collection creation - Qdrant client unavailable")


# def save_face_embedding(userId, embedding):
#     if client is None:
#         raise RuntimeError("Qdrant client not initialized - cannot save face embedding")

#     try:
#         client.upsert(
#             collection_name=COLLECTION_NAME,
#             points=[
#                 PointStruct(id=userId, vector=embedding, payload={"userId": userId})
#             ],
#         )
#         print(f"✅ Face embedding saved for user: {userId}")
#     except Exception as e:
#         print(f"❌ Error saving face embedding: {e}")
#         raise
import uuid  # 1. Add this import at the top of your file
from qdrant_client.models import PointStruct


import uuid
from qdrant_client.models import PointStruct


def save_face_embedding(userId, embedding):
    if client is None:
        raise RuntimeError("Qdrant client not initialized - cannot save face embedding")

    try:
        # Convert your 24-character hex ID into a valid 32-character UUID string
        padded_hex = userId.zfill(32)
        qdrant_id = str(uuid.UUID(padded_hex))

        # 1. Create the point object
        point = PointStruct(
            id=qdrant_id,
            vector=embedding,
            payload={"userId": userId},
        )

        # 2. Upload it to Qdrant
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=[point],
        )
        print(f"✅ Face embedding saved for user: {userId}")

        # 3. Return the point details along with the embedding array
        print("the valuse  is ", point.vector, "quadrent id", point.id)
        return {
            "qdrant_id": point.id,
            "userId": point.payload["userId"],
            "embedding": point.vector,
        }
    except Exception as e:
        print(f"❌ Error saving face embedding: {e}")
        raise


def search_face_embedding(embedding, score_threshold=0.70):
    if client is None:
        raise RuntimeError(
            "Qdrant client not initialized - cannot search face embeddings"
        )

    try:
        # 1. Use query_points instead of search
        response = client.query_points(
            collection_name=COLLECTION_NAME,
            query=embedding,  # Pass embedding to 'query' parameter
            limit=1,
            score_threshold=score_threshold,  # Threshold parameter is still supported here
        )

        # 2. Extract points list from the response object
        results = response.points

        if len(results) == 0:
            return None

        match = results[0]

        return {"userId": match.payload["userId"], "score": match.score}
    except Exception as e:
        print(f"❌ Error searching face embedding: {e}")
        raise
