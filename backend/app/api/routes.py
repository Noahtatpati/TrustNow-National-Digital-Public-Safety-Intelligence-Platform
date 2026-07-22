from datetime import datetime
import json
import random

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


def heuristic_analyze(content: str, input_type: str) -> ScamAnalysisResult:
    content_lower = content.lower()

    indicators = [
        {"name": "Urgency Language", "found": any(w in content_lower for w in ["immediately", "urgent", "within", "asap", "hurry", "now", "immediate action", "act now", "limited time", "expires"]), "description": "Scammers create false urgency to prevent rational thinking"},
        {"name": "Authority Impersonation", "found": any(w in content_lower for w in ["cbi", "police", "court", "judge", "supreme", "high court", "customs", "enforcement", "income tax", "edi", "government", "rbi", "sebi", "trai"]), "description": "Impersonating government or law enforcement agencies"},
        {"name": "Payment Demand", "found": any(w in content_lower for w in ["pay", "transfer", "send", "upi", "bank account", "deposit", "fine", "fee", "payment", "receive money", "send money"]), "description": "Request for money or financial information"},
        {"name": "Threat Language", "found": any(w in content_lower for w in ["arrest", "warrant", "case", "jail", "illegal", "locked", "freeze", "blocked", "legal action", "notice", "summon"]), "description": "Threats of legal action or account freezing"},
        {"name": "Personal Info Request", "found": any(w in content_lower for w in ["otp", "password", "aadhaar", "pan", "account number", "cv", "login", "credential", "verify now", "update kyc"]), "description": "Request for sensitive personal information"},
        {"name": "Suspicious Link / URL", "found": any(w in content_lower for w in ["http", "bit.ly", "tinyurl", "click here", "link", "trackid", "redirect"]), "description": "Message contains suspicious links that may lead to phishing sites"},
        {"name": "Account Compromise Language", "found": any(w in content_lower for w in ["your account", "suspended", "deactivated", "unusual activity", "security alert", "login attempt", "unauthorized", "breach"]), "description": "Claims about account compromise to create panic"},
        {"name": "Spoofed Sender Pattern", "found": input_type == "phone" and len(content) > 12 and content.startswith("+"), "description": "International or spoofed caller ID pattern"},
    ]

    found_count = sum(1 for i in indicators if i["found"])
    total = len(indicators)

    if found_count == 0:
        risk_score = 5
        risk_level = "low"
        scam_type = "Benign"
        verdict = "Appears safe — exercise normal caution"
        lead_time = "No immediate escalation"
        suggested_escalation = "Continue normal caution and monitor for follow-up requests."
        explanation = "No scam indicators were detected. The message does not match known scam language patterns."
    else:
        raw_score = (found_count / total) * 100
        risk_score = min(99, int(raw_score) + 10)
        if risk_score >= 65:
            risk_level = "high"
            scam_type = "Digital Arrest Scam"
            verdict = "Likely a scam — do not engage or share any information"
            lead_time = "3-5 min before transfer"
            suggested_escalation = "Escalate to the cybercrime cell and telecom provider, preserve call metadata, and prepare an MHA-ready intelligence package."
            explanation = "The message contains multiple high-signal scam indicators, including authority impersonation, urgency, and payment demand language. This pattern closely aligns with digital arrest scam playbooks."
        elif risk_score >= 35:
            risk_level = "medium"
            scam_type = "Suspicious Communication"
            verdict = "Suspicious — verify the caller independently before responding"
            lead_time = "1-2 min before transfer"
            suggested_escalation = "Flag the report for review by the fraud desk and ask the caller to verify through an official channel."
            explanation = "Several warning signals were detected, but the evidence is not yet strong enough to confirm a full scam packet."
        else:
            risk_level = "low"
            scam_type = "Benign"
            verdict = "Appears safe — exercise normal caution"
            lead_time = "No immediate escalation"
            suggested_escalation = "Continue normal caution and monitor for follow-up requests."
            explanation = "Minor signals detected but overall the message appears low risk."

    evidence = [
        {"label": item["name"], "detail": item["description"], "weight": 2 if item["found"] else 1}
        for item in indicators
        if item["found"]
    ]
    if not evidence:
        evidence = [{"label": "No strong signal", "detail": "No dominant scam markers were detected in the supplied input.", "weight": 1}]

    confidence = min(98, max(60, risk_score - 5 + min(15, found_count * 2)))
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
