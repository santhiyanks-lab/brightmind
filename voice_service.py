import whisper
import os
import uuid
import time
from gtts import gTTS
from pathlib import Path
from django.conf import settings

# Cross-platform ffmpeg path
if os.name == 'nt':  # Windows
    ffmpeg_path = r"C:\Users\santh\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"
    if os.path.exists(ffmpeg_path):
        os.environ["PATH"] += os.pathsep + str(Path(ffmpeg_path).parent)

print("⏳ Loading Whisper model...")
whisper_model = whisper.load_model("base")
print("✅ Whisper model loaded!")

LANGUAGE_CODES = {
    # Indian languages
    "tamil":      {"whisper": "ta", "gtts": "ta"},
    "english":    {"whisper": "en", "gtts": "en"},
    "hindi":      {"whisper": "hi", "gtts": "hi"},
    "malayalam":  {"whisper": "ml", "gtts": "ml"},
    "telugu":     {"whisper": "te", "gtts": "te"},
    "kannada":    {"whisper": "kn", "gtts": "kn"},
    "bengali":    {"whisper": "bn", "gtts": "bn"},
    "marathi":    {"whisper": "mr", "gtts": "mr"},
    "gujarati":   {"whisper": "gu", "gtts": "gu"},
    "punjabi":    {"whisper": "pa", "gtts": "pa"},
    "urdu":       {"whisper": "ur", "gtts": "ur"},
    "odia":       {"whisper": "or", "gtts": "or"},
    "assamese":   {"whisper": "as", "gtts": "as"},
    "nepali":     {"whisper": "ne", "gtts": "ne"},
    "sinhala":    {"whisper": "si", "gtts": "si"},

    # European
    "spanish":    {"whisper": "es", "gtts": "es"},
    "french":     {"whisper": "fr", "gtts": "fr"},
    "german":     {"whisper": "de", "gtts": "de"},
    "italian":    {"whisper": "it", "gtts": "it"},
    "portuguese": {"whisper": "pt", "gtts": "pt"},
    "dutch":      {"whisper": "nl", "gtts": "nl"},
    "russian":    {"whisper": "ru", "gtts": "ru"},
    "polish":     {"whisper": "pl", "gtts": "pl"},
    "ukrainian":  {"whisper": "uk", "gtts": "uk"},
    "greek":      {"whisper": "el", "gtts": "el"},
    "swedish":    {"whisper": "sv", "gtts": "sv"},
    "turkish":    {"whisper": "tr", "gtts": "tr"},
    "romanian":   {"whisper": "ro", "gtts": "ro"},
    "czech":      {"whisper": "cs", "gtts": "cs"},
    "hungarian":  {"whisper": "hu", "gtts": "hu"},
    "danish":     {"whisper": "da", "gtts": "da"},
    "finnish":    {"whisper": "fi", "gtts": "fi"},
    "norwegian":  {"whisper": "no", "gtts": "no"},

    # East Asian
    "chinese":    {"whisper": "zh", "gtts": "zh-CN"},
    "japanese":   {"whisper": "ja", "gtts": "ja"},
    "korean":     {"whisper": "ko", "gtts": "ko"},

    # Southeast Asian
    "vietnamese": {"whisper": "vi", "gtts": "vi"},
    "thai":       {"whisper": "th", "gtts": "th"},
    "indonesian": {"whisper": "id", "gtts": "id"},
    "malay":      {"whisper": "ms", "gtts": "ms"},
    "filipino":   {"whisper": "tl", "gtts": "tl"},

    # Middle Eastern / African
    "arabic":     {"whisper": "ar", "gtts": "ar"},
    "hebrew":     {"whisper": "he", "gtts": "iw"},
    "persian":    {"whisper": "fa", "gtts": "fa"},
    "swahili":    {"whisper": "sw", "gtts": "sw"},
    "afrikaans":  {"whisper": "af", "gtts": "af"},
}

# Reverse lookup: whisper code -> our language name (built once at import time)
WHISPER_CODE_TO_NAME = {
    codes["whisper"]: name for name, codes in LANGUAGE_CODES.items()
}


def speech_to_text(audio_file_path: str, language: str = None) -> dict:
    """
    Transcribes audio to text.

    If `language` is provided AND is a known language name, it's passed to
    Whisper as a hint (slightly faster, slightly more accurate for short clips).
    If `language` is None (recommended for "reply in whatever I speak" behavior),
    Whisper auto-detects the spoken language from the audio itself.

    Returns:
        {
            "text": "<transcribed text>",
            "language": "<detected/used language name, e.g. 'korean'>"
        }
    """
    lang_code = None
    if language:
        lang_code = LANGUAGE_CODES.get(language, {}).get("whisper")

    try:
        result = whisper_model.transcribe(
            audio_file_path,
            language=lang_code,  # None => Whisper auto-detects
            fp16=False,
            temperature=0,
        )
        text = result["text"].strip()
        detected_whisper_code = result.get("language", "en")
        detected_language = WHISPER_CODE_TO_NAME.get(detected_whisper_code, "english")

        print(f"🎤 Whisper transcribed [{detected_language}]: {text}")
        return {"text": text, "language": detected_language}

    except Exception as e:
        print(f"❌ Whisper error: {e}")
        return {"text": "", "language": "english"}


def text_to_speech(text: str, language: str = "english") -> str:
    lang_code = LANGUAGE_CODES.get(language, {}).get("gtts", "en")
    audio_dir = Path(settings.MEDIA_ROOT) / "voice_replies"
    audio_dir.mkdir(parents=True, exist_ok=True)

    filename = f"reply_{uuid.uuid4().hex[:8]}.mp3"
    audio_path = audio_dir / filename

    try:
        tts = gTTS(text=text, lang=lang_code, slow=False)
        tts.save(str(audio_path))
        print(f"🔊 gTTS saved [{language}]: {filename}")

        # Return just the relative path — frontend prepends AUDIO_BASE_URL
        return f"/media/voice_replies/{filename}"
    except Exception as e:
        print(f"❌ gTTS error: {e}")
        return ""


def cleanup_old_audio():
    audio_dir = Path(settings.MEDIA_ROOT) / "voice_replies"
    if not audio_dir.exists():
        return
    now = time.time()
    for f in audio_dir.iterdir():
        if now - f.stat().st_mtime > 3600:
            f.unlink()
            print(f"🗑 Deleted old audio: {f.name}")