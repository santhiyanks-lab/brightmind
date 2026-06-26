from groq import Groq
import os

client = Groq(api_key=os.environ["GROQ_API_KEY"])

MODEL = "llama-3.3-70b-versatile"  # Free, fast, 14400 requests/day

BAD_WORDS = [
    "violence", "kill", "hate", "drug", "alcohol",
    "sex", "porn", "nude", "murder", "suicide",
    "à®µà®©à¯à®®à¯à®±à¯ˆ", "à®•à¯Šà®²à¯", "à®®à®¤à¯",
]

def is_safe(text: str) -> bool:
    text_lower = text.lower()
    return not any(word in text_lower for word in BAD_WORDS)


LANGUAGE_INSTRUCTIONS = {
    # Indian languages
    "tamil":      "Always reply in Tamil (à®¤à®®à®¿à®´à¯). Use simple Tamil words a child understands.",
    "hindi":      "Always reply in simple Hindi (à¤¹à¤¿à¤¨à¥à¤¦à¥€) a child understands.",
    "telugu":     "Always reply in simple Telugu (à°¤à±†à°²à±à°—à±) a child understands.",
    "kannada":    "Always reply in simple Kannada (à²•à²¨à³à²¨à²¡) a child understands.",
    "malayalam":  "Always reply in simple Malayalam (à´®à´²à´¯à´¾à´³à´‚) a child understands.",
    "bengali":    "Always reply in simple Bengali (à¦¬à¦¾à¦‚à¦²à¦¾) a child understands.",
    "marathi":    "Always reply in simple Marathi (à¤®à¤°à¤¾à¤ à¥€) a child understands.",
    "gujarati":   "Always reply in simple Gujarati (àª—à«àªœàª°àª¾àª¤à«€) a child understands.",
    "punjabi":    "Always reply in simple Punjabi (à¨ªà©°à¨œà¨¾à¨¬à©€) a child understands.",
    "odia":       "Always reply in simple Odia (à¬“à¬¡à¬¼à¬¿à¬†) a child understands.",
    "urdu":       "Always reply in simple Urdu (Ø§Ø±Ø¯Ùˆ) a child understands.",
    "assamese":   "Always reply in simple Assamese (à¦…à¦¸à¦®à§€à¦¯à¦¼à¦¾) a child understands.",
    "sanskrit":   "Always reply in simple Sanskrit (à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤) a child understands.",
    "konkani":    "Always reply in simple Konkani a child understands.",
    "manipuri":   "Always reply in simple Manipuri (à¦®à¦£à¦¿à¦ªà§à¦°à§€) a child understands.",
    "nepali":     "Always reply in simple Nepali (à¤¨à¥‡à¤ªà¤¾à¤²à¥€) a child understands.",
    "sinhala":    "Always reply in simple Sinhala (à·ƒà·’à¶‚à·„à¶½) a child understands.",

    # European languages
    "english":    "Always reply in simple English suitable for a child.",
    "french":     "Always reply in simple French (FranÃ§ais) a child understands.",
    "spanish":    "Always reply in simple Spanish (EspaÃ±ol) a child understands.",
    "portuguese": "Always reply in simple Portuguese (PortuguÃªs) a child understands.",
    "german":     "Always reply in simple German (Deutsch) a child understands.",
    "italian":    "Always reply in simple Italian (Italiano) a child understands.",
    "dutch":      "Always reply in simple Dutch (Nederlands) a child understands.",
    "greek":      "Always reply in simple Greek (Î•Î»Î»Î·Î½Î¹ÎºÎ¬) a child understands.",
    "russian":    "Always reply in simple Russian (Ð ÑƒÑÑÐºÐ¸Ð¹) a child understands.",
    "polish":     "Always reply in simple Polish (Polski) a child understands.",
    "ukrainian":  "Always reply in simple Ukrainian (Ð£ÐºÑ€Ð°Ñ—Ð½ÑÑŒÐºÐ°) a child understands.",
    "swedish":    "Always reply in simple Swedish (Svenska) a child understands.",
    "norwegian":  "Always reply in simple Norwegian (Norsk) a child understands.",
    "danish":     "Always reply in simple Danish (Dansk) a child understands.",
    "finnish":    "Always reply in simple Finnish (Suomi) a child understands.",
    "czech":      "Always reply in simple Czech (ÄŒeÅ¡tina) a child understands.",
    "romanian":   "Always reply in simple Romanian (RomÃ¢nÄƒ) a child understands.",
    "hungarian":  "Always reply in simple Hungarian (Magyar) a child understands.",

    # Asian languages
    "chinese":    "Always reply in simple Mandarin Chinese (ä¸­æ–‡) a child understands.",
    "japanese":   "Always reply in simple Japanese (æ—¥æœ¬èªž) a child understands.",
    "korean":     "Always reply in simple Korean (í•œêµ­ì–´) a child understands.",
    "vietnamese": "Always reply in simple Vietnamese (Tiáº¿ng Viá»‡t) a child understands.",
    "thai":       "Always reply in simple Thai (à¸ à¸²à¸©à¸²à¹„à¸—à¸¢) a child understands.",
    "indonesian": "Always reply in simple Indonesian (Bahasa Indonesia) a child understands.",
    "malay":      "Always reply in simple Malay (Bahasa Melayu) a child understands.",
    "filipino":   "Always reply in simple Filipino (Tagalog) a child understands.",
    "burmese":    "Always reply in simple Burmese (á€™á€¼á€”á€ºá€™á€¬á€˜á€¬á€žá€¬) a child understands.",
    "khmer":      "Always reply in simple Khmer (áž—áž¶ážŸáž¶ážáŸ’áž˜áŸ‚ážš) a child understands.",

    # Middle Eastern & African languages
    "arabic":     "Always reply in simple Arabic (Ø¹Ø±Ø¨ÙŠ) a child understands.",
    "persian":    "Always reply in simple Persian/Farsi (ÙØ§Ø±Ø³ÛŒ) a child understands.",
    "turkish":    "Always reply in simple Turkish (TÃ¼rkÃ§e) a child understands.",
    "hebrew":     "Always reply in simple Hebrew (×¢×‘×¨×™×ª) a child understands.",
    "swahili":    "Always reply in simple Swahili a child understands.",
    "amharic":    "Always reply in simple Amharic (áŠ áˆ›áˆ­áŠ›) a child understands.",
    "hausa":      "Always reply in simple Hausa a child understands.",
    "yoruba":     "Always reply in simple Yoruba a child understands.",
    "zulu":       "Always reply in simple Zulu a child understands.",
}

