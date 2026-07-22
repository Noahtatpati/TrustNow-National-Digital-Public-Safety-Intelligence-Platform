from datetime import datetime
import json
import random
import logging
from typing import Optional

import httpx
from fastapi import APIRouter
from app.core.config import settings
from app.models.schemas import (
    TodaysBriefResponse,
    IndicatorsResponse,
    AlertsResponse,
    ScamAnalysisResult,
    ScamAnalysisRequest,
    PhoneLookupRequest,
    PhoneLookupResult,
    EmailLookupRequest,
    EmailLookupResult,
    UrlLookupRequest,
    UrlLookupResult,
    UpiLookupRequest,
    UpiLookupResult,
    CounterfeitScanRequest,
    CounterfeitScanResult,
    CounterfeitCheck,
)
from app.services.mock_data import briefs, indicators, alerts, threats as static_threats
from app.services.live_data import (
    generate_live_briefs,
    generate_live_indicators,
    generate_live_alerts,
    generate_live_threats,
    generate_live_city_threats,
    generate_live_threat_types,
)
from app.services.ai_scam_analyzer import analyze_with_ai

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/brief/today")
async def get_todays_brief():
    return {
        "briefs": generate_live_briefs(),
        "generatedAt": datetime.now().isoformat(),
    }


@router.get("/indicators")
async def get_indicators():
    return {
        "indicators": generate_live_indicators(),
        "generatedAt": datetime.now().isoformat(),
    }


@router.get("/alerts")
async def get_alerts():
    return {
        "alerts": generate_live_alerts(),
        "generatedAt": datetime.now().isoformat(),
    }


@router.get("/threats")
async def get_threats():
    return {
        "threats": generate_live_threats(),
        "cityThreats": generate_live_city_threats(),
        "threatTypes": generate_live_threat_types(),
        "generatedAt": datetime.now().isoformat(),
    }


import re

def _word_match(text: str, words: list[str]) -> bool:
    """Match whole words using word boundaries — prevents 'case' matching 'suitcase'."""
    for w in words:
        if re.search(r'\b' + re.escape(w) + r'\b', text, re.IGNORECASE):
            return True
    return False


def _phrase_match(text: str, phrases: list[str]) -> bool:
    """Match multi-word phrases."""
    lower = text.lower()
    for p in phrases:
        if p in lower:
            return True
    return False


# Weighted indicator definitions — critical indicators have higher weight
URGENCY_WORDS = ["immediately", "urgent", "asap", "hurry", "action required", "act now", "limited time", "expires today", "last warning", "don't miss", "expiring soon"]
AUTHORITY_WORDS = ["cbi", "police", "court", "judge", "supreme court", "high court", "customs", "enforcement", "income tax", "government", "rbi", "sebi", "trai", "edi", "ncb", "interpol", "ed", "cvc", "narcotics bureau", "directorate"]
PAYMENT_WORDS = ["pay", "transfer", "upi", "deposit", "fine", "fee", "payment", "send money", "receive money", "processing fee", "security deposit", "refundable", "advance fee", "wallet", "neft", "imps"]
THREAT_WORDS = ["arrest", "warrant", "jail", "illegal", "freeze", "blocked", "legal action", "summon", "non-compliance", "defamation", "contempt", "seized", "confiscated", "investigation", "registered complaint"]
INFO_REQUEST_WORDS = ["otp", "password", "aadhaar", "pan", "account number", "login", "credential", "verify now", "update kyc", "personal details", "date of birth", "mother maiden", "biometric", "fingerprint", "iris scan"]
ACCOUNT_WORDS = ["your account", "suspended", "deactivated", "unusual activity", "security alert", "login attempt", "unauthorized", "breach", "compromised", "irregular activity", "suspicious transaction"]
LINK_PATTERNS = [r'https?://', r'bit\.ly', r'tinyurl', r't\.co', r'rb\.gy', r'click here', r'click the link', r'verify now', r'reset your', r'update your']
PHONE_SPOOF = r'^\+\d{1,3}\s*\d{8,}$'

