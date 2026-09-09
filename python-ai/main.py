import json
import re
from datetime import datetime
import uvicorn
from fastapi import FastAPI, Form, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.face_service import register_face, face_login
from input_types import ChatRequest
from langchain_core.messages import HumanMessage, ToolMessage
from agents.main_agent import compiled_graph
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError
from model_predictor import predict_from_image
from mongo_client import db
load_dotenv()
app = FastAPI()


class ExpertFeedbackPayload(BaseModel):
    userId: str = Field(..., min_length=1)
    expertId: str = Field(..., min_length=1)
    adviceId: str = Field(..., min_length=1)
    rating: int = Field(..., ge=1, le=5)
    feedbackText: str = Field(..., min_length=1)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"success": True, "message": "AgroSmart AI Server Running"}


def infer_category(feedback_text: str) -> str:
    text = (feedback_text or "").lower()

    if any(keyword in text for keyword in ["improved", "helped", "effective", "good", "works", "success"]):
        return "treatment_effective"

    if any(keyword in text for keyword in ["not effective", "failed", "worse", "bad", "did not work", "no improvement"]):
        return "treatment_not_effective"

    return "general_feedback"


def infer_sentiment(feedback_text: str, rating: int) -> str:
    text = (feedback_text or "").lower()

    positive_keywords = ["good", "helped", "effective", "improved", "great", "excellent", "works", "success"]
    negative_keywords = ["bad", "failed", "worse", "not effective", "did not work", "poor"]

    if rating >= 4 or any(keyword in text for keyword in positive_keywords):
        return "positive"

    if rating <= 2 or any(keyword in text for keyword in negative_keywords):
        return "negative"

    return "neutral"


@app.post("/expert-feedback")
async def submit_expert_feedback(payload: ExpertFeedbackPayload):
    feedback_document = {
        "userId": payload.userId,
        "expertId": payload.expertId,
        "adviceId": payload.adviceId,
        "rating": payload.rating,
        "feedbackText": payload.feedbackText,
        "category": infer_category(payload.feedbackText),
        "sentiment": infer_sentiment(payload.feedbackText, payload.rating),
        "createdAt": datetime.utcnow(),
    }

    result = db["expert_feedbacks"].insert_one(feedback_document)

    feedback_document["_id"] = str(result.inserted_id)

    return {
        "success": True,
        "message": "Feedback submitted successfully",
        "data": feedback_document,
    }


@app.get("/expert-feedbacks/{expertId}")
async def get_expert_feedbacks(expertId: str):
    feedbacks = list(
        db["expert_feedbacks"]
        .find({"expertId": expertId})
        .sort("createdAt", -1)
    )

    for item in feedbacks:
        item["_id"] = str(item["_id"])

    return {
        "success": True,
        "data": feedbacks,
    }


@app.post("/register-face")
async def register_face_route(
    userId: str = Form(...), faceImage: UploadFile = File(...)
):
    return await register_face(userId, faceImage)


@app.post("/face-login")
async def face_login_route(faceImage: UploadFile = File(...)):
    print("File Name:", faceImage.filename)

    content = await faceImage.read()

    print("File Size:", len(content))

    await faceImage.seek(0)

    return await face_login(faceImage)




def sanitize_speech_text(text: str) -> str:
    if not text:
        return text

    cleaned = text
    cleaned = re.sub(r"(?m)^\s*[-*•#]+\s*", "", cleaned)
    cleaned = re.sub(r"(?m)^\s*\d+\.\s*", "", cleaned)
    cleaned = re.sub(r"\*\*|__|`", "", cleaned)
    cleaned = cleaned.replace("#", "")
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    cleaned = cleaned.strip()

    return cleaned


def normalize_tool_payload(content):
    if isinstance(content, str):
        try:
            return json.loads(content)
        except (TypeError, ValueError):
            return content
    return content


def summarize_store_items(stores):
    if not isinstance(stores, list):
        return ""

    lines = []

    for store in stores:
        if not isinstance(store, dict):
            continue

        name = store.get("storeName") or store.get("name") or store.get("shopName")
        if not name:
            continue

        address_parts = [
            store.get("place"),
            store.get("taluka"),
            store.get("district"),
            store.get("state"),
        ]
        address = ", ".join(part for part in address_parts if part)
        if store.get("address"):
            address = store.get("address")

        distance = store.get("distance")
        distance_text = f"Distance: {distance} km" if distance is not None else ""

        product_names = []
        for product in store.get("products", []) or []:
            if isinstance(product, dict):
                product_name = product.get("product") or product.get("name")
                if product_name:
                    availability = product.get("availability")
                    if availability and availability.lower() != "available":
                        product_names.append(f"{product_name} ({availability})")
                    else:
                        product_names.append(product_name)

        product_text = f"Products: {', '.join(product_names)}" if product_names else "Products: not listed"

        line = f"{name}"
        if address:
            line += f", {address}"
        if distance_text:
            line += f", {distance_text}"
        line += f", {product_text}"
        if store.get("mobile"):
            line += f", Phone: {store.get('mobile')}"

        lines.append(line)

    return "\n".join(lines)


