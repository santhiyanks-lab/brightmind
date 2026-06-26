from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from brightmind.ai_service import ask_claude

QUIZ_TOPICS = [
    "animals", "plants", "space", "math",
    "history", "geography", "science", "sports",
]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_topics(request):
    """Return available quiz topics."""
    return Response({'topics': QUIZ_TOPICS})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_quiz(request):
    """AI starts a quiz on a chosen topic."""
    topic   = request.data.get('topic', 'animals')
    profile = request.user.child_profile
    language = profile.language
    age      = profile.age

    prompt = f"Ask me one fun and simple {topic} quiz question suitable for a {age}-year-old child. Give 4 multiple choice options (A, B, C, D). Do not reveal the answer yet."

    result = ask_claude(prompt, language=language, age=age, mode="quiz")
    return Response({
        'question': result['reply'],
        'topic':    topic,
        'language': language,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def answer_quiz(request):
    """Child answers — AI checks and gives next question."""
    answer       = request.data.get('answer', '')
    history      = request.data.get('history', [])
    profile      = request.user.child_profile

    prompt = f"The child answered: '{answer}'. Tell them if it is correct or wrong with a kind explanation. Then ask a new fun quiz question with 4 choices."

    result = ask_claude(
        prompt,
        language=profile.language,
        age=profile.age,
        mode="quiz",
        history=history,
    )

    # Reward points for answering
    profile.points += 3
    profile.save()

    return Response({
        'reply':  result['reply'],
        'points': profile.points,
    })