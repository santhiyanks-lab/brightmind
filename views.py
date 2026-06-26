from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from brightmind.ai_service import ask_claude

SUBJECTS = ['tamil', 'english', 'maths', 'science', 'social_science']

SUBJECT_PROMPTS = {
    'tamil':         "Ask a Tamil language question (grammar, vocabulary, or fill in the blank).",
    'english':       "Ask a simple English language question (spelling, grammar, or meaning).",
    'maths':         "Ask a maths question (addition, subtraction, multiplication, or simple word problem).",
    'science':       "Ask a fun science question about nature, animals, plants, or the human body.",
    'social_science': "Ask a question about Tamil Nadu, India, maps, or famous people in history.",
}

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_question(request):
    """Generate one quiz question for chosen subject and difficulty."""
    subject    = request.data.get('subject', 'maths')
    difficulty = request.data.get('difficulty', 'easy')  # easy/medium/hard
    profile    = request.user.child_profile

    if subject not in SUBJECTS:
        return Response({'error': 'Invalid subject'}, status=400)

    prompt = f"""{SUBJECT_PROMPTS[subject]}
Difficulty level: {difficulty}.
Child age: {profile.age}.
Format your response as:
QUESTION: (the question)
OPTIONS: A) ... B) ... C) ... D) ...
ANSWER: (correct option letter)
EXPLANATION: (one simple sentence why)"""

    result = ask_claude(prompt, language=profile.language,
                        age=profile.age, mode="quiz")
    return Response({
        'question':   result['reply'],
        'subject':    subject,
        'difficulty': difficulty,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_answer(request):
    """Child submits answer — AI evaluates and encourages."""
    question       = request.data.get('question', '')
    child_answer   = request.data.get('answer', '')
    profile        = request.user.child_profile

    prompt = f"""Question was: {question}
Child answered: {child_answer}
Tell if correct or wrong. If wrong explain simply. Be very encouraging and kind.
Award 'CORRECT' or 'WRONG' at the start of your reply."""

    result = ask_claude(prompt, language=profile.language,
                        age=profile.age, mode="quiz")

    is_correct = result['reply'].startswith('CORRECT')
    if is_correct:
        profile.points += 10
        profile.save()

    return Response({
        'feedback':   result['reply'],
        'is_correct': is_correct,
        'points':     profile.points,
    })