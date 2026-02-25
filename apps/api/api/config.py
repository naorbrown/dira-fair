from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///data/dira-fair.db"
    cbs_api_base: str = "https://apis.cbs.gov.il/series/data/list"
    nadlan_api_base: str = "https://www.nadlan.gov.il/Nadlan.REST/Main/GetAssestAndDeals"
    yad2_base_url: str = "https://www.yad2.co.il/realestate/rent"
    scrape_interval_hours: int = 24
    proxy_url: str | None = None
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_prefix": "DIRA_"}


settings = Settings()
