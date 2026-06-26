from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from brightmind.ai_service import ask_claude
import random

ACTIVITY_TYPES = [
    "nature scavenger hunt", "drawing what you see outside",
    "simple garden science experiment", "fun running game with friends",
    "bird watching", "cloud shape spotting",
    "traditional Tamil outdoor game like kabaddi or kho-kho",
]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_activity(request):
    """Generate a fun daily outdoor activity for the child."""
    profile      = request.user.child_profile
    activity_type = random.choice(ACTIVITY_TYPES)

    prompt = f"""Suggest a detailed {activity_type} outdoor activity for a {profile.age}-year-old child.
Include:
1. What to do (step by step, max 4 steps)
2. What you need (simple household items)
3. Why it is fun and good for health
Keep it exciting and doable in 20-30 minutes."""

    result = ask_claude(prompt, language=profile.language,
                        age=profile.age, mode="outdoor")
    return Response({
        'activity':      result['reply'],
        'activity_type': activity_type,
        'language':      profile.language,
    })