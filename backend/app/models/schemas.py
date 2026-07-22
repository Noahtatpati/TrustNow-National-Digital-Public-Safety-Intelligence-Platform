from typing import Optional
from pydantic import BaseModel


class Brief(BaseModel):
    headline: str
    summary: str
    category: str
    date: str


class TodaysBriefResponse(BaseModel):
    briefs: list[Brief]


class Indicator(BaseModel):
    label: str
    value: str
    trend: str


class IndicatorsResponse(BaseModel):
    indicators: list[Indicator]


class Alert(BaseModel):
    title: str
    severity: str
    region: str


class AlertsResponse(BaseModel):
    alerts: list[Alert]


class Threat(BaseModel):
    id: str
    lat: float
    lng: float
    title: str
    severity: str
    region: str


class ScamAnalysisRequest(BaseModel):
    type: str = "phone"
    content: str


class ScamIndicator(BaseModel):
    name: str
    found: bool
    description: str


class ScamEvidence(BaseModel):
    label: str
    detail: str
    weight: int


class ScamAnalysisResult(BaseModel):
    riskScore: int
    riskLevel: str
    indicators: list[ScamIndicator]
    scamType: str
    recommendedActions: list[str]
    verdict: str
    confidence: int
    explanation: str
    evidence: list[ScamEvidence]
    suggestedEscalation: str
    leadTime: str
    caseId: str


class PhoneLookupRequest(BaseModel):
    number: str


class PhoneLookupResult(BaseModel):
    number: str
    location: str
    carrier: str
    lineType: str
    spamScore: int
    reportCount: int
    country: str
    isValid: bool


class EmailLookupRequest(BaseModel):
    email: str


class EmailLookupResult(BaseModel):
    email: str
    isValid: bool
    isFreeProvider: bool
    domain: str


class UrlLookupRequest(BaseModel):
    url: str


class UrlLookupResult(BaseModel):
    url: str
    score: int
    riskLevel: str
    recommendation: str
    usesHttps: bool
    dnsExists: bool
    hasIp: bool
    suspiciousTld: Optional[str]
    recentlyCreated: Optional[bool]
    sslValid: Optional[bool]
    domainAgeDays: Optional[int]


class UpiLookupRequest(BaseModel):
    upiId: str


class UpiLookupResult(BaseModel):
    upiId: str
    isValid: bool
    provider: str
    riskLevel: str
    spamScore: int
    notes: list[str]


class IpLookupRequest(BaseModel):
    ip: str


class IpLookupResult(BaseModel):
    ip: str
    city: str
    region: str
    country: str
    countryCode: str
    latitude: float
    longitude: float
    isp: str
    timezone: str
    isVpn: bool
    riskScore: int


class CounterfeitScanRequest(BaseModel):
    imageData: str


class CounterfeitCheck(BaseModel):
    id: str
    label: str
    description: str
    passed: bool
    details: str


class CounterfeitScanResult(BaseModel):
    isAuthentic: bool
    passedCount: int
    failedCount: int
    checks: list[CounterfeitCheck]
    explanation: str
    aiUsed: bool