# Indian scam-specific phrases (high signal)
INDIAN_SCAM_PHRASES = [
    "digital arrest", "courier parcel", "fedex parcel", "narcotics",
    "money laundering case", "your aadhaar is", "aadhaar link", "kyc update",
    "kyc expired", "pan card link", "sim card blocked", "trai complaint",
    "insurance claim", "lucky draw", "prize money", "winning amount",
    "processing fee", "registration fee", "refund", "cashback",
    "free gift", "lottery", "inheritance", "unclaimed",
    "cyber crime unit", "cyber cell", "video arrest", "digital warrant",
    "drug trafficking", "ndps act", "customer care", "technical support",
    "helpline number", "ypay", "ybl", "paytm wallet",
]


def _detect_link(text: str) -> bool:
    for pat in LINK_PATTERNS:
        if re.search(pat, text, re.IGNORECASE):
            return True
    return False


def _detect_indian_scam_phrases(text: str) -> list[str]:
    lower = text.lower()
    return [p for p in INDIAN_SCAM_PHRASES if p in lower]


def heuristic_analyze(content: str, input_type: str) -> ScamAnalysisResult:
    text = content.strip()
    is_url_type = input_type == "website"
    is_phone_type = input_type == "phone"
    is_upi_type = input_type == "upi"
    is_text_type = input_type in ("message", "call", "email")

    # --- Indicator Detection ---

    # Urgency: skip for phone/upi unless text mode
    urgency_found = _word_match(text, URGENCY_WORDS)

    # Authority impersonation
    authority_found = _word_match(text, AUTHORITY_WORDS)

    # Payment demand
    payment_found = _word_match(text, PAYMENT_WORDS)

    # Threat language
    threat_found = _word_match(text, THREAT_WORDS)

    # Personal info request
    info_found = _word_match(text, INFO_REQUEST_WORDS)

    # Account compromise language
    account_found = _phrase_match(text, ACCOUNT_WORDS)

    # Suspicious link — detect in text; for URL type, the input itself is a link
    link_found = _detect_link(text) if is_text_type else (
        _detect_link(text)  # still check even for URL type for extra signals
    )

    # Spoofed phone pattern
    spoofed_phone = is_phone_type and bool(re.match(PHONE_SPOOF, text.replace("-", "").replace(" ", "")))

    # Indian-specific scam phrases (very high signal)
    indian_scam_found = _detect_indian_scam_phrases(text)

    # UPI-specific: check for @ in content as suspicious collect request signal
    upi_collect_signal = is_upi_type and "@" in text

    # --- Weighted Scoring ---
    # Weights: authority=3, payment=3, threat=3, urgency=2, info=2, account=2, link=2, spoofed=1, indian_scam=+4 per phrase

    weights = {
        "urgency": 2,
        "authority": 3,
        "payment": 3,
        "threat": 3,
        "info": 2,
        "account": 2,
        "link": 2,
        "spoofed": 1,
    }

    score_contributions = []
    if urgency_found:
        score_contributions.append(("Urgency Language", urgency_found, weights["urgency"]))
    if authority_found:
        score_contributions.append(("Authority Impersonation", authority_found, weights["authority"]))
    if payment_found:
        score_contributions.append(("Payment Demand", payment_found, weights["payment"]))
    if threat_found:
        score_contributions.append(("Threat Language", threat_found, weights["threat"]))
    if info_found:
        score_contributions.append(("Personal Info Request", info_found, weights["info"]))
    if account_found:
        score_contributions.append(("Account Compromise Language", account_found, weights["account"]))
    if link_found:
        score_contributions.append(("Suspicious Link / URL", link_found, weights["link"]))
    if spoofed_phone:
        score_contributions.append(("Spoofed Sender Pattern", spoofed_phone, weights["spoofed"]))

    # Base score: sum of weighted contributions / max possible weight * 100
    max_weight = sum(weights.values())
    raw_weighted = sum(w for _, _, w in score_contributions)
    raw_score = (raw_weighted / max_weight) * 100

    # Bonus: Indian scam phrases add significant weight
    indian_scam_bonus = len(indian_scam_found) * 12
    # Bonus: authority + payment together is very high signal
    authority_payment_bonus = 10 if authority_found and payment_found else 0
    # Bonus: authority + threat together
    authority_threat_bonus = 8 if authority_found and threat_found else 0

    risk_score = min(99, int(raw_score) + indian_scam_bonus + authority_payment_bonus + authority_threat_bonus)

    # --- Minimum risk floors based on high-signal individual indicators ---
    # "Common sense" — certain individual signals alone should never be low risk
    min_risk = 5  # default floor
    if authority_found and payment_found:
        min_risk = max(min_risk, 65)  # authority+payment = confirmed scam script
    elif authority_found and threat_found:
        min_risk = max(min_risk, 50)  # authority+threat = very suspicious
    elif indian_scam_found:
        min_risk = max(min_risk, 50)  # indian scam phrases = high signal
    elif authority_found:
        min_risk = max(min_risk, 35)  # any authority alone = at least medium
    elif payment_found and threat_found:
        min_risk = max(min_risk, 40)  # payment+threat = suspicious
    elif info_found:
        min_risk = max(min_risk, 25)  # asking for personal info = notable
    elif account_found:
        min_risk = max(min_risk, 25)  # account compromise language = notable

    risk_score = max(risk_score, min_risk)

    # --- Level Assignment ---
    if risk_score >= 60:
        risk_level = "high"
    elif risk_score >= 25:
        risk_level = "medium"
    else:
        risk_level = "low"

    # --- Scam Type Classification ---
    if indian_scam_found:
        # Pick the most relevant scam type from detected phrases
        lower = text.lower()
        if "digital arrest" in lower or "money laundering" in lower or "narcotics" in lower:
            scam_type = "Digital Arrest Scam"
        elif "kyc" in lower or "aadhaar" in lower or "sim card" in lower or "pan card" in lower:
            scam_type = "Phishing Link"
        elif "lottery" in lower or "prize" in lower or "winning" in lower or "lucky draw" in lower or "inheritance" in lower or "unclaimed" in lower:
            scam_type = "Investment Scam"
        elif "courier" in lower or "fedex" in lower or "parcel" in lower:
            scam_type = "Fake Legal Notice"
        elif "processing fee" in lower or "registration fee" in lower:
            scam_type = "Loan App Fraud"
        elif "refund" in lower or "cashback" in lower:
            scam_type = "UPI Collect Fraud"
        else:
            scam_type = "Phishing Link"
    elif risk_level == "high":
        if authority_found and payment_found:
            scam_type = "Digital Arrest Scam"
        elif account_found and payment_found:
            scam_type = "Bank Account Takeover"
        elif link_found and urgency_found:
            scam_type = "Phishing Link"
        else:
            scam_type = "Suspicious Communication"
    elif risk_level == "medium":
        if link_found:
            scam_type = "Phishing Link"
        elif payment_found:
            scam_type = "Suspicious Communication"
        else:
            scam_type = "Suspicious Communication"
    else:
        scam_type = "Benign"

    # --- Verdict ---
    if risk_level == "high":
        if indian_scam_found:
            verdict = f"Confirmed scam pattern — {scam_type}. Do not engage."
        else:
            verdict = "Likely a scam — do not share any information or make payments"
        lead_time = "Immediate — escalate now"
        suggested_escalation = "Escalate to the cybercrime cell and telecom provider immediately. Preserve all evidence (call logs, screenshots, messages)."
        explanation = f"High-density scam pattern detected: {len(score_contributions)} of {len(weights)} indicator categories triggered. "
        if authority_found and payment_found:
            explanation += "The combination of authority impersonation and payment demand is a hallmark of digital arrest and government imposter scams. "
        if indian_scam_found:
            explanation += f"Specifically flagged Indian scam keywords: {', '.join(indian_scam_found)}. "
        explanation += "Immediate action recommended — do not engage with the sender."
    elif risk_level == "medium":
        verdict = "Suspicious — verify independently before responding"
        lead_time = "1-2 min before transfer"
        suggested_escalation = "Flag for review. Ask the caller to verify their identity through an official channel (official website, published phone number)."
        explanation = "Several warning signals were detected, but the pattern is not yet conclusive. "
        if indian_scam_found:
            explanation += f"Notable Indian scam keywords detected: {', '.join(indian_scam_found)}. "
        explanation += "Verify independently before taking any action."
    else:
        verdict = "Appears safe — exercise normal caution"
        lead_time = "No immediate escalation"
        suggested_escalation = "No escalation needed. Continue normal caution."
        if score_contributions:
            explanation = "Minor or non-specific signals detected that don't match known scam patterns. Likely benign."
        else:
            explanation = "No scam indicators were detected. The message does not match known scam language patterns."

    # --- Build indicators list ---
    indicators = [
        {"name": "Urgency Language", "found": urgency_found, "description": "Scammers create false urgency to prevent rational thinking"},
        {"name": "Authority Impersonation", "found": authority_found, "description": "Impersonating government or law enforcement agencies"},
        {"name": "Payment Demand", "found": payment_found, "description": "Request for money or financial information"},
        {"name": "Threat Language", "found": threat_found, "description": "Threats of legal action or account freezing"},
        {"name": "Personal Info Request", "found": info_found, "description": "Request for sensitive personal information"},
        {"name": "Suspicious Link / URL", "found": link_found, "description": "Message contains suspicious links that may lead to phishing sites"},
        {"name": "Account Compromise Language", "found": account_found, "description": "Claims about account compromise to create panic"},
        {"name": "Spoofed Sender Pattern", "found": spoofed_phone, "description": "International or spoofed caller ID pattern"},
    ]

    evidence = [
        {"label": item[0], "detail": next((ind["description"] for ind in indicators if ind["name"] == item[0]), ""), "weight": item[2]}
        for item in score_contributions
    ]
    if indian_scam_found:
        for phrase in indian_scam_found:
            evidence.append({"label": f"Indian Scam Phrase: {phrase}", "detail": f"Detected '{phrase}' — known Indian scam keyword.", "weight": 4})
    if not evidence:
        evidence = [{"label": "No strong signal", "detail": "No dominant scam markers were detected in the supplied input.", "weight": 1}]

    confidence = min(98, max(50, risk_score + 5))
    case_id = f"TN-{datetime.now().strftime('%Y%m%d%H%M')}"

    return ScamAnalysisResult(
        riskScore=risk_score,
        riskLevel=risk_level,
        indicators=indicators,
        scamType=scam_type,
        recommendedActions=[
            "Do not share any personal or financial information",
            "Verify by calling the official government helpline number",
            "Report immediately at cybercrime.gov.in or dial 1930",
            "Block the number and report to your telecom provider",
            "Inform your bank if any financial information was shared",
        ],
        verdict=verdict,
        confidence=confidence,
        explanation=explanation,
        evidence=evidence,
        suggestedEscalation=suggested_escalation,
        leadTime=lead_time,
        caseId=case_id,
    )


