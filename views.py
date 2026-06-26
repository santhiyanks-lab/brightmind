from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from brightmind.ai_service import ask_claude

CREATIVE_TYPES = [
    "drawing ideas", "craft making", "poem writing",
    "song lyrics", "comic strip", "coloring ideas",
]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_creative_types(request):
    """Return available creative activity types."""
    return Response({'creative_types': CREATIVE_TYPES})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_idea(request):
    """AI gives a creative idea based on chosen type."""
    creative_type = request.data.get('type', 'drawing ideas')
    profile       = request.user.child_profile
    language      = profile.language
    age           = profile.age

    prompt = f"Give a fun and simple {creative_type} idea for a {age}-year-old child. Give step-by-step instructions. Be encouraging and exciting!"

    result = ask_claude(prompt, language=language, age=age, mode="chat")
    return Response({
        'idea':     result['reply'],
        'type':     creative_type,
        'language': language,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_creation(request):
    """Child shares what they made — AI gives encouragement and feedback."""
    creation = request.data.get('creation', '')
    profile  = request.user.child_profile

    prompt = f"The child made this: '{creation}'. Give them very encouraging and kind feedback. Praise their creativity and suggest one small fun improvement."

    result = ask_claude(
        prompt,
        language=profile.language,
        age=profile.age,
        mode="chat",
    )

    # Reward points for being creative
    profile.points += 5
    profile.save()

    return Response({
        'feedback': result['reply'],
        'points':   profile.points,
    })