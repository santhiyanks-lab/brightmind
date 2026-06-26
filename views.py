from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.conf import settings
from pathlib import Path
import uuid

from brightmind.ai_service import ask_claude
from brightmind.voice_service import speech_to_text, text_to_speech, cleanup_old_audio
from chat.models import ChatSession, ChatMessage
from django.utils import timezone


# Map frontend lang codes to full language names used in ai_service
# (still used as an optional HINT to Whisper if the frontend explicitly
# tells us the language — e.g. a manual language picker in the UI)
LANG_CODE_MAP = {
    'en': 'english',
    'hi': 'hindi',
    'ta': 'tamil',
    'te': 'telugu',
    'kn': 'kannada',
    'ml': 'malayalam',
    'bn': 'bengali',
    'mr': 'marathi',
    'gu': 'gujarati',
    'pa': 'punjabi',
}


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def voice_chat(request):
    if not request.user.is_child():
        return Response({'error': 'Only children can use voice chat'}, status=403)

    audio_file = request.FILES.get('audio')
    if not audio_file:
        return Response({'error': 'No audio file received'}, status=400)

    profile = request.user.child_profile
    age = profile.age

    # ── Optional language HINT from request (e.g. manual picker in UI) ──
    # This is NOT forced — it's only passed to Whisper as a hint if present.
    # If the child speaks a different language than this hint, Whisper will
    # still auto-detect correctly; the hint just speeds up/refines recognition
    # when you already know the language for certain.
    lang_code = request.data.get('lang', '')
    lang_hint = LANG_CODE_MAP.get(lang_code)  # None if not provided/unknown

    # ── Step 1: Save uploaded audio temporarily ──
    ext = Path(audio_file.name).suffix or '.webm'
    temp_name = f"temp_{uuid.uuid4().hex[:8]}{ext}"
    temp_dir = Path(settings.MEDIA_ROOT) / "temp_audio"
    temp_dir.mkdir(parents=True, exist_ok=True)
    temp_path = temp_dir / temp_name

    try:
        with open(temp_path, 'wb+') as dest:
            for chunk in audio_file.chunks():
                dest.write(chunk)

        # ── Step 2: Speech to Text (auto-detects language from audio) ──
        stt_result = speech_to_text(str(temp_path), language=lang_hint)
        child_text = stt_result['text']
        language = stt_result['language']  # <-- the ACTUAL spoken language
    finally:
        temp_path.unlink(missing_ok=True)

    if not child_text:
        return Response({
            'error': 'Could not understand the audio. Please speak clearly and try again.'
        }, status=400)

    # ── Step 3: Get or create today's session + prepare history ──
    today = timezone.now().date()
    session, _ = ChatSession.objects.get_or_create(
        child=request.user,
        created_at__date=today
    )

    prev_messages = ChatMessage.objects.filter(session=session).order_by('-created_at')[:6]
    history = [
        {
            "role": "user" if msg.sender == "child" else "assistant",
            "content": msg.text
        }
        for msg in reversed(list(prev_messages))
    ]

    # ── Step 4: Generate AI response IN THE DETECTED LANGUAGE ──
    result = ask_claude(
        child_text,
        language=language,   # whatever the child actually spoke
        age=age,
        mode="chat",
        history=history
    )
    ai_reply = result.get('reply', '')

    if not ai_reply:
        return Response({'error': 'AI failed to generate a response'}, status=500)

    # ── Step 5: Text to Speech IN THE DETECTED LANGUAGE ──
    try:
        audio_url = text_to_speech(ai_reply, language=language)
    except Exception as e:
        print(f"TTS error: {e}")
        audio_url = None

    # ── Step 6: Save messages + award points ──
    ChatMessage.objects.create(
        session=session,
        sender='child',
        text=child_text,
        is_safe=result.get('safe', True)
    )
    ChatMessage.objects.create(
        session=session,
        sender='ai',
        text=ai_reply,
        is_safe=True
    )

    profile.points += 3
    profile.save()

    cleanup_old_audio()

    return Response({
        'transcript': child_text,   # ✅ matches frontend res.data.transcript
        'reply': ai_reply,          # ✅ matches frontend res.data.reply
        'audio_url': audio_url,     # ✅ matches frontend res.data.audio_url
        'language': language,       # ✅ now reflects ACTUAL detected language
        'points': profile.points,
    })