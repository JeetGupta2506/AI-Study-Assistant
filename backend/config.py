from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    CORS_ORIGINS: str = "http://localhost:3000"
    MODEL_NAME: str = "gemini-pro"
    
    class Config:
        env_file = ".env"

settings = Settings()