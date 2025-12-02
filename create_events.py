import requests
import json
from datetime import date

# API endpoint
API_BASE_URL = "http://localhost:8000/v1/backend"

# Events data from frontend
events_data = [
    {
        "event_name": "Kalakriti Art Competition",
        "season": "1",
        "start_date": "2024-08-15",
        "end_date": "2024-09-30"
    },
    {
        "event_name": "Kalakriti Photography Contest",
        "season": "1", 
        "start_date": "2024-09-01",
        "end_date": "2024-10-15"
    },
    {
        "event_name": "Kalakriti Mehndi Championship",
        "season": "1",
        "start_date": "2024-07-20",
        "end_date": "2024-08-25"
    },
    {
        "event_name": "Kalakriti Rangoli Festival",
        "season": "1",
        "start_date": "2024-10-15",
        "end_date": "2024-11-20"
    },
    {
        "event_name": "Kalakriti Dance Competition",
        "season": "1",
        "start_date": "2024-08-10",
        "end_date": "2024-09-25"
    },
    {
        "event_name": "Kalakriti Singing Contest",
        "season": "1",
        "start_date": "2024-09-05",
        "end_date": "2024-10-20"
    }
]

def create_events():
    """Create events using the API"""
    for event_data in events_data:
        try:
            response = requests.post(
                f"{API_BASE_URL}/events",
                json=event_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                print(f"✅ Created event: {event_data['event_name']}")
                print(f"   Response: {response.json()}")
            else:
                print(f"❌ Failed to create event: {event_data['event_name']}")
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Error creating event {event_data['event_name']}: {str(e)}")
        
        print("-" * 50)

if __name__ == "__main__":
    print("Creating events in the database...")
    create_events()
    print("Done!")