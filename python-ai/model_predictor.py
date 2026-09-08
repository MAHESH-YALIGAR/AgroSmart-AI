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
# MODEL_PATH = r"D:\resume-project\Agrosmart-AI\python-ai\data.pkl"



# ============================================================
# PLANT PREDICTOR
# ============================================================


class PlantDiseasePredictor:

    def __init__(self, model_path: str = MODEL_PATH):

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

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

            checkpoint = torch.load(
                self.model_path,
                map_location=self.device,
                weights_only=False,
            )

            if not isinstance(checkpoint, dict):
                raise ValueError(
                    f"Expected a checkpoint dictionary, got {type(checkpoint).__name__}"
                )

            if "class_names" not in checkpoint:
                raise KeyError("Checkpoint is missing 'class_names'")

            if "model_state_dict" not in checkpoint:
                raise KeyError("Checkpoint is missing 'model_state_dict'")

            self.class_names = checkpoint["class_names"]

            print("Number of classes:", len(self.class_names))
            print("Classes:", self.class_names)

            self.model = models.resnet18(weights=None)
            self.model.fc = nn.Linear(
                self.model.fc.in_features,
                len(self.class_names)
            )

            self.model.load_state_dict(checkpoint["model_state_dict"])
            self.model = self.model.to(self.device)
            self.model.eval()

            print("✅ Plant model loaded successfully!")

        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise

    # ========================================================
    # PREPROCESS IMAGE
    # ========================================================

    def preprocess_image(self, image_bytes: bytes):

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        transform = transforms.Compose(
            [
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
                ),
            ]
        )

        tensor_image = transform(image)

        # Add batch dimension
        tensor_image = tensor_image.unsqueeze(0)

        # Move to CPU/GPU
        tensor_image = tensor_image.to(self.device)

        return tensor_image

    # ========================================================
    # PREDICT
    # ========================================================

    # def predict(self, image_bytes: bytes):

    #     try:

    #         # Preprocess image
    #         tensor_image = self.preprocess_image(image_bytes)

    #         # Prediction
    #         with torch.no_grad():

    #             output = self.model(tensor_image)

    #             probabilities = torch.softmax(output, dim=1)

    #             confidence, predicted_class = torch.max(probabilities, dim=1)

    #         # Convert to Python values
    #         confidence_value = confidence.item()

    #         predicted_index = predicted_class.item()
    #         print("Predicted index:", predicted_index)
    #         print("Predicted plant:", self.class_names[predicted_index])

    #         confidence_percentage = round(confidence_value * 100, 2)

    #         if confidence_value < 0.90:
    #             print(
    #                 f"⚠️ Confidence is too low ({confidence_percentage:.2f}%). "
    #                 "Please upload a clear image."
    #             )
    #             return {
    #                 "detected_issue": None,
    #                 "confidence": float(confidence_value),
    #                 "confidence_percentage": confidence_percentage,
    #                 "class_index": int(predicted_index),
    #                 "message": "I could not identify the disease confidently. "
    #                 "Please upload a clear image.",
    #             }

    #         plant_name = self.class_names[predicted_index]
    #         result = {
    #             "detected_issue": plant_name,
    #             "confidence": float(confidence_value),
    #             "confidence_percentage": confidence_percentage,
    #             "class_index": int(predicted_index),
    #         }

    #         print(f"🌱 Prediction: {plant_name} " f"({confidence_percentage:.2f}%)")

    #         return result

    #     except Exception as e:

    #         print(f"❌ Error during prediction: {e}")

    #         return {
    #             "detected_issue": None,
    #             "confidence": 0.0,
    #             "confidence_percentage": 0.0,
    #             "error": str(e),
    #         }


    def predict(self, image_bytes: bytes):
        try:
            tensor_image = self.preprocess_image(image_bytes)

            with torch.no_grad():
                output = self.model(tensor_image)
                
                # 1. Get raw scores to evaluate activation health
                raw_max_logit, _ = torch.max(output, dim=1)
                raw_logit_value = raw_max_logit.item()

                probabilities = torch.softmax(output, dim=1)
                
                # 2. Extract TOP 2 choices to check confidence gap
                top2_conf, top2_classes = torch.topk(probabilities, k=2, dim=1)

            confidence_value = top2_conf[0][0].item()
            second_confidence = top2_conf[0][1].item()
            predicted_index = top2_classes[0][0].item()

            confidence_percentage = round(confidence_value * 100, 2)
            confidence_gap = confidence_value - second_confidence

            # 🛑 CRITICAL AUTOMATED FILTER 1: The Confidence Gap Check
            # If the model is highly confident in one class, the gap should be wide.
            # If it's picking a random class out of confusion, the gap will be very narrow (< 0.20)
            if confidence_gap < 0.25:
                print(f"⚠️ Rejecting: Model is structurally confused (Gap: {confidence_gap:.4f})")
                return self._build_error_payload(confidence_percentage)

            # 🛑 CRITICAL AUTOMATED FILTER 2: Raw Logit Health Check
            # Real leaf features generate strong positive activations (> 1.8)
            # Blur, textures, and wrong plants produce weak flat responses (< 1.8)
            if raw_logit_value < 1.8:
                print(f"⚠️ Rejecting: Weak disease visual signatures (Logit: {raw_logit_value:.2f})")
                return self._build_error_payload(confidence_percentage)

            # Standard Threshold Check
            if confidence_value < 0.90:
                return self._build_error_payload(confidence_percentage)

            plant_name = self.class_names[predicted_index]
            return {
                "detected_issue": plant_name,
                "confidence": float(confidence_value),
                "confidence_percentage": confidence_percentage,
                "class_index": int(predicted_index),
                "status": "success"
            }

        except Exception as e:
            print(f"❌ Prediction error: {e}")
            return {"detected_issue": None, "error": str(e), "status": "error"}

    def _build_error_payload(self, conf_pct):
        return {
            "detected_issue": None,
            "confidence_percentage": conf_pct,
            "status": "rejected",
            "message": "The image uploaded does not contain clear, identifiable leaf disease characteristics. Please retake the photo closely under good lighting."
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


def predict_from_image(image_bytes: bytes):

    predictor = get_predictor()

    return predictor.predict(image_bytes)
