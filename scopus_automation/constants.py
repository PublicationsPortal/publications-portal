import os

ORGANIZATION_ID = "60159918"
# SCOPUS_SEARCH = f"( AF-ID ( {ORGANIZATION_ID} ) ) AND ( H- and proton beam loss comparison at sns superconducting linac )"
SCOPUS_SEARCH = f"( AF-ID ( {ORGANIZATION_ID} ) )"
SCOPUS_API_KEY = os.getenv("SCOPUS_API_KEY", "7f59af901d2d86f78a1fd60c1bf9426a")
SCOPUS_SEARCH_GET_ALL = True
ENVIRONMENT = "development"


INVENIO_BASE_URL = os.getenv("INVENIO_BASE_URL", "https://publications-portal.dev-sims.ess.eu/api/")
INVENIO_KEY = os.getenv("INVENIO_KEY", "9sYFmscf0c2jlnaJFF2txClyRlHVwFkvYPzKFEUvr3vbLysoDRqQn8CX3r0n") # TODO: The API key is not effective. API works without it. API Key should be enforced. 

INVENIO_SEARCH_SIZE = 2000
INVENIO_PER_PAGE_SIZE = 50
INVENIO_FORCE_RECORDS_FETCH = True

CHECK_DUPLICATES = True


DEFAULT_COPYRIGHTS = {
  "id": "cc-by-4.0",
  "title": {
    "en": "Creative Commons Attribution 4.0 International"
  },
  "description": {
    "en": "The Creative Commons Attribution license allows re-distribution and re-use of a licensed work on the condition that the creator is appropriately credited."
  },
  "icon": "cc-by-icon",
  "props": {
    "url": "https://creativecommons.org/licenses/by/4.0/legalcode",
    "scheme": "spdx"
  }
}

DEFAULT_LANGUAGE = {
  "id": "eng",
  "title": {
    "en": "English"
  }
}