def summarize_expert_items(experts):
    if not isinstance(experts, list):
        return ""

    lines = []

    for expert in experts:
        if not isinstance(expert, dict):
            continue

        name = expert.get("name") or expert.get("expertName") or expert.get("fullName")
        if not name:
            continue

        crop = expert.get("crop") or expert.get("cropSpecialization") or expert.get("specialization") or "Agriculture"
        experience = expert.get("experience") or expert.get("experienceYears") or expert.get("yearsOfExperience")
        phone = expert.get("phone") or expert.get("phoneNumber") or expert.get("contactNumber") or expert.get("mobile")
        distance = expert.get("distance") or expert.get("distanceKm") or expert.get("distanceFromUser")

        address_parts = [
            expert.get("place"),
            expert.get("taluka"),
            expert.get("district"),
            expert.get("state"),
        ]
        address = ", ".join(part for part in address_parts if part)
        if expert.get("address"):
            address = expert.get("address")

        line = f"{name}"
        line += f", {crop}"
        if experience:
            line += f", Experience: {experience} years"
        if distance is not None:
            line += f", Distance: {distance} km"
        if phone:
            line += f", Phone: {phone}"
        if address:
            line += f", Location: {address}"

        lines.append(line)

    return "\n".join(lines)


@app.post("/chat")
async def chat_endpoint(
    photo: UploadFile = File(None),
    payload: str = Form(...)
):
    """Receive metadata and an image for your custom local pipeline."""
    try:
        # 1. Parse and validate using your Pydantic ChatRequest schema
        try:
            json_data = json.loads(payload)
            if not isinstance(json_data, dict):
                raise ValueError("payload must be a JSON object")
            request = ChatRequest(**json_data)
        except (json.JSONDecodeError, TypeError, ValueError, ValidationError) as e:
            raise HTTPException(status_code=422, detail=f"Invalid payload structure: {str(e)}")

        print(f"📥 Request from User: {request.userId} | Language: {request.language}")

        # 2. Process image bytes directly for your own model
        # Safe default state so LangGraph nodes don't crash when reading it
        model_predictions = {
            "detected_issue": None,
            "confidence": 0.0,
            "message": "",
        }

        print(
            "Received photo:",
            photo.filename if photo is not None else "No file received",
        )

        if photo is not None:
            image_bytes = await photo.read()
            print(f"📸 Running custom model on uploaded file: {photo.filename}")
            
            # Use the plant disease predictor model
            model_predictions = predict_from_image(image_bytes) 
            
        print("the detected disease is:", model_predictions)

        # 3. Feed the prompt metadata alongside your custom model data into LangGraph
        inputs = {
            "messages": [HumanMessage(content=request.prompt)], 
            "latitude": request.latitude,
            "longitude": request.longitude,
            "userId": request.userId,
            "custom_model_output": model_predictions, # Guaranteed to be a valid dictionary structure
             "language": request.language,
        }

        config = {
            "configurable": {
                "thread_id": request.userId,
                "latitude": request.latitude,
                "longitude": request.longitude,
                "language": request.language,
            }
        }
        
        # Execute your compiled LangGraph workflow pipeline
        print("config data is:", config)
        print("input state is:", inputs)
        
        output = compiled_graph.invoke(inputs, config=config)

        # Extract last message
        final_message = output["messages"][-1].content
        reply_text = sanitize_speech_text(str(final_message))

        tool_messages = [message for message in output.get("messages", []) if isinstance(message, ToolMessage)]

        response_type = "text"
        response_data = None
        tool_summaries = []

        if tool_messages:
            last_tool_message = tool_messages[-1]
            tool_name = getattr(last_tool_message, "name", None)
            tool_content = normalize_tool_payload(last_tool_message.content)

            if isinstance(tool_content, list):
                response_data = tool_content
            elif isinstance(tool_content, dict):
                response_data = [tool_content]
            elif tool_content is not None:
                response_data = [tool_content]

            if tool_name == "get_agro_store":
                response_type = "agro_store"
            elif tool_name == "get_agriculture_experts":
                response_type = "expert"
            elif tool_name == "get_weather":
                response_type = "weather"
            elif tool_name == "get_market_prices":
                response_type = "market_price"

            for tool_message in tool_messages:
                parsed_content = normalize_tool_payload(tool_message.content)
                if getattr(tool_message, "name", None) == "get_agro_store":
                    if isinstance(parsed_content, dict) and parsed_content.get("success") is False:
                        continue
                    stores = parsed_content if isinstance(parsed_content, list) else []
                    if isinstance(parsed_content, dict) and isinstance(parsed_content.get("data"), list):
                        stores = parsed_content.get("data", [])
                    store_summary = summarize_store_items(stores)
                    if store_summary:
                        tool_summaries.append(store_summary)
                elif getattr(tool_message, "name", None) == "get_agriculture_experts":
                    if isinstance(parsed_content, dict) and parsed_content.get("success") is False:
                        continue
                    experts = parsed_content if isinstance(parsed_content, list) else []
                    if isinstance(parsed_content, dict) and isinstance(parsed_content.get("data"), list):
                        experts = parsed_content.get("data", [])
                    expert_summary = summarize_expert_items(experts)
                    if expert_summary:
                        tool_summaries.append(expert_summary)

        if tool_summaries:
            reply_text = sanitize_speech_text(f"{reply_text}\n\n{chr(10).join(tool_summaries)}")

        return {
            "status": "success",
            "type": response_type,
            "reply": reply_text,
            "data": response_data,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error during processing: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    
    
    
if __name__ == "__main__":
    # Correct way to run FastAPI within a script
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
