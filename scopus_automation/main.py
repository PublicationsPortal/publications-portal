from elsapy.elsclient import ElsClient # TODO: Fix import linting
from elsapy.elssearch import ElsSearch
from elsapy.elsdoc import AbsDoc # TODO: Remove when not needed
from utils import get_creators, get_draft_record_payload
from invenio_rdm import InvenioRDM
from constants import SCOPUS_API_KEY, IS_DEV, INVENIO_FORCE_RECORDS_FETCH, CHECK_DUPLICATES, SCOPUS_SEARCH_GET_ALL
print("Starting...")
import sys
import json
from constants import SCOPUS_SEARCH, INVENIO_BASE_URL, INVENIO_KEY

invenio_rdm = InvenioRDM(INVENIO_BASE_URL, INVENIO_KEY)

invenio_rdm.fetch_records("", force_fetch=INVENIO_FORCE_RECORDS_FETCH)
scopus_client = ElsClient(SCOPUS_API_KEY)

my_doc_search = ElsSearch(SCOPUS_SEARCH, 'scopus') 
my_doc_search.execute(scopus_client, get_all=SCOPUS_SEARCH_GET_ALL)
scopus_results = my_doc_search.results
print(f"Total Scopus Results: {len(scopus_results)}")
total_records_created = 0

for scopus_result in scopus_results:
  title = scopus_result['dc:title']
  doi = scopus_result.get('prism:doi')
  indentifier = scopus_result['dc:identifier']
  scopus_id = indentifier.split(":")[1]
  
  if CHECK_DUPLICATES and invenio_rdm.check_record_exists(doi, title):
    print("Record already exists in Invenio RDM.")
    continue

  print("Record does not exist in Invenio RDM. Creating draft record.")
  
  scp_doc = AbsDoc(scp_id = scopus_id)
  if scp_doc.read(scopus_client):
    authors = scp_doc.data['authors']['author'] if 'author' in scp_doc.data['authors'] else []
    affiliations = scp_doc.data['affiliation']

    creators = get_creators(authors, affiliations)
    
    draft_record_payload = get_draft_record_payload(scp_doc.data)
    
    # draft_record_payload = get_draft_record_payload(
    #   scopus_result["prism:aggregationType"], 
    #   creators,
    #   scp_doc.title,
    #   scp_doc.data['coredata']['dc:description'] if 'dc:description' in scp_doc.data['coredata'] else "",
    #   scp_doc.data['coredata']['prism:coverDate'] if 'prism:coverDate' in scp_doc.data['coredata'] else "",
    #   scp_doc.data['coredata']['dc:publisher'] if 'dc:publisher' in scp_doc.data['coredata'] else "",
    #   [auth_keyword['$'] for auth_keyword in scp_doc.data['authkeywords']['author-keyword']] if ('authkeywords' in scp_doc.data and scp_doc.data['authkeywords'] is not None)  else [],
    #   doi=scp_doc.data['coredata']['prism:doi'] if 'prism:doi' in scp_doc.data['coredata'] else "",
    # )
    print(draft_record_payload)
    create_draft_record_response = invenio_rdm.create_draft_record(draft_record_payload)
    total_records_created += 1
    print("Draft Record Created Successfully.")
  else:
    print ("Read document failed.")