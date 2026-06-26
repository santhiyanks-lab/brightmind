from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from google.api_core.exceptions import ResourceExhausted
from .models import ChatSession, ChatMessage
from brightmind.ai_service import ask_claude
from brightmind.voice_service import speech_to_text, text_to_speech
import os
import tempfile

LANG_CODE_MAP = {
    'en': 'english', 'hi': 'hindi', 'ta': 'tamil', 'te': 'telugu',
    'kn': 'kannada', 'ml': 'malayalam', 'bn': 'bengali', 'mr': 'marathi',
    'gu': 'gujarati', 'pa': 'punjabi', 'ur': 'urdu', 'or': 'odia',
    'as': 'assamese', 'ne': 'nepali', 'si': 'sinhala',
    'es': 'spanish', 'fr': 'french', 'de': 'german', 'it': 'italian',
    'pt': 'portuguese', 'nl': 'dutch', 'ru': 'russian', 'pl': 'polish',
    'uk': 'ukrainian', 'el': 'greek', 'sv': 'swedish', 'tr': 'turkish',
    'ro': 'romanian', 'cs': 'czech', 'hu': 'hungarian', 'da': 'danish',
    'fi': 'finnish', 'no': 'norwegian',
    'zh': 'chinese', 'ja': 'japanese', 'ko': 'korean',
    'vi': 'vietnamese', 'th': 'thai', 'id': 'indonesian', 'ms': 'malay',
    'tl': 'filipino',
    'ar': 'arabic', 'he': 'hebrew', 'fa': 'persian', 'sw': 'swahili',
    'af': 'afrikaans',
}

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat(request):
    user    = request.user
    message = request.data.get('message', '').strip()
    if not message:
        return Response({'error': 'Message is empty'}, status=400)
    if not user.is_child():
        return Response({'error': 'Only children can use chat'}, status=403)
    profile  = user.child_profile
    language = profile.language
    age      = profile.age
    session, _ = ChatSession.objects.get_or_create(
        child=user,
        created_at__date=timezone.now().date()
    )
    prev = ChatMessage.objects.filter(session=session).order_by('-created_at')[:10]
    history = [
        {"role": "user" if m.sender == "child" else "assistant",
         "content": m.text}
        for m in reversed(prev)
    ]
    try:
        result = ask_claude(message, language=language, age=age,
                            mode="chat", history=history)
    except ResourceExhausted:
        return Response(
            {'error': 'AI service is busy right now. Please try again in a few minutes.'},
            status=429
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=500
        )
    ChatMessage.objects.create(session=session, sender='child',
                               text=message, is_safe=result['safe'])
    ChatMessage.objects.create(session=session, sender='ai',
                               text=result['reply'], is_safe=True)
    profile.points += 2
    profile.save()
    return Response({
        'reply':    result['reply'],
        'language': language,
        'points':   profile.points,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def voice_chat(request):
    user = request.user
    if not user.is_child():
        return Response({'error': 'Only children can use chat'}, status=403)

    audio_file = request.FILES.get('audio')
    if not audio_file:
        return Response({'error': 'No audio file provided'}, status=400)

    profile = user.child_profile
    age     = profile.age

    # ── Optional language HINT (e.g. manual picker in UI) ──
    # NOT forced on Whisper — only used as a hint if explicitly provided.
    lang_code = request.data.get('lang', '')
    lang_hint = LANG_CODE_MAP.get(lang_code)  # None if not provided/unknown

    suffix = os.path.splitext(audio_file.name)[1] or '.m4a'
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            for chunk in audio_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        # ── Speech to Text: auto-detects the spoken language ──
        stt_result = speech_to_text(tmp_path, language=lang_hint)
        transcript = stt_result['text']
        language   = stt_result['language']  # <-- ACTUAL spoken language
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

    if not transcript:
        return Response({'error': 'Could not transcribe audio. Please try again.'}, status=400)

    session, _ = ChatSession.objects.get_or_create(
        child=user,
        created_at__date=timezone.now().date()
    )
    prev = ChatMessage.objects.filter(session=session).order_by('-created_at')[:10]
    history = [
        {"role": "user" if m.sender == "child" else "assistant",
         "content": m.text}
        for m in reversed(prev)
    ]

    try:
        result = ask_claude(transcript, language=language, age=age,
                            mode="chat", history=history)
    except ResourceExhausted:
        return Response(
            {'error': 'AI service is busy right now. Please try again in a few minutes.'},
            status=429
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=500
        )

    ChatMessage.objects.create(session=session, sender='child',
                               text=transcript, is_safe=result['safe'])
    ChatMessage.objects.create(session=session, sender='ai',
                               text=result['reply'], is_safe=True)

    profile.points += 2
    profile.save()

    # ── Text to Speech: reply IN THE DETECTED LANGUAGE ──
    try:
        audio_url = text_to_speech(result['reply'], language=language)
    except Exception as e:
        print(f"TTS error: {e}")
        audio_url = None

    return Response({
        'transcript': transcript,
        'reply':      result['reply'],
        'audio_url':  audio_url,
        'language':   language,   # ✅ now reflects ACTUAL detected language
        'points':     profile.points,
    })