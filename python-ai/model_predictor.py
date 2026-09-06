import torch
import torch.nn as nn
import torchvision.transforms as transforms

from torchvision import models
from PIL import Image

import io
import os
from typing import Dict


# ============================================================
# MODEL PATH
# ============================================================

MODEL_PATH = r"D:\resume-project\Agrosmart-AI\python-ai\best_mango_disease_model.pth"




# ============================================================
# PLANT PREDICTOR
# ============================================================

class PlantDiseasePredictor:

    def __init__(self, model_path: str = MODEL_PATH):

        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        self.model = None
        self.model_path = os.path.abspath(model_path)
        self.class_names = []

        self.load_model()


    # ========================================================
    # LOAD MODEL
    # ========================================================

    def load_model(self):

        try:

            print("Loading model from:", self.model_path)

            if not os.path.exists(self.model_path):

                raise FileNotFoundError(
                    f"Model file not found: {self.model_path}"
                )

            # Load checkpoint HERE
            checkpoint = torch.load(
                self.model_path,
                map_location=self.device
            )

            # Get class names
            self.class_names = checkpoint["class_names"]

            print("Number of classes:", len(self.class_names))
            print("Classes:", self.class_names)


            # Create ResNet18
            self.model = models.resnet18(
                weights=None
            )

            # Change final layer
            self.model.fc = nn.Linear(
                self.model.fc.in_features,
                len(self.class_names)
            )

            # Load trained weights
            self.model.load_state_dict(
                checkpoint["model_state_dict"]
            )

            # Move model to CPU/GPU
            self.model = self.model.to(
                self.device
            )

            # Evaluation mode
            self.model.eval()

            print("✅ Plant model loaded successfully!")

        except Exception as e:

            print(f"❌ Error loading model: {e}")
            raise

    # ========================================================
    # PREPROCESS IMAGE
    # ========================================================

    def preprocess_image(
        self,
        image_bytes: bytes
    ):

        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")


        transform = transforms.Compose([

            transforms.Resize(
                (224, 224)
            ),

            transforms.ToTensor(),

            transforms.Normalize(

                mean=[
                    0.485,
                    0.456,
                    0.406
                ],

                std=[
                    0.229,
                    0.224,
                    0.225
                ]
            )
        ])


        tensor_image = transform(
            image
        )


        # Add batch dimension
        tensor_image = tensor_image.unsqueeze(0)


        # Move to CPU/GPU
        tensor_image = tensor_image.to(
            self.device
        )


        return tensor_image


    # ========================================================
    # PREDICT
    # ========================================================

    def predict(
        self,
        image_bytes: bytes
    ):

        try:

            # Preprocess image
            tensor_image = self.preprocess_image(
                image_bytes
            )


            # Prediction
            with torch.no_grad():

                output = self.model(
                    tensor_image
                )


                probabilities = torch.softmax(
                    output,
                    dim=1
                )


                confidence, predicted_class = torch.max(
                    probabilities,
                    dim=1
                )


            # Convert to Python values
            confidence_value = confidence.item()

            predicted_index = predicted_class.item()
            print("Predicted index:", predicted_index)
            print("Predicted plant:", self.class_names[predicted_index])

            # Get predicted plant name
            plant_name = self.class_names[
                predicted_index
            ]


            result = {

                "detected_issue":
                    plant_name,

                "confidence":
                    float(confidence_value),

                "confidence_percentage":
                    round(
                        confidence_value * 100,
                        2
                    ),

                "class_index":
                    int(predicted_index)
            }


            print(
                f"🌱 Prediction: {plant_name} "
                f"({confidence_value * 100:.2f}%)"
            )


            return result


        except Exception as e:

            print(
                f"❌ Error during prediction: {e}"
            )


            return {

                "detected_issue":
                    None,

                "confidence":
                    0.0,

                "confidence_percentage":
                    0.0,

                "error":
                    str(e)
            }


# ============================================================
# GLOBAL PREDICTOR
# ============================================================

_predictor = None


def get_predictor():

    global _predictor


    if _predictor is None:

        _predictor = PlantDiseasePredictor()


    return _predictor


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_from_image(
    image_bytes: bytes
):

    predictor = get_predictor()

    return predictor.predict(
        image_bytes
    )