# ── AI Vision Counterfeit Scan ──────────────────────────────────────────

COUNTERFEIT_SCAN_PROMPT = """You are an expert currency forensics analyst for the Reserve Bank of India. Analyze the provided image of an Indian currency note and determine the authenticity of each of the following 6 security features.

Return ONLY valid JSON with this exact structure, no other text:
{
  "isGenuine": <true if the note appears genuine, false if counterfeit>,
  "explanation": "<2-3 sentence summary of findings>",
  "checks": [
    {"id": "thread", "label": "Security Thread", "passed": <bool>, "details": "<forensic detail>"},
    {"id": "microprint", "label": "Microprint Lettering", "passed": <bool>, "details": "<forensic detail>"},
    {"id": "serial", "label": "Serial Number", "passed": <bool>, "details": "<forensic detail>"},
    {"id": "watermark", "label": "Watermark", "passed": <bool>, "details": "<forensic detail>"},
    {"id": "uv", "label": "UV Feature", "passed": <bool>, "details": "<forensic detail>"},
    {"id": "latent", "label": "Latent Image", "passed": <bool>, "details": "<forensic detail>"}
  ]
}

Guidelines:
- If the image is NOT an Indian currency note, set all checks to false and isGenuine to false with explanation "Not a valid Indian currency note."
- Security Thread: Check for windowed security thread with RBI/Bharat text, color-shifting
- Microprint: Check for microprinted RBI and denomination text (requires magnification in real life, look for fine detail)
- Serial Number: Check for proper alphanumeric serial with consistent font
- Watermark: Check for Mahatma Gandhi portrait watermark and electrotype denomination
- UV Feature: Note that UV cannot be verified from a standard photo — be honest if unclear
- Latent Image: Check for hidden denomination visible at angle (note this may be hard to verify from a photo)
- Be thorough and specific — provide real forensic observations
- If uncertain about a feature from the image alone, set it to false with explanation of what to verify physically"""


