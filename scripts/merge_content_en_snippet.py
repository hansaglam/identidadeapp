"""Quick-merge English content for day-1 + mind + journey phase 1 (no API)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "src/i18n/locales/en.json"
data = json.loads(path.read_text(encoding="utf-8"))

snippet = {
    "dailyPrinciples": {
        "1": {
            "principle": "Starting is hundreds of times more important than perfecting.",
            "science": "Open tasks (Zeigarnik effect): a started action pushes the mind to close the loop.",
            "action": "Today, shrink the habit to its smallest version and start just once.",
        }
    },
    "mindPrompts": {
        "daily": [
            "What single thing occupied your mind most today?",
            "What are you thinking but haven't said out loud?",
            "One small detail you're grateful for today?",
            "One clear intention sentence for tomorrow?",
            "Which thought kept you stuck today?",
            "What's the smallest step you promised yourself today?",
            "What do you feel in your body right now — one word?",
            "What did you put off today, and why?",
            "One sentence that reminds you who you are today?",
            "Your energy is 1–10 today; if low, what can you shrink?",
            "The moment you're proudest of today (even if small)?",
            "One load you want to let go of right now?",
            "When did you notice your anchor (trigger) today?",
            "What will you do in the first 2 minutes tomorrow morning?",
        ],
        "modal": [
            "What occupied my mind most today...",
            "What I'm thinking but haven't said out loud...",
            "A small detail I'm grateful for...",
            "One clear intention for tomorrow...",
            "What I actually put off today...",
            "The smallest step I promised myself...",
        ],
    },
    "journeyEducation": {
        "1": [
            {
                "id": "p1-1",
                "title": "While your brain learns the new routine",
                "body": "In the first phase the frontal cortex stays on duty more often: movement usually needs a conscious choice. The brain allocates attention to a new pattern; that fatigue is the cost of learning, not weakness. In early days, small finishable steps create less resistance than big plans.",
            },
            {
                "id": "p1-2",
                "title": "Where does resistance come from?",
                "body": "Before the habit is automatic, basal ganglia haven't locked the pattern yet; that's why the body sometimes says no. Avoidance is normal. The goal isn't zero avoidance — when you notice it, choose the smallest return instead of guilt.",
            },
            {
                "id": "p1-3",
                "title": "Small reward, long distance",
                "body": "Early on big rewards are rare; the brain may drift toward short-term comfort. One completed small step raises the sense of completion. Reduce today's win to the body or one sentence — that's enough proof for a long journey.",
            },
            {
                "id": "p1-4",
                "title": "A line for the setup phase",
                "body": "In this phase context and repetition win: same sequence, same cue, same anchor. Keep your identity sentence short; each repeat is a vote for yourself. Discipline here is a reminder practice, not a performance.",
            },
        ]
    },
    "coachNotes": {
        "day7": "The first week is behind you. The anchor is settling in — it gets easier now.",
        "day14": "Two weeks. New connections are forming in the brain. Even if you don't feel it.",
        "day22": "Critical point. Those who reach here usually finish.",
        "day30": "30 days. The question is no longer 'are you doing it?' but 'who are you becoming?'",
        "day44": "Phase 2 is done. You're not choosing anymore — you're doing.",
        "day66": "66 days. This is yours now — no one can take it.",
    },
}

def deep_merge(base, extra):
    for k, v in extra.items():
        if k in base and isinstance(base[k], dict) and isinstance(v, dict):
            deep_merge(base[k], v)
        else:
            base[k] = v

deep_merge(data, snippet)
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Merged EN snippet into en.json")
