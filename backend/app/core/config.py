import os


class Settings:
    app_name: str = "TrustNow API"
    debug: bool = os.getenv("DEBUG", "True").lower() == "true"
    ai_api_key: str = os.getenv("AI_API_KEY", "")
    ai_api_url: str = os.getenv("AI_API_URL", "https://models.inference.ai.azure.com/chat/completions")
    ai_model: str = os.getenv("AI_MODEL", "gpt-4o")


settings = Settings()
