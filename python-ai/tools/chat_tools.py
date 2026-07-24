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


@tool
def get_agro_store(
    latitude: float,
    longitude: float,
    config: RunnableConfig,
    product: str = "",
    max_distance_km: float = 100,
    limit: int = 5,
):
    """
    Returns nearby agro stores.

    If product is provided:
        Returns nearby stores where that product is available.

    If product is empty:
        Returns all nearby agro stores.
    """
    # 1. Safely extract coordinates from config, falling back to arguments if missing
    configurable = config.get("configurable", {})
    lat = configurable.get("latitude", latitude)
    lon = configurable.get("longitude", longitude)

    print("agro store Latitude:", lat)
    print("agro store Longitude:", lon)

    # 2. Build base query
    query = {"isActive": True}

    # 3. Only filter by product if a non-empty string is provided
    if product and product.strip():
        query["products"] = {
            "$elemMatch": {
                "product": {"$regex": product.strip(), "$options": "i"},
                "availability": "Available",
            }
        }

    # 4. Aggregation pipeline (OUTSIDE the if-block so it always executes)
    stores = list(
        store_collection.aggregate(
            [
                {
                    "$geoNear": {
                        "near": {
                            "type": "Point",
                            "coordinates": [float(lon), float(lat)],
                        },
                        "distanceField": "distance",
                        "maxDistance": max_distance_km * 1000,
                        "spherical": True,
                        "query": query,
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "storeName": 1,
                        "ownerName": 1,
                        "location": {"coordinates": [lat,lon]},
                        "mobile": 1,
                        "address": 1,
                        "openingTime": 1,
                        "closingTime": 1,
                        "distance": {"$round": [{"$divide": ["$distance", 1000]}, 2]},
                    }
                },
                {"$limit": limit},
            ]
        )
    )
    print("stores info",stores)
    return json.dumps(stores, indent=2)


tools = [get_weather, get_market_prices, get_agro_store, get_agriculture_experts]
tool_node = ToolNode(tools)  # Executes tool calls
# get the govt schems and  services
# get connect the agro expert
# agro  stores  nearby located