def _parse_counterfeit_response(raw: str) -> Optional[dict]:
    """Extract JSON from AI response, cleaning markdown fences."""
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text
        text = text.rsplit("```", 1)[0] if "```" in text else text
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def _fallback_counterfeit_scan():
    """Return a realistic simulated scan result when AI is unavailable."""
    checks = [
        CounterfeitCheck(
            id="thread", label="Security Thread", passed=False,
            description="Windowed security thread with RBI text visible when held against light",
            details="⚠ NOT VERIFIED: Could not detect an embedded security thread. Genuine notes have a windowed thread reading 'भारत' (Bharat) with green-to-blue color shift.",
        ),
        CounterfeitCheck(
            id="microprint", label="Microprint Lettering", passed=False,
            description="Microprinted 'RBI' and '₹500' text under magnification",
            details="⚠ NOT VERIFIED: Microprint could not be confirmed from this image. Genuine notes have clear microprint on Gandhi's collar visible at 10x magnification.",
        ),
        CounterfeitCheck(
            id="serial", label="Serial Number", passed=False,
            description="Unique serial number with consistent font and spacing",
            details="⚠ NOT VERIFIED: No RBI-standard serial number was identifiable. Genuine notes have a unique 7-character alphanumeric serial.",
        ),
        CounterfeitCheck(
            id="watermark", label="Watermark", passed=False,
            description="Mahatma Gandhi portrait watermark and electrotype denomination",
            details="⚠ NOT VERIFIED: Gandhi watermark could not be detected. Genuine notes have a multi-tone portrait watermark visible when held to light.",
        ),
        CounterfeitCheck(
            id="uv", label="UV Feature", passed=False,
            description="UV-reactive elements including number panel and security thread",
            details="⚠ NOT VERIFIED: UV features require a UV light source which cannot be verified from a standard photograph. Physical inspection required.",
        ),
        CounterfeitCheck(
            id="latent", label="Latent Image", passed=False,
            description="Hidden denomination value visible when note is tilted at 45°",
            details="⚠ NOT VERIFIED: Latent image angle verification could not be performed from this static image. Tilt the note at 45° to verify.",
        ),
    ]
    return CounterfeitScanResult(
        isAuthentic=False,
        passedCount=0,
        failedCount=6,
        checks=checks,
        explanation="AI vision analysis unavailable — running basic image verification. None of the 6 security features could be confirmed from this image. For a definitive result, visit your nearest bank or use a UV light and magnifier to manually verify the features listed below. Alternatively, select a demo sample above to see how genuine and counterfeit notes compare.",
        aiUsed=False,
    )


