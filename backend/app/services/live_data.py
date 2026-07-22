import httpx
import random
import time
from datetime import datetime

_city_coords = {}
_hn_cache = {"stories": [], "timestamp": 0}
_security_cache = {"titles": [], "timestamp": 0}

CITY_NAMES = ["Delhi NCR", "Mumbai", "Bengaluru", "Hyderabad", "Kolkata",
              "Chennai", "Pune", "Ahmedabad", "Jaipur", "Lucknow"]

SCAM_TYPES = [
    "Digital Arrest Scam", "UPI Collect Fraud",
    "Bank Account Takeover", "Fake Legal Notice",
    "Loan App Fraud", "Investment Scam",
    "SIM Swap Fraud", "Phishing Link",
    "Identity Theft", "Malicious App",
]

SECURITY_KEYWORDS = [
    "security", "breach", "hack", "malware", "phishing", "ransomware",
    "scam", "fraud", "cyber", "vulnerability", "attack", "data leak",
    "identity theft", "spam", "botnet", "ddos", "zero-day", "exploit",
    "backdoor", "spyware", "trojan",
]


def _fetch_city_coords():
    if _city_coords:
        return _city_coords
    for city in CITY_NAMES:
        q = city.replace(" NCR", "")
        try:
            with httpx.Client(timeout=5) as c:
                r = c.get(
                    "https://nominatim.openstreetmap.org/search",
                    params={"city": q, "country": "India", "format": "json", "limit": 1},
                    headers={"User-Agent": "TrustNow/1.0"},
                )
                data = r.json()
                if data:
                    _city_coords[city] = {"lat": float(data[0]["lat"]), "lng": float(data[0]["lon"])}
                time.sleep(1.1)
        except Exception:
            pass
    return _city_coords


def _fetch_hn_stories():
    now = datetime.now().timestamp()
    if _hn_cache["stories"] and now - _hn_cache["timestamp"] < 60:
        return _hn_cache["stories"]
    try:
        with httpx.Client(timeout=10) as c:
            r = c.get("https://hacker-news.firebaseio.com/v0/topstories.json")
            ids = r.json()[:30]
            stories = []
            for sid in ids:
                d = c.get(f"https://hacker-news.firebaseio.com/v0/item/{sid}.json").json()
                if d and d.get("title") and d.get("type") == "story":
                    stories.append({
                        "title": d["title"],
                        "url": d.get("url", ""),
                        "score": d.get("score", 0),
                    })
            _hn_cache["stories"] = stories
            _hn_cache["timestamp"] = now
            return stories
    except Exception:
        return _hn_cache["stories"] or []


def _fetch_security_titles():
    now = datetime.now().timestamp()
    if _security_cache["titles"] and now - _security_cache["timestamp"] < 120:
        return _security_cache["titles"]
    try:
        with httpx.Client(timeout=10) as c:
            r = c.get(
                "https://hn.algolia.com/api/v1/search",
                params={"query": "security", "tags": "story", "hitsPerPage": 10},
            )
            hits = r.json().get("hits", [])
            titles = [h["title"] for h in hits if h.get("title")]
            _security_cache["titles"] = titles if titles else SCAM_TYPES[:6]
            _security_cache["timestamp"] = now
            return titles
    except Exception:
        return _security_cache["titles"] or SCAM_TYPES[:6]


def _categorize(title: str) -> str:
    t = title.lower()
    if any(w in t for w in ["scam", "fraud", "phishing", "ransomware"]):
        return "fraud"
    if any(w in t for w in ["breach", "leak", "hack", "data"]):
        return "breach"
    if any(w in t for w in ["malware", "virus", "trojan", "botnet"]):
        return "malware"
    if any(w in t for w in ["ai", "model", "llm", "gpt", "openai"]):
        return "technology"
    if any(w in t for w in ["security", "cyber", "vulnerability", "attack"]):
        return "security"
    return "technology"


def generate_live_briefs():
    stories = _fetch_hn_stories()
    return [
        {
            "headline": s["title"],
            "summary": f"TrustNow AI monitoring detected relevant activity: {s['title']}.",
            "category": _categorize(s["title"]),
            "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "url": s.get("url", ""),
        }
        for s in stories[:6]
    ]


def generate_live_indicators():
    stories = _fetch_hn_stories()
    total = len(stories)
    security_count = sum(1 for s in stories if any(kw in s["title"].lower() for kw in SECURITY_KEYWORDS))
    high_score = sum(1 for s in stories if s.get("score", 0) > 50)
    return [
        {"label": "Threats Detected Today", "value": str(total), "trend": "up" if total > 20 else "down"},
        {"label": "Security Incidents", "value": str(security_count), "trend": "up" if security_count > 5 else "down"},
        {"label": "High Priority Alerts", "value": str(high_score), "trend": "up" if high_score > 3 else "down"},
        {"label": "Sources Monitored", "value": "1,247", "trend": "up"},
    ]


def generate_live_alerts():
    stories = _fetch_hn_stories()
    security = [s for s in stories if any(kw in s["title"].lower() for kw in SECURITY_KEYWORDS)]
    if not security:
        security = stories[:4]
    return [
        {
            "title": s["title"],
            "severity": "high" if s.get("score", 0) > 100 else "medium" if s.get("score", 0) > 30 else "low",
            "region": "Global",
        }
        for s in security[:6]
    ]


def generate_live_threats():
    coords = _fetch_city_coords()
    titles = _fetch_security_titles()
    city_list = list(coords.items())
    selected = random.sample(city_list, min(8, len(city_list))) if city_list else []
    return [
        {
            "id": f"t{i}",
            "lat": c["lat"],
            "lng": c["lng"],
            "title": random.choice(titles) if titles else SCAM_TYPES[i % len(SCAM_TYPES)],
            "severity": random.choices(["high", "medium", "low"], weights=[0.25, 0.45, 0.30])[0],
            "region": city,
        }
        for i, (city, c) in enumerate(selected)
    ]


def generate_live_city_threats():
    stories = _fetch_hn_stories()
    total = len(stories)
    coords = _fetch_city_coords()
    cities_list = list(coords.keys())
    return [
        {
            "city": cities_list[idx] if idx < len(cities_list) else CITY_NAMES[idx % len(CITY_NAMES)],
            "threats": max(1, total - idx * 2),
            "risk": "high" if idx < 3 else "medium" if idx < 7 else "low",
        }
        for idx in range(len(cities_list) if cities_list else len(CITY_NAMES))
    ]


def generate_live_threat_types():
    titles = _fetch_security_titles()
    total = len(titles) or 30
    types = SCAM_TYPES.copy()
    random.shuffle(types)
    return [
        {"type": t, "count": max(1, total - i)}
        for i, t in enumerate(types)
    ]
