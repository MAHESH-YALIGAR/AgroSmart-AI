import requests

from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from langgraph.prebuilt import ToolNode
from pymongo import MongoClient
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["Agro-Smart-Ai"]      # Database name
market_collection = db["agrostores"] # Collection name
@tool
def get_weather(
    lat: float,
    lon: float,
    config: RunnableConfig,
):
    """Get weather."""

    configurable = config.get("configurable", {})

    frontend_lat = configurable.get("latitude")
    frontend_lon = configurable.get("longitude")

    print("Frontend Latitude:", frontend_lat)
    print("Frontend Longitude:", frontend_lon)

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": frontend_lat,
        "longitude": frontend_lon,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure",
        "hourly": "precipitation_probability",
        "daily": "sunrise,sunset",
        "timezone": "auto",
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    return response.json()

import os
import requests
from langchain.tools import tool

import os
import requests
from langchain_core.tools import tool


@tool
def get_market_prices(
    state: str,
    district: str,
    market: str,
    commodity: str,
) -> dict:
    """
    Fetch real-time mandi prices.

    Required Parameters:
    - state
    - district
    - market
    - commodity

    Only call this tool after collecting all four parameters.
    """

    url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

    api_key = os.getenv("DATA_GOV_API_KEY")

    if not api_key:
        return {
            "status": "error",
            "message": "DATA_GOV_API_KEY is not configured."
        }

    params = {
        "api-key": api_key,
        "format": "json",
        "limit": 10,
        "filters[state]": state,
        "filters[district]": district,
        "filters[market]": market,
        "filters[commodity]": commodity,
    }

    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()

        data = response.json()
        records = data.get("records", [])

        if not records:
            return {
                "status": "not_found",
                "message": f"No market price found for {commodity} in {market}, {district}, {state}.",
            }

        return {
            "status": "success",
            "count": len(records),
            "data": records,
        }

    except requests.exceptions.Timeout:
        return {
            "status": "error",
            "message": "The market price service timed out."
        }

    except requests.exceptions.RequestException as e:
        return {
            "status": "error",
            "message": str(e)
        }


tools = [get_weather, get_market_prices]
tool_node = ToolNode(tools)  # Executes tool calls




# //this is for the get the experts 


expert_collection = db["experts"]


@tool
def get_agriculture_experts(
    crop: str,
    latitude: float,
    longitude: float,
    max_distance_km: float = 30
):
    """
    Returns nearby agriculture experts for a crop.

    Args:
        crop: Crop name (Tomato, Paddy, Sugarcane...)
        latitude: User latitude
        longitude: User longitude
        max_distance_km: Search radius in KM

    Returns:
        List of nearby agriculture experts.
    """

    experts = expert_collection.aggregate([
        {
            "$geoNear": {
                "near": {
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                },
                "distanceField": "distance",
                "maxDistance": max_distance_km * 1000,
                "spherical": True,
                "query": {
                    "crop": {
                        "$regex": crop,
                        "$options": "i"
                    },
                    "isActive": True
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                "name": 1,
                "phone": 1,
                "email": 1,
                "crop": 1,
                "experience": 1,
                "description": 1,
                "state": 1,
                "district": 1,
                "taluka": 1,
                "place": 1,
                "distance": {
                    "$round": [
                        {
                            "$divide": [
                                "$distance",
                                1000
                            ]
                        },
                        2
                    ]
                }
            }
        }
    ])

    return list(experts)


//this is for the get the agro store information 

from langchain.tools import tool
from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URI"))

db = client["Agro-Smart-Ai"]

store_collection = db["agrostores"]


@tool
def get_agro_store(
    product: str,
    latitude: float,
    longitude: float,
    max_distance_km: float = 30
):
    """
    Returns nearby agro stores where a product is available.

    Args:
        product: Product name (Urea, DAP, Confidor...)
        latitude: User latitude
        longitude: User longitude
        max_distance_km: Search radius in KM

    Returns:
        Nearby agro stores.
    """

    stores = store_collection.aggregate([
        {
            "$geoNear": {
                "near": {
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                },
                "distanceField": "distance",
                "maxDistance": max_distance_km * 1000,
                "spherical": True,
                "query": {
                    "isActive": True,
                    "products": {
                        "$elemMatch": {
                            "product": {
                                "$regex": product,
                                "$options": "i"
                            },
                            "availability": "Available"
                        }
                    }
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                "storeName": 1,
                "ownerName": 1,
                "mobile": 1,
                "address": 1,
                "openingTime": 1,
                "closingTime": 1,
                "state": 1,
                "district": 1,
                "taluka": 1,
                "place": 1,
                "location": 1,
                "distance": {
                    "$round": [
                        {
                            "$divide": [
                                "$distance",
                                1000
                            ]
                        },
                        2
                    ]
                }
            }
        }
    ])

    return list(stores)

# get the govt schems and  services
# get connect the agro expert
# agro  stores  nearby located