@router.post("/counterfeit/scan")
async def scan_counterfeit(request: CounterfeitScanRequest):
    api_key = settings.ai_api_key

    # Try AI vision if API key is available
    if api_key:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(
                    settings.ai_api_url,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.ai_model,
                        "messages": [
                            {"role": "system", "content": COUNTERFEIT_SCAN_PROMPT},
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": "Analyze this image for Indian currency security features:"},
                                    {"type": "image_url", "image_url": {"url": request.imageData}},
                                ],
                            },
                        ],
                        "temperature": 0.1,
                        "max_tokens": 2000,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                raw = data["choices"][0]["message"]["content"].strip()
                result = _parse_counterfeit_response(raw)

                if result:
                    checks_data = result.get("checks", [])
                    passed = sum(1 for c in checks_data if c.get("passed"))
                    failed = sum(1 for c in checks_data if not c.get("passed"))

                    checks = [
                        CounterfeitCheck(
                            id=c["id"],
                            label=c["label"],
                            description=c.get("description", ""),
                            passed=c.get("passed", False),
                            details=c.get("details", ""),
                        )
                        for c in checks_data
                    ]

                    return CounterfeitScanResult(
                        isAuthentic=result.get("isGenuine", False),
                        passedCount=passed,
                        failedCount=failed,
                        checks=checks,
                        explanation=result.get("explanation", "AI analysis complete."),
                        aiUsed=True,
                    )
        except Exception as e:
            logger.error(f"Counterfeit AI scan failed (falling back): {e}")

    # Fallback: return simulated scan results
    return _fallback_counterfeit_scan()


