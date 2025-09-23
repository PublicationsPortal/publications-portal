import os

ORGANIZATION_ID = "60159918"
ENVIRONMENT = "development"

INVENIO_BASE_URL = os.getenv("INVENIO_BASE_URL", "https://127.0.0.1:5000/api/")
INVENIO_KEY = os.getenv("INVENIO_KEY", "") # TODO: The API key is not effective. API works without it. API Key should be enforced. 

INVENIO_SEARCH_SIZE = 2000
INVENIO_PER_PAGE_SIZE = 100
INVENIO_FORCE_RECORDS_FETCH = True

CHECK_DUPLICATES = True

INVENIO_FORCE_RECORDS_FETCH = True

OPENAI_ENDPOINT = os.getenv("OPENAI_ENDPOINT", "https://ess-ai.openai.azure.com/")
OPENAI_MODEL_NAME = os.getenv("OPENAI_MODEL_NAME", "gpt-4.1")
OPENAI_DEPLOYMENT = os.getenv("OPENAI_DEPLOYMENT", "gpt-4.1")

OPENAI_SUBSCRIPTION_KEY = os.getenv("OPENAI_SUBSCRIPTION_KEY", "")
OPENAI_API_VERSION = os.getenv("OPENAI_API_VERSION", "2024-12-01-preview")