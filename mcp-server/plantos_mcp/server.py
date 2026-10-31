import os
from datetime import datetime
from pathlib import Path

import httpx
from dotenv import load_dotenv
from mcp.server.mcpserver import MCPServer

DEFAULT_BASE_URL = "http://localhost:5199"
load_dotenv(Path(__file__).resolve().parent.parent / ".env", override=False)


def get_api_base_url() -> str:
    return (os.environ.get("PLANTOS_API_BASE_URL", "").strip().rstrip("/") or DEFAULT_BASE_URL)

# Matches PlantOS.Core.Entities.PlantEventType - the API has no JsonStringEnumConverter
# registered, so eventType comes through the wire as this underlying int, not a string.
EVENT_TYPE_NAMES = {
    0: "Water",
    1: "Fertilise",
    2: "Repot",
    3: "Prune",
    4: "Bloom",
    5: "NewLeaf",
    6: "PestDetection",
}

app = MCPServer("plantos")


@app.tool()
async def list_plants() -> list[dict]:
    """List all plants tracked in PlantOS, including id, name, species, and tile position."""
    base_url = get_api_base_url()
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{base_url}/api/plants")
        response.raise_for_status()
        return response.json()


@app.tool()
async def get_care_context(plant_id: str) -> dict:
    """Get a plant's details and full event history, with days-since-last-event
    hints for every care event type, to help generate grounded care tips."""
    base_url = get_api_base_url()
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{base_url}/api/plants/{plant_id}/events")

    if response.status_code == 404:
        raise ValueError(f"No plant found with id '{plant_id}'.")
    response.raise_for_status()

    plant = response.json()

    # Find the most recent event date per event type.
    last_seen: dict[str, datetime] = {}
    for event in plant["events"]:
        type_name = EVENT_TYPE_NAMES.get(event["eventType"], str(event["eventType"]))
        event_date = datetime.fromisoformat(event["date"])
        if type_name not in last_seen or event_date > last_seen[type_name]:
            last_seen[type_name] = event_date

    # Report every known event type, even ones that have never happened -
    # "never repotted" is a useful signal, not just a gap in the data.
    now = datetime.now()
    plant["careHints"] = {
        type_name: {
            "last_date": last_seen[type_name].isoformat() if type_name in last_seen else None,
            "days_since": (now - last_seen[type_name]).days if type_name in last_seen else None,
        }
        for type_name in EVENT_TYPE_NAMES.values()
    }

    return plant


def main() -> None:
    app.run()


if __name__ == "__main__":
    main()