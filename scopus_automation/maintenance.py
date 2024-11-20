from invenio_rdm import InvenioRDM
from constants import IS_DEV, INVENIO_BASE_URL, INVENIO_KEY

invenio_rdm = InvenioRDM(INVENIO_BASE_URL, INVENIO_KEY)
invenio_rdm.delete_all_draft_records()