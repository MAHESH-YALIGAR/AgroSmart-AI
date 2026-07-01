import cv2
import numpy as np

from insightface.app import FaceAnalysis

face_app = FaceAnalysis(
    providers=["CPUExecutionProvider"]
)

face_app.prepare(ctx_id=0)

async def generate_embedding(
    faceImage
):
    try:

        image_bytes =await faceImage.read()

        np_array =np.frombuffer(
                image_bytes,
                np.uint8
            )

        image =cv2.imdecode(
                np_array,
                cv2.IMREAD_COLOR
            )

        if image is None:
            return None

        faces =face_app.get(image)

        # No face
        if len(faces) == 0:
            print("No Face Found")
            return None

        # More than one face
        if len(faces) > 1:
            print(
                "Multiple Faces Found"
            )
            return None

        embedding =faces[0].embedding

        return embedding.tolist()

    except Exception as e:
        print(e)
        return None