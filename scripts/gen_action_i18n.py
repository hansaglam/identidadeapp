"""Extract action titles from actions.ts and merge into locale JSON files."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ACTIONS_TS = ROOT / "src" / "engine" / "actions.ts"
LOCALES = ROOT / "src" / "i18n" / "locales"

# English translations keyed by action id (Turkish title -> en)
EN: dict[str, str] = {
    "stand-up": "Stand up",
    "walk-5": "Take 5 steps",
    "shake-shoulders": "Roll your shoulders",
    "open-window": "Open a window, breathe fresh air for 5 sec",
    "drink-water": "Take a sip of water",
    "stand-tall": "Stand tall, open your chest for 3 sec",
    "jump-once": "Do one jump in place",
    "march-10": "March in place, count to 10",
    "tap-desk": "Tap the desk twice, then move",
    "wake-wrists": "Circle your wrists for 5 sec",
    "calf-raise-3": "Rise on your toes 3 times",
    "light-on": "Turn on a light or open the curtain",
    "door-threshold": "Go to the doorway, step inside",
    "interrupt-stand": "Stand up now",
    "anchor-touch": "Touch your anchor",
    "say-identity": "Say who you are out loud",
    "two-minute": "Do the 2-minute version",
    "tiny-rep": "Do one rep",
    "habit-whisper": "Whisper your habit again",
    "anchor-visualize": "Picture your anchor for 5 sec",
    "one-line-plan": "Write today's one step in a line",
    "tool-ready": "Put the tool on the desk (book, mat, water…)",
    "smallest-version-say": "Say the smallest version out loud",
    "repeat-anchor-twice": "Say your anchor phrase twice",
    "identity-nod": "Say “I'm someone who does this” and nod",
    "habit-object-touch": "Touch your habit object once",
    "mark-done-intent": "Say “I'm doing it now” and go to your anchor",
    "deep-breath": "Take a deep breath",
    "count-three": "Count to 3 and start",
    "phone-down": "Turn your phone face down",
    "no-explain": "Start without explaining",
    "five-countdown": "Count 5-4-3-2-1 and make the first move",
    "shoulders-drop": "Drop your shoulders consciously for 5 sec",
    "unclench-jaw": "Relax your jaw, tongue on the palate",
    "stop-scroll-thumb": "Lift your thumb off the screen for 3 sec",
    "say-start-now": "Say “I'm starting now” — no delay",
    "box-breath-4": "In 4 sec, hold 4, out 4",
    "feet-flat-press": "Press feet into the floor for 5 sec",
    "timer-3-start": "Count down 3 and move",
    "close-eyes": "Close your eyes for 10 seconds",
    "one-thing": "Look at only one thing",
    "screen-blank": "Lift your head from the screen",
    "blink-reset": "Blink 10 times, then focus on one point",
    "mute-notifications": "Mute notifications for 1 hour",
    "desk-clear-one": "Remove one thing from the desk",
    "read-one-word": "Read the first word of your task",
    "stare-one-point": "Stare at a wall/point for 10 sec",
    "headphones-on": "Put on headphones or go silent",
    "pen-cap-off": "Uncap your pen, ready to write",
    "single-task-say": "Say your single task out loud",
    "soft-restart": "Stand up and take 1 step",
    "smile": "Smile at yourself in the mirror",
    "stretch": "Raise arms, open shoulders (once)",
    "comeback": "Spread fingertips, move elbows lightly",
    "thank-self": "Say “I tried today”",
    "slow-exhale-3": "Exhale slowly 3 times",
    "gentle-neck-roll": "Tilt your neck gently to one side",
    "forgive-yesterday": "Say “Yesterday is done, today is here”",
    "hand-on-heart": "Hand on chest, breathe for 5 sec",
    "step-outside": "Go to the door, look outside 5 sec",
    "tpl-clear-mind-write": "Reduce your mind to one sentence",
    "tpl-clear-mind-open": "Open Mind tab, let the cursor blink",
    "tpl-clear-breath-box": "4-4-4 breath, then write one thought",
    "tpl-clear-list-one": "Pick one of 3 things in your head, write it",
    "tpl-clear-worry-out": "Dump the worry on paper/note, close it",
    "tpl-move-bounce-30": "Bounce in place for 30 sec",
    "tpl-move-pushup-1": "Do 1 push-up",
    "tpl-move-shoes": "Pick up your workout shoes",
    "tpl-move-squat-1": "Do 1 squat",
    "tpl-move-stretch-arms": "Reach arms up, hold 5 sec",
    "tpl-move-stairs-3": "Go up or down 3 steps",
    "tpl-learn-first-line": "Open the source, look at the first line",
    "tpl-learn-name": "See the source name and close",
    "tpl-learn-page-turn": "Turn a page or scroll forward",
    "tpl-learn-one-fact": "Read one sentence of info",
    "tpl-learn-bookmark": "Bookmark where you left off",
    "tpl-self-water": "Put a glass of water on the desk, take a sip",
    "tpl-self-glass": "Just put the glass on the desk",
    "tpl-self-wash-face": "Splash face with cold water 5 sec",
    "tpl-self-lotion-hand": "Apply lotion to one hand",
    "tpl-self-posture": "Straighten shoulders, stand tall 5 sec",
    "tpl-creator-open": "Open the file, move cursor to first line",
    "tpl-creator-word": "Write or draw just one word",
    "tpl-creator-idea": "Write the one idea in your head as a sentence",
    "tpl-creator-title-only": "Write only the title line",
    "tpl-creator-rough-line": "Write one draft line, no editing",
    "tpl-focus-tab": "Close all tabs, leave one",
    "tpl-focus-task": "Say your one current task out loud",
    "tpl-focus-timer": "Start 25-min timer, turn phone over",
    "tpl-focus-notify-off": "Turn off notifications or focus mode",
    "tpl-focus-desk-one": "Leave only one work tool on the desk",
    "tpl-focus-5min": "Start a 5-minute focus timer",
    "tpl-sleep-screen": "Turn off screen, close eyes 10 sec",
    "tpl-sleep-phone": "Put phone away, turn your face",
    "tpl-sleep-breath": "In 4, hold 4, out 4",
    "tpl-sleep-dim-light": "Dim or turn off the light",
    "tpl-sleep-alarm-set": "Check tomorrow's alarm",
    "tpl-sleep-gratitude": "Whisper one good thing from today",
    "tpl-social-name": "Write the name of someone on your mind",
    "tpl-social-msg": "Draft a one-line message",
    "tpl-social-smile": "Pause with intent to smile at next person",
    "tpl-social-wave-plan": "Think who you'll wave to",
    "tpl-social-send-hi": "Type “hi” or “how are you”, sending optional",
    "tpl-social-voice-draft": "Record one sentence voice note",
    "micro-clap": "Clap once",
    "micro-stretch-neck": "Turn neck slowly left-right (once)",
    "micro-feet": "Press feet into floor, hold 3 sec",
    "micro-posture": "Pull shoulders back, open chest 2 sec",
    "micro-sip": "Take a sip if you have water",
    "micro-window": "Look out a window or into the distance 5 sec",
    "micro-name-habit": "Say your habit name out loud",
    "micro-timer-10": "Start a 10-second timer",
    "micro-pen-paper": "Open pen or phone notes",
    "micro-one-word": "Write today's intent in one word",
    "micro-shoes-on": "Put on or pick up your shoes",
    "micro-door": "Walk to the door, step on the threshold",
    "micro-smile-mirror": "Look at camera or mirror 2 sec",
    "micro-inhale": "Breathe in 4 sec, out 4 sec",
    "micro-stand-stretch": "Stand up, stretch arms once",
    "micro-phone-away": "Put phone one arm's length away",
    "micro-anchor-say": "Say your anchor out loud",
    "micro-tiny-rep-2": "Do the smallest rep twice",
    "micro-commit": "Say “I'm starting now” and move",
    "micro-habit-start": "Do the smallest part of your habit",
    "micro-reset-breath": "Breathe in nose, out mouth (3 times)",
}

PT: dict[str, str] = {
    "interrupt-stand": "Levante agora",
    "stand-up": "Levante-se",
    "walk-5": "Dê 5 passos",
    "deep-breath": "Respire fundo",
    "drink-water": "Tome um gole de água",
}

def parse_actions():
    text = ACTIONS_TS.read_text(encoding="utf-8")
    return re.findall(r'\{\s*id:\s*"([^"]+)",\s*title:\s*"([^"]+)"', text)

def merge_actions(locale: str, titles: dict[str, str]):
    path = LOCALES / f"{locale}.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    actions = {}
    for aid, tr_title in parse_actions():
        if locale == "tr":
            actions[aid] = {"title": tr_title}
        else:
            actions[aid] = {"title": titles.get(aid, tr_title)}
    data["actions"] = actions
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(actions)} actions to {path.name}")

if __name__ == "__main__":
    merge_actions("tr", {})
    merge_actions("en", EN)
    # pt-BR: use EN where PT missing
    pt_all = {**EN, **PT}
    merge_actions("pt-BR", pt_all)
