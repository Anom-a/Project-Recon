import os
import glob
import re

for filepath in glob.glob("apps/accounts/tests/api/*.py"):
    with open(filepath, "r") as f:
        content = f.read()

    # Replace response.json()["data"] with response.json()
    # But wait, if it's a list response from a ModelViewSet (e.g. list_users, list_branches), 
    # DRF returns {"count": ..., "next": ..., "previous": ..., "results": [...]}.
    # We should use response.json()["results"] if it's paginated, or response.json() if it's not.
    # In my tests, let me check if DRF pagination is active. 
    # Usually `results` is the key for list views. Wait! If they used success_response, list views returned {"success": True, "data": [...]}.
    # With DRF default pagination, it's response.json()["results"].
    # Let me check if pagination is active globally.
