IS_DEV = True



ORGANIZATION_ID = "60159918"
# SCOPUS_SEARCH = f"( AF-ID ( {ORGANIZATION_ID} ) ) AND ( Analyzing Complex Systems with Cascades Using Continuous-Time Bayesian Networks )"
SCOPUS_SEARCH = f"( AF-ID ( {ORGANIZATION_ID} ) )"
SCOPUS_API_KEY = "6858f028b3dea19f44e71ee38f8abeee"
SCOPUS_SEARCH_GET_ALL = False
ENVIRONMENT = "development"

INVENIO_DEV_BASE_URL = "https://publications-portal.dev-sims.ess.eu/api/"
INVENIO_PROD_KEY = 'auxH0mudobN0wgr4Gefgtjpc9jRo0XPtaOu8LkZxLDiT3UGTt55mbRGtJSvD'

INVENIO_DEV_KEY = '9sYFmscf0c2jlnaJFF2txClyRlHVwFkvYPzKFEUvr3vbLysoDRqQn8CX3r0n'
INVENIO_PROD_BASE_URL = "https://publications.ess.eu/api/"

INVENIO_BASE_URL = INVENIO_DEV_BASE_URL if IS_DEV else INVENIO_PROD_BASE_URL
INVENIO_KEY = INVENIO_DEV_KEY if IS_DEV else INVENIO_PROD_KEY # TODO: The API key is not effective. API works without it. API Key should be enforced. 

INVENIO_SEARCH_SIZE = 2000
INVENIO_PER_PAGE_SIZE = 50
INVENIO_FORCE_RECORDS_FETCH = False

CHECK_DUPLICATES = False


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