UNSAFE_REPLIES = {
    "tamil":      "à®…à®¨à¯à®¤ à®µà®¿à®·à®¯à®®à¯ à®ªà®±à¯à®±à®¿ à®ªà¯‡à®š à®µà¯‡à®£à¯à®Ÿà®¾à®®à¯. à®µà¯‡à®± à®à®¤à®¾à®µà®¤à¯ à®•à¯‡à®³à¯à®™à¯à®•! ðŸ˜Š",
    "hindi":      "à¤šà¤²à¥‹ à¤•à¥à¤› à¤”à¤° à¤¬à¤¾à¤¤ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚! ðŸ˜Š",
    "telugu":     "à°¦à°¾à°¨à°¿ à°—à±à°°à°¿à°‚à°šà°¿ à°®à°¾à°Ÿà±à°²à°¾à°¡à°µà°¦à±à°¦à±. à°µà±‡à°°à±‡ à°à°¦à±ˆà°¨à°¾ à°…à°¡à°—à°‚à°¡à°¿! ðŸ˜Š",
    "kannada":    "à²…à²¦à²° à²¬à²—à³à²—à³† à²®à²¾à²¤à²¾à²¡à²¬à³‡à²¡. à²¬à³‡à²°à³† à²à²¨à²¾à²¦à²°à³‚ à²•à³‡à²³à³! ðŸ˜Š",
    "malayalam":  "à´…à´¤à´¿à´¨àµ† à´ªà´±àµà´±à´¿ à´¸à´‚à´¸à´¾à´°à´¿à´•àµà´•àµ‡à´£àµà´Ÿ. à´®à´±àµà´±àµ†à´¨àµà´¤àµ†à´™àµà´•à´¿à´²àµà´‚ à´šàµ‹à´¦à´¿à´•àµà´•àµ‚! ðŸ˜Š",
    "bengali":    "à¦à¦Ÿà¦¾ à¦¨à¦¿à¦¯à¦¼à§‡ à¦•à¦¥à¦¾ à¦¬à¦²à¦¬ à¦¨à¦¾à¥¤ à¦…à¦¨à§à¦¯ à¦•à¦¿à¦›à§ à¦œà¦¿à¦œà§à¦žà§‡à¦¸ à¦•à¦°à§‹! ðŸ˜Š",
    "marathi":    "à¤¤à¥à¤¯à¤¾à¤¬à¤¦à¥à¤¦à¤² à¤¬à¥‹à¤²à¥‚ à¤¨à¤•à¥‹à¤¸. à¤¦à¥à¤¸à¤°à¤‚ à¤•à¤¾à¤¹à¥€ à¤µà¤¿à¤šà¤¾à¤°! ðŸ˜Š",
    "gujarati":   "àªšàª¾àª²à«‹ àª¬à«€àªœà«€ àªµàª¾àª¤ àª•àª°à«€àª! ðŸ˜Š",
    "punjabi":    "à¨‡à¨¸ à¨¬à¨¾à¨°à©‡ à¨—à©±à¨² à¨¨à¨¾ à¨•à¨°à©€à¨à¥¤ à¨•à©à¨ à¨¹à©‹à¨° à¨ªà©à©±à¨›à©‹! ðŸ˜Š",
    "urdu":       "Ø¢Ø¦ÛŒÚº Ú©Ú†Ú¾ Ø§ÙˆØ± Ø¨Ø§Øª Ú©Ø±ÛŒÚº! ðŸ˜Š",
    "english":    "Let's not talk about that. Ask me something fun! ðŸ˜Š",
    "french":     "Ne parlons pas de Ã§a. Demande-moi autre chose! ðŸ˜Š",
    "spanish":    "No hablemos de eso. Â¡PregÃºntame algo divertido! ðŸ˜Š",
    "portuguese": "NÃ£o vamos falar sobre isso. Pergunte-me outra coisa! ðŸ˜Š",
    "german":     "Lass uns nicht darÃ¼ber sprechen. Frag mich etwas anderes! ðŸ˜Š",
    "italian":    "Non parliamo di questo. Chiedimi qualcos'altro! ðŸ˜Š",
    "arabic":     "Ù„Ø§ Ù†ØªØ­Ø¯Ø« Ø¹Ù† Ù‡Ø°Ø§. Ø§Ø³Ø£Ù„Ù†ÙŠ Ø´ÙŠØ¦Ø§Ù‹ Ù…Ù…ØªØ¹Ø§Ù‹! ðŸ˜Š",
    "chinese":    "æˆ‘ä»¬ä¸è¦è°ˆè¿™ä¸ªã€‚é—®æˆ‘ä¸€äº›æœ‰è¶£çš„äº‹æƒ…å§ï¼ðŸ˜Š",
    "japanese":   "ãã‚Œã«ã¤ã„ã¦ã¯è©±ã•ãªã„ã‚ˆã†ã«ã—ã¾ã—ã‚‡ã†ã€‚ä»–ã®ã“ã¨ã‚’èžã„ã¦ã­ï¼ðŸ˜Š",
    "korean":     "ê·¸ê²ƒì— ëŒ€í•´ ì´ì•¼ê¸°í•˜ì§€ ë§ì•„ìš”. ë‹¤ë¥¸ ê²ƒì„ ë¬¼ì–´ë´ìš”! ðŸ˜Š",
    "turkish":    "Bunu konuÅŸmayalÄ±m. Bana baÅŸka bir ÅŸey sor! ðŸ˜Š",
    "russian":    "Ð”Ð°Ð²Ð°Ð¹ Ð½Ðµ Ð±ÑƒÐ´ÐµÐ¼ Ð¾Ð± ÑÑ‚Ð¾Ð¼ Ð³Ð¾Ð²Ð¾Ñ€Ð¸Ñ‚ÑŒ. Ð¡Ð¿Ñ€Ð¾ÑÐ¸ Ð¼ÐµÐ½Ñ Ð¾ Ñ‡Ñ‘Ð¼-Ð½Ð¸Ð±ÑƒÐ´ÑŒ Ð´Ñ€ÑƒÐ³Ð¾Ð¼! ðŸ˜Š",
    "swahili":    "Tusiongee kuhusu hilo. Niulize kitu kingine! ðŸ˜Š",
}