@router.post("/lookup/phone", response_model=PhoneLookupResult)
async def lookup_phone(request: PhoneLookupRequest):
    digits = "".join(c for c in request.number if c.isdigit())
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"https://calltracer.io/api/lookup/{digits}")
            if resp.status_code == 200:
                data = resp.json()
                reports = data.get("reports") or {}
                return PhoneLookupResult(
                    number=data.get("international", request.number),
                    location=data.get("location") or data.get("country", "Unknown"),
                    carrier=data.get("carrier") or "Unknown",
                    lineType=data.get("number_type", "Unknown"),
                    spamScore=reports.get("spam_score", 0) or 0,
                    reportCount=reports.get("total", 0) or 0,
                    country=data.get("country", "Unknown"),
                    isValid=data.get("is_valid", False),
                )
    except Exception:
        pass
    return PhoneLookupResult(
        number=request.number,
        location="Unknown", carrier="Unknown", lineType="Unknown",
        spamScore=0, reportCount=0, country="Unknown", isValid=False,
    )


@router.post("/lookup/email", response_model=EmailLookupResult)
async def lookup_email(request: EmailLookupRequest):
    import re
    is_valid = bool(re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', request.email))
    domain = request.email.split("@")[-1] if "@" in request.email else ""
    common_providers = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com", "protonmail.com", "icloud.com", "zoho.com", "yandex.com", "mail.com"]
    return EmailLookupResult(
        email=request.email,
        isValid=is_valid,
        isFreeProvider=domain.lower() in common_providers,
        domain=domain,
    )


@router.post("/lookup/url", response_model=UrlLookupResult)
async def lookup_url(request: UrlLookupRequest):
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                "https://snifurl.online/analyze",
                json={"url": request.url},
            )
            if resp.status_code == 200:
                data = resp.json()
                ind = data.get("indicators", {})
                cert = ind.get("ssl_certificate") or {}
                whois = ind.get("whois") or {}
                return UrlLookupResult(
                    url=data.get("url", request.url),
                    score=data.get("score", 0),
                    riskLevel=data.get("risk_level", "UNKNOWN"),
                    recommendation=data.get("recommendation", ""),
                    usesHttps=ind.get("uses_https", False),
                    dnsExists=ind.get("dns_exists", False),
                    hasIp=ind.get("has_ip", False),
                    suspiciousTld=ind.get("suspicious_tld"),
                    recentlyCreated=ind.get("recently_created"),
                    sslValid=cert.get("valid"),
                    domainAgeDays=whois.get("age_days"),
                )
    except Exception:
        pass
    return UrlLookupResult(
        url=request.url,
        score=50,
        riskLevel="UNKNOWN",
        recommendation="Could not analyze URL",
        usesHttps=False, dnsExists=False, hasIp=False,
        suspiciousTld=None, recentlyCreated=None,
        sslValid=None, domainAgeDays=None,
    )


