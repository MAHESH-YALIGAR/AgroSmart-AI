import requests
import os
import requests
from langchain_core.tools import tool
from langchain.tools import tool
from langchain_core.runnables import RunnableConfig
from langgraph.prebuilt import ToolNode
from mongo_client import Mongo_client
from typing_extensions import Annotated
from langchain_core.tools.base import InjectedToolArg

db = Mongo_client["Agro-Smart-Ai"]  # Database name


@tool
def get_weather(config: RunnableConfig):
    """
    Get the current weather and today's rain chances for the user's location.
    The user's location is provided automatically.
    NEVER ask the user for latitude/longitude or their location.
    Call this tool directly.
    """
    configurable = config.get("configurable", {})
    lat = configurable.get("latitude")
    lon = configurable.get("longitude")

    print("Weather Latitude:", lat)
    print("Weather Longitude:", lon)

    try:
        lat, lon = float(lat), float(lon)
    except (TypeError, ValueError):
        return {"error": "User location not available."}

    params = {
        "latitude": lat,
        "longitude": lon,
        "current": (
            "temperature_2m,relative_humidity_2m,apparent_temperature,"
            "precipitation,rain,weather_code,wind_speed_10m,"
            "wind_direction_10m,surface_pressure"
        ),
        "hourly": "precipitation_probability",
        "daily": "sunrise,sunset",
        "timezone": "auto",
        "forecast_days": 1,   # only today, keeps the response small
    }

    try:
        response = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params=params,
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        print("Weather API error:", e)
        return {"error": "Could not fetch weather right now."}

    return {
        "current": data.get("current"),
        "current_units": data.get("current_units"),
        "hourly_precipitation_probability": data.get("hourly", {}).get("precipitation_probability"),
        "hourly_time": data.get("hourly", {}).get("time"),
        "sunrise": data.get("daily", {}).get("sunrise", [None])[0],
        "sunset": data.get("daily", {}).get("sunset", [None])[0],
        "timezone": data.get("timezone"),
    }