AI_UNSAFE_REPLIES = {
    "tamil":      "à®®à®©à¯à®©à®¿à®•à¯à®•à®µà¯à®®à¯! à®…à®¤à¯ˆ à®šà¯Šà®²à¯à®² à®®à¯à®Ÿà®¿à®¯à®¾à®¤à¯. à®µà¯‡à®± à®•à¯‡à®³à¯à®™à¯à®•! ðŸ˜Š",
    "english":    "Oops! I cannot say that. Ask me something else! ðŸ˜Š",
    "hindi":      "à¤®à¤¾à¤« à¤•à¤°à¤¨à¤¾! à¤®à¥ˆà¤‚ à¤µà¥‹ à¤¨à¤¹à¥€à¤‚ à¤•à¤¹ à¤¸à¤•à¤¤à¤¾à¥¤ à¤•à¥à¤› à¤”à¤° à¤ªà¥‚à¤›à¥‹! ðŸ˜Š",
    "french":     "Oups! Je ne peux pas dire Ã§a. Demande-moi autre chose! ðŸ˜Š",
    "spanish":    "Â¡Ups! No puedo decir eso. Â¡PregÃºntame algo mÃ¡s! ðŸ˜Š",
    "arabic":     "Ø¹Ø°Ø±Ø§Ù‹! Ù„Ø§ Ø£Ø³ØªØ·ÙŠØ¹ Ù‚ÙˆÙ„ Ø°Ù„Ùƒ. Ø§Ø³Ø£Ù„Ù†ÙŠ Ø´ÙŠØ¦Ø§Ù‹ Ø¢Ø®Ø±! ðŸ˜Š",
    "chinese":    "å“Žå‘€ï¼æˆ‘ä¸èƒ½è¯´é‚£ä¸ªã€‚é—®æˆ‘åˆ«çš„å§ï¼ðŸ˜Š",
    "japanese":   "ã”ã‚ã‚“ãªã•ã„ï¼ãã‚Œã¯è¨€ãˆã¾ã›ã‚“ã€‚ä»–ã®ã“ã¨ã‚’èžã„ã¦ã­ï¼ðŸ˜Š",
    "korean":     "ì´ëŸ°! ê·¸ê±´ ë§í•  ìˆ˜ ì—†ì–´ìš”. ë‹¤ë¥¸ ê²ƒì„ ë¬¼ì–´ë´ìš”! ðŸ˜Š",
}


