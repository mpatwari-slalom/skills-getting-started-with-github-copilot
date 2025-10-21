import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_root_redirect():
    """Test that root path redirects to static/index.html"""
    response = client.get("/")
    assert response.status_code == 200 or response.status_code == 307
    
def test_get_activities():
    """Test getting all activities"""
    response = client.get("/activities")
    assert response.status_code == 200
    activities = response.json()
    assert isinstance(activities, dict)
    assert len(activities) > 0
    
    # Check activity structure
    for activity_name, details in activities.items():
        assert isinstance(activity_name, str)
        assert isinstance(details, dict)
        assert "description" in details
        assert "schedule" in details
        assert "max_participants" in details
        assert "participants" in details
        assert isinstance(details["participants"], list)

def test_signup_for_activity():
    """Test signing up for an activity"""
    # Get first available activity
    activities = client.get("/activities").json()
    activity_name = next(iter(activities))
    
    # Test successful signup
    email = "test_student@mergington.edu"
    response = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert response.status_code == 200
    assert "message" in response.json()
    
    # Get fresh activities data to verify registration
    updated_activities = client.get("/activities").json()
    assert email in updated_activities[activity_name]["participants"]
    
    # Test duplicate signup
    response = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"].lower()

def test_signup_nonexistent_activity():
    """Test signing up for a non-existent activity"""
    response = client.post("/activities/nonexistent/signup?email=test@mergington.edu")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_unregister_from_activity():
    """Test unregistering from an activity"""
    # Get first available activity
    activities = client.get("/activities").json()
    activity_name = next(iter(activities))
    
    # First sign up a test student
    email = "test_unregister@mergington.edu"
    client.post(f"/activities/{activity_name}/signup?email={email}")
    
    # Test successful unregistration
    response = client.delete(f"/activities/{activity_name}/unregister?email={email}")
    assert response.status_code == 200
    assert "message" in response.json()
    
    # Verify student is removed
    activities = client.get("/activities").json()
    assert email not in activities[activity_name]["participants"]
    
    # Test unregistering non-registered student
    response = client.delete(f"/activities/{activity_name}/unregister?email={email}")
    assert response.status_code == 400
    assert "not found" in response.json()["detail"].lower()

def test_unregister_nonexistent_activity():
    """Test unregistering from a non-existent activity"""
    response = client.delete("/activities/nonexistent/unregister?email=test@mergington.edu")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()