from fastapi import UploadFile

from tools.face_embedding import generate_embedding

from services.qdrant_service import save_face_embedding, search_face_embedding


async def register_face(userId: str, faceImage: UploadFile):

    embedding = await generate_embedding(faceImage)

    if embedding is None:
        return {"success": False, "message": "No face detected"}

    save_face_embedding(userId, embedding)

    return {
        "success": True,
        "message": "Face Registered Successfully",
        "userId": userId,
    }


async def face_login(faceImage: UploadFile):
    print(faceImage)
    embedding = await generate_embedding(faceImage)
    print("embedding from frontend is", embedding)
    if embedding is None:
        return {"success": False, "message": "No face detected"}

    result = search_face_embedding(embedding)
    print("the result of the seearched  embedding is ", result)

    if result is None:
        return {"success": False, "message": "Face not recognized"}

    return {"success": True, "userId": result["userId"], "score": result["score"]}
