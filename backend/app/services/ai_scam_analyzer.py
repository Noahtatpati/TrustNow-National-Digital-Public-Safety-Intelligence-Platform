import json
from datetime import datetime

import httpx
from app.core.config import settings

SCAM_SYSTEM_PROMPT = """You are an expert scam detection analyst for India's National Digital Public Safety Intelligence Platform (TrustNow). Your job is like Truecaller but for ALL cyber identifiers — phone numbers, websites, UPI IDs, emails, messages, and calls.

Analyze the given input and return a JSON object with exactly these fields:

{
  "riskScore": <integer 0-100>,
  "riskLevel": <"low" | "medium" | "high">,
  "scamType": <one of "Digital Arrest Scam", "UPI Collect Fraud", "Bank Account Takeover", "Fake Legal Notice", "Loan App Fraud", "Investment Scam", "SIM Swap Fraud", "Phishing Link", "Fake Website", "Email Phishing", "Benign">,
  "verdict": <short verdict string>,
  "explanation": <2-3 sentence explanation>,
  "confidence": <integer 0-100>,
  "indicators": [
    {"name": "Urgency Language", "found": <bool>, "description": "Scammers create false urgency to prevent rational thinking"},
    {"name": "Authority Impersonation", "found": <bool>, "description": "Impersonating government or law enforcement agencies"},
    {"name": "Payment Demand", "found": <bool>, "description": "Request for money or financial information"},
    {"name": "Threat Language", "found": <bool>, "description": "Threats of legal action or account freezing"},
    {"name": "Personal Info Request", "found": <bool>, "description": "Request for sensitive personal information"},
    {"name": "Suspicious Link / URL", "found": <bool>, "description": "Message contains suspicious links that may lead to phishing sites"},
    {"name": "Account Compromise Language", "found": <bool>, "description": "Claims about account compromise to create panic"},
    {"name": "Spoofed Sender Pattern", "found": <bool>, "description": "International or spoofed caller ID pattern"}
  ],
  "evidence": [
    {"label": <indicator name>, "detail": <description>, "weight": <2 if found else 1>}
  ],
  "recommendedActions": [<array of 3-5 action strings>],
  "suggestedEscalation": <string>,
  "leadTime": <string>
}

For phone numbers: check against known scam patterns (spoofed, premium rate, international spoofing).
For websites/URLs: check for phishing indicators (typosquatting, fake gov portals, suspicious domain age, HTTPS validity).
For UPI IDs/VPA: check for known fraud VPA patterns, collect request scams, unusual format.
For emails: check sender domain spoofing, phishing links, urgency language, fake sender names.
For messages: check for scam language patterns, fake alerts, impersonation.
For call descriptions: check for digital arrest scripts, impersonation narratives.

Rules:
- riskScore must reflect the genuine danger (0=completely safe, 100=confirmed dangerous scam)
- If no scam indicators are present, set riskScore to 5, riskLevel to "low", scamType to "Benign"
- For an obvious scam with multiple indicators, score 70-99
- Be accurate — do not flag safe entities as scams
- evidence should only contain indicators where found is true; if none, use [{"label": "No strong signal", "detail": "No scam markers detected.", "weight": 1}]
- recommendedActions should be practical steps for the Indian context (cybercrime.gov.in, 1930 helpline, etc.)
- Return ONLY valid JSON, no other text"""


import logging

logger = logging.getLogger(__name__)


async def analyze_with_ai(content: str, input_type: str) -> dict | None:
    api_key = settings.ai_api_key
    if not api_key:
        logger.info(
            "AI_API_KEY not set — using heuristic analysis. "
            "To enable AI-powered scam analysis, set AI_API_KEY to your GitHub token. "
            "GitHub provides free AI model inference at models.inference.ai.azure.com "
            "with any GitHub account (no paid plan required)."
        )
        return None

    type_labels = {
        "phone": "phone number",
        "message": "message/SMS",
        "call": "call description",
        "website": "website URL",
        "upi": "UPI ID/VPA",
        "email": "email address",
    }
    type_label = type_labels.get(input_type, input_type)
    user_prompt = f"Analyze this {type_label} for scam indicators:\n\n{content}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                settings.ai_api_url,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.ai_model,
                    "messages": [
                        {"role": "system", "content": SCAM_SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.1,
                    "max_tokens": 1500,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            raw = data["choices"][0]["message"]["content"].strip()

            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1] if "\n" in raw else raw
                raw = raw.rsplit("```", 1)[0] if "```" in raw else raw

            result = json.loads(raw)
            result["caseId"] = f"TN-{datetime.now().strftime('%Y%m%d%H%M')}"
            return result

    except Exception:
        return None