def get_system_prompt(language: str, age: int, mode: str) -> str:
    lang_instruction = LANGUAGE_INSTRUCTIONS.get(
        language, "Reply in the same language the child uses."
    )

    base = f"""You are BrightMind, a friendly AI companion for children aged {age}.

STRICT RULES â€” never break these:
1. {lang_instruction}
2. Never use violence, adult content, scary topics, or bad words.
3. Never act like a YouTube influencer. No hype, no "smash like", no "subscribe".
4. Be calm, kind, encouraging, and honest.
5. If a child asks something unsafe or inappropriate, gently redirect them.
6. Keep sentences short and easy to understand.
7. After 30 minutes remind the child to take a break and play outside.
8. Never share personal information or ask for it.
"""

    mode_prompts = {
        "chat":    "You are having a friendly conversation. Answer questions, tell fun facts, and be a good friend.",
        "story":   "You are a storyteller. Create fun, imaginative, age-appropriate stories. Ask the child what happens next to make it interactive.",
        "quiz":    "You are a fun teacher. Ask one question at a time. Give encouragement for correct answers. Gently explain wrong answers.",
        "outdoor": "Suggest fun, safe outdoor activities. Give step-by-step instructions. Encourage the child to go outside and enjoy nature.",
    }

    return base + "\n" + mode_prompts.get(mode, mode_prompts["chat"])


def ask_claude(
    message: str,
    language: str = "english",
    age: int = 10,
    mode: str = "chat",
    history: list = None,
) -> dict:
    if not is_safe(message):
        safe_reply = UNSAFE_REPLIES.get(language, "Let's talk about something nicer! ðŸ˜Š")
        return {"reply": safe_reply, "safe": False}

    # Build conversation history
    messages = []
    if history:
        for msg in history:
            role = "user" if msg["role"] == "user" else "assistant"
            messages.append({"role": role, "content": msg["content"]})

    # Add current message
    messages.append({"role": "user", "content": message})

    # Call Groq
    system_prompt = get_system_prompt(language, age, mode)
    messages.insert(0, {"role": "system", "content": system_prompt})

    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        max_tokens=1500,
    )
    reply = response.choices[0].message.content

    if not is_safe(reply):
        reply = AI_UNSAFE_REPLIES.get(language, "Let me answer something else! ðŸ˜Š")

    return {"reply": reply, "safe": True}
