from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from brightmind.ai_service import ask_claude
import random

STORY_THEMES = [
    "forest adventure", "space explorer",
    "underwater kingdom", "magic school",
    "brave village child", "dinosaur world",
    "superhero city", "fairy tale kingdom",
    "pirate treasure", "time travel",
    "animal safari", "robot factory",
]

LANG_STYLE_EXAMPLES = {
    "tamil":     "எழுது இப்படி: 'ஒரு ஊர்ல ஒரு பையன் இருந்தான்டா! அவன் ரொம்ப தைரியசாலி. ஒரு நாள் காட்டுக்கு போனான். திடீர்னு ஒரு சிங்கம் வந்துச்சு! ஆனா அவன் பயப்படல. கடைசில அவன் வெற்றி பெற்றான்டா!'",
    "hindi":     "Aise likho: 'Ek baar ek ladka tha yaar! Wo bahut brave tha. Ek din wo jungle gaya. Achanak ek sher aa gaya! Par wo dara nahi. Aakhir mein uski jeet hui!'",
    "telugu":    "ఇలా రాయి: 'ఒక ఊర్లో ఒక అబ్బాయి ఉండేవాడు రా! అతను చాలా ధైర్యంగా ఉండేవాడు. చివరకు అతను గెలిచాడు!'",
    "kannada":   "ಹೀಗೆ ಬರೆ: 'ಒಂದು ಊರಲ್ಲಿ ಒಂದು ಹುಡುಗ ಇದ್ದ ಕಣೋ! ಕೊನೆಗೆ ಅವನು ಗೆದ್ದ!'",
    "malayalam": "ഇങ്ങനെ എഴുതൂ: 'ഒരു ഗ്രാമത്തിൽ ഒരു കുട്ടി ഉണ്ടായിരുന്നു! അവസാനം അവൻ ജയിച്ചു!'",
    "bengali":   "এভাবে লেখো: 'একটা গ্রামে একটা ছেলে থাকত! শেষে সে জিতল!'",
    "english":   "Write like this: 'Once there was a brave kid! One day he went to the forest. Suddenly a lion appeared! But he was not scared. In the end he won!' Use fun simple exciting words.",
    "french":    "Ecris comme ca: 'Il etait une fois un enfant courageux! A la fin il gagna!'",
    "spanish":   "Escribe asi: 'Habia una vez un nino valiente! Al final gano!'",
    "arabic":    "اكتب هكذا: 'كان يا ما كان ولد شجاع! في النهاية انتصر!'",
    "chinese":   "这样写：'从前有个勇敢的小朋友！最后他赢了！'",
    "japanese":  "こんなふうに書いて：'むかしむかし、勇敢な子がいたんだよ！最後に勝ったんだよ！'",
    "korean":    "이렇게 써: '옛날에 용감한 아이가 있었어요! 마지막에 이겼어요!'",
}

def get_lang_style(language):
    return LANG_STYLE_EXAMPLES.get(
        language,
        "Write in very simple natural spoken words children use daily. Short fun sentences."
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_themes(request):
    return Response({'themes': STORY_THEMES})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_story(request):
    try:
        theme      = request.data.get('theme', 'forest adventure')
        profile    = request.user.child_profile
        language   = request.data.get('language', profile.language)
        age        = profile.age
        seed       = random.randint(1000, 9999)
        lang_style = get_lang_style(language)

        prompt = f"""Write a COMPLETE short story #{seed} about '{theme}' for a {age}-year-old child.

RULES:
- {lang_style}
- Write ONLY in {language}. No mixing with other languages.
- Write a FULL story with beginning, middle, and happy ending.
- Story must be 12-15 sentences long.
- Use simple short sentences a child can easily read.
- Make it fun, exciting and adventurous.
- End with a happy ending and one simple moral lesson.
- Do NOT give any choices A) B) C). Just tell the complete story.
- Add "🌟 THE END 🌟" on the last line."""

        result = ask_claude(prompt, language=language, age=age, mode="story")
        profile.points += 5
        profile.save()

        return Response({
            'story':    result['reply'],
            'theme':    theme,
            'language': language,
            'points':   profile.points,
        })

    except Exception as e:
        import traceback
        print("START STORY ERROR:", traceback.format_exc())
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def continue_story(request):
    return Response({'story': '', 'points': 0, 'language': 'english', 'is_final': True})