@tool
def get_market_prices(
    state: str,
    district: str,
    market: str,
    commodity: str,
) -> dict:
    """
    Fetch real-time mandi prices from data.gov.in.

    Required Parameters:
    - state
    - district
    - market
    - commodity

    Example:
    state = Karnataka
    district = Haveri
    market = Haveri
    commodity = Tomato
    """

    API_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

    api_key = os.getenv("DATA_GOV_API_KEY")

    if not api_key:
        return {
            "status": "error",
            "message": "DATA_GOV_API_KEY environment variable is not configured.",
        }

    # Remove extra spaces
    state = state.strip()
    district = district.strip()
    market = market.strip()
    commodity = commodity.strip()

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

        print("\n========== TOOL CALLED ==========")
        print("State     :", state)
        print("District  :", district)
        print("Market    :", market)
        print("Commodity :", commodity)
        print("=================================\n")

        response = requests.get(API_URL, params=params, timeout=20)

        print("Status Code :", response.status_code)

        response.raise_for_status()

        data = response.json()

        print("\nComplete API Response:")
        print(data)

        records = data.get("records", [])

        print(f"\nTotal Records Found : {len(records)}")

        if len(records) == 0:
            return {
                "status": "not_found",
                "message": f"No market price found for '{commodity}' in '{market}', '{district}', '{state}'.",
                "query": {
                    "state": state,
                    "district": district,
                    "market": market,
                    "commodity": commodity,
                },
            }

        simplified_records = []

        for record in records:
            simplified_records.append(
                {
                    "state": record.get("state"),
                    "district": record.get("district"),
                    "market": record.get("market"),
                    "commodity": record.get("commodity"),
                    "variety": record.get("variety"),
                    "arrival_date": record.get("arrival_date"),
                    "min_price": record.get("min_price"),
                    "max_price": record.get("max_price"),
                    "modal_price": record.get("modal_price"),
                }
            )

        return {
            "status": "success",
            "count": len(simplified_records),
            "data": simplified_records,
        }

    except requests.exceptions.Timeout:
        return {"status": "error", "message": "The request timed out."}

    except requests.exceptions.HTTPError as e:
        return {"status": "error", "message": f"HTTP Error: {e}"}

    except requests.exceptions.RequestException as e:
        return {"status": "error", "message": f"Request Error: {e}"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


# //this is for the get the experts


expert_collection = db["experts"]

import json
from langchain_core.runnables import RunnableConfig


from pprint import pprint
import json

@tool
def get_agriculture_experts(
    config: RunnableConfig,
    crop: str = "",
    max_distance_km: float = 200000,
) -> str:
    """
    Find nearby Government-registered agriculture experts.
    """

    configurable = config.get("configurable", {})

    lat = configurable.get("latitude")
    lon = configurable.get("longitude")

    if lat is None or lon is None:
        return json.dumps(
            {
                "success": False,
                "message": "User location is unavailable."
            },
            indent=2,
        )

    query = {"isActive": True}

    if crop and crop.strip() and crop.lower() != "unknown":
        query["crop"] = {
            "$regex": crop.strip(),
            "$options": "i"
        }

    # ---------------------- DEBUG ----------------------

    # print("\n" + "=" * 60)
    # print("Agriculture Expert Tool")
    # print("=" * 60)
    # print(f"Latitude           : {lat}")
    # print(f"Longitude          : {lon}")
    # print(f"Crop               : {crop}")
    # print(f"Max Distance (km)  : {max_distance_km}")
    # print(f"Mongo Query        : {query}")

    pipeline = [
        {
            "$geoNear": {
                "near": {
                    "type": "Point",
                    "coordinates": [
                        float(lon),
                        float(lat),
                    ],
                },
                "distanceField": "distance",
                "maxDistance": max_distance_km * 1000,
                "spherical": True,
                "query": query,
            }
        },
        {
            "$project": {
                "_id": {"$toString": "$_id"},
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
                "location": 1,
                "distance": {
                    "$round": [
                        {"$divide": ["$distance", 1000]},
                        2
                    ]
                }
            }
        },
        {
            "$sort": {
                "distance": 1
            }
        }
    ]

    print("\nMongoDB Aggregate Pipeline:")
    pprint(pipeline)

    # ---------------------- EXECUTE ----------------------

    try:
        experts = list(expert_collection.aggregate(pipeline))

        print(f"\nExperts Found: {len(experts)}")

        if experts:
            print("First Expert:")
            pprint(experts[0])

        return json.dumps(
            experts,
            indent=2,
            ensure_ascii=False
        )

    except Exception as e:
        import traceback

        print("\nMongoDB ERROR")
        traceback.print_exc()

        return json.dumps(
            {
                "success": False,
                "error": str(e)
            },
            indent=2,
        )
# //this is for the get the agro store information


# client = MongoClient(os.getenv("MONGO_URI"))


store_collection = db["agrostores"]

import json

import re

@tool
def get_agro_store(
    config: RunnableConfig,
    product: str = "",
    max_distance_km: float = 100,
    limit: int = 5,
):
    """
    Returns nearby agro stores.
    - If product is given: stores where that product is available.
    - If product is empty: all nearby agro stores.
    - If nothing is found within max_distance_km, returns the nearest
      stores at any distance.
    """
    configurable = config.get("configurable", {})
    lat = configurable.get("latitude")
    lon = configurable.get("longitude")

    try:
        lat, lon = float(lat), float(lon)
        print("agro_store tool scredentials",lat,lon)
    except (TypeError, ValueError):
        return {"error": "Invalid or missing coordinates"}

    query = {"isActive": True}
    if product and product.strip():
        query["products"] = {
            "$elemMatch": {
                "product": {"$regex": re.escape(product.strip()), "$options": "i"},
                "availability": "Available",
            }
        }

    def search(max_km=None):
        geo = {
            "near": {"type": "Point", "coordinates": [lon, lat]},
            "distanceField": "distance",
            "spherical": True,
            "query": query,
        }
        if max_km is not None:
            geo["maxDistance"] = max_km * 1000

        return list(
            store_collection.aggregate([
                {"$geoNear": geo},
                {"$limit": limit},
                {
                    "$project": {
                        "_id": 0,
                        "storeName": 1, "ownerName": 1, "mobile": 1,
                        "address": 1, "state": 1, "district": 1,
                        "taluka": 1, "place": 1,
                        "openingTime": 1, "closingTime": 1,
                        "products": 1, "location": 1,
                        "distance": {"$round": [{"$divide": ["$distance", 1000]}, 2]},
                    }
                },
            ])
        )

    # 1. Try within the requested radius
    stores = search(max_distance_km)
    expanded = False

    # 2. Fallback: nearest stores at any distance
    if not stores:
        stores = search(None)
        expanded = True

    print("stores info", stores)

    if not stores:
        return {"message": "No active stores found.", "stores": []}

    return {
        "message": (
            f"No stores found within {max_distance_km} km. "
            "Showing the nearest stores available (distance in km)."
            if expanded
            else f"Stores within {max_distance_km} km (distance in km)."
        ),
        "stores": stores,
    }
    print("stores info",stores)
    return json.dumps(stores, indent=2)


tools = [get_weather, get_market_prices, get_agro_store, get_agriculture_experts]
tool_node = ToolNode(tools)  # Executes tool calls
# get the govt schems and  services
# get connect the agro expert
# agro  stores  nearby located
