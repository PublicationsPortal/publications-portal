from invenio_rdm import InvenioRDM
from constants import INVENIO_BASE_URL, INVENIO_KEY, INVENIO_FORCE_RECORDS_FETCH

invenio_rdm = InvenioRDM(INVENIO_BASE_URL, INVENIO_KEY)
invenio_rdm.fetch_records("", force_fetch=INVENIO_FORCE_RECORDS_FETCH)