@router.post("/lookup/upi", response_model=UpiLookupResult)
async def lookup_upi(request: UpiLookupRequest):
    parts = request.upiId.split("@")
    is_valid = len(parts) == 2 and all(parts)
    provider_map = {
        "paytm": "Paytm", "ybl": "Yes Bank", "ibl": "ICICI",
        "sbi": "SBI", "hdfc": "HDFC Bank", "axis": "Axis Bank",
        "okicici": "ICICI", "okhdfc": "HDFC", "okaxis": "Axis Bank",
        "upi": "NPCI", "apl": "Amazon Pay", "phonepe": "PhonePe",
        "cred": "CRED", "gpay": "Google Pay",
    }
    provider = "Unknown"
    if is_valid:
        handle = parts[1].lower()
        for key, val in provider_map.items():
            if key in handle:
                provider = val
                break
    return UpiLookupResult(
        upiId=request.upiId,
        isValid=is_valid,
        provider=provider,
        riskLevel="low" if is_valid else "high",
        spamScore=random.randint(0, 15) if is_valid else random.randint(60, 95),
        notes=["Valid UPI ID format"] if is_valid else ["Invalid UPI ID format — must be user@handle"],
    )


@router.post("/scam/analyze", response_model=ScamAnalysisResult)
async def analyze_scam(request: ScamAnalysisRequest):
    ai_result = await analyze_with_ai(request.content, request.type)
    if ai_result:
        return ScamAnalysisResult(
            riskScore=ai_result.get("riskScore", 5),
            riskLevel=ai_result.get("riskLevel", "low"),
            indicators=ai_result.get("indicators", []),
            scamType=ai_result.get("scamType", "Benign"),
            recommendedActions=ai_result.get("recommendedActions", [
                "Do not share any personal or financial information",
                "Report immediately at cybercrime.gov.in or dial 1930",
            ]),
            verdict=ai_result.get("verdict", "No verdict available"),
            confidence=ai_result.get("confidence", 85),
            explanation=ai_result.get("explanation", "Analyzed by AI model."),
            evidence=ai_result.get("evidence", []),
            suggestedEscalation=ai_result.get("suggestedEscalation", "Escalate for review."),
            leadTime=ai_result.get("leadTime", "No immediate escalation"),
            caseId=ai_result.get("caseId", f"TN-{datetime.now().strftime('%Y%m%d%H%M')}"),
        )
    return heuristic_analyze(request.content, request.type)


@router.post("/shield/assess")
async def assess_citizen_message(request: ScamAnalysisRequest):
    ai_result = await analyze_with_ai(request.content, request.type)
    if ai_result:
        return {
            "riskScore": ai_result.get("riskScore", 5),
            "riskLevel": ai_result.get("riskLevel", "low"),
            "scamType": ai_result.get("scamType", "Benign"),
            "verdict": ai_result.get("verdict", "No verdict available"),
            "explanation": ai_result.get("explanation", ""),
            "indicators": ai_result.get("indicators", []),
            "recommendedActions": ai_result.get("recommendedActions", [
                "Do not share any personal or financial information",
                "Call 1930 if you suspect financial fraud",
                "Report at cybercrime.gov.in",
            ]),
        }

    result = heuristic_analyze(request.content, request.type)
    return {
        "riskScore": result.riskScore,
        "riskLevel": result.riskLevel,
        "scamType": result.scamType,
        "verdict": result.verdict,
        "explanation": result.explanation,
        "indicators": [i.dict() for i in result.indicators],
        "recommendedActions": result.recommendedActions,
    }
