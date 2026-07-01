import requests

from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from langgraph.prebuilt import ToolNode

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


# get the govt schems and  services
# get connect the agro expert
# agro  stores  nearby located
