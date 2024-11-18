from elsapy.elsclient import ElsClient # TODO: Fix import linting
from elsapy.elssearch import ElsSearch
from elsapy.elsdoc import AbsDoc # TODO: Remove when not needed
import requests
import json
from utils import get_creators, get_draft_record_payload

class InvenioRDM:
  __search_size = 3000
  
  def __init__(self, base_url, token):
    self.base_url = base_url
    self.token = token
    self.headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": f"Bearer {token}"
    }
    self.search_results = []
  
  def search(self, query = "", size=__search_size):
    response = requests.get(f"{self.base_url}/records", headers=self.headers, params={"q": query, "size": size}, verify=False) # TODO: Remove verify=False
    if response.status_code != 200:
      raise Exception(f"Failed to search records. Status code: {response.status_code}")
    
    response_json = response.json()
    self.search_results = response_json["hits"]["hits"]
    return self.search_results
    
  def check_record_exists(self, title):
    if len(self.search_results) == 0:
      raise Exception("No search results found.")
    
    
    for record in self.search_results:
      if record["metadata"]["title"] == title:
        return True
    return False
  
  def create_draft_record(self, payload):
    response = requests.post(f"{self.base_url}/records", headers=self.headers, data=json.dumps(payload), verify=False) # TODO: Remove verify=False
    
    if response.status_code != 201:
      raise Exception(f"Failed to create draft record. Status code: {response.status_code}")
    
    return response.json()

print("Starting...")

# invenio_rdm_base_url = "https://publications.ess.eu/api"
prod_api_key='auxH0mudobN0wgr4Gefgtjpc9jRo0XPtaOu8LkZxLDiT3UGTt55mbRGtJSvD'
# invenio_rdm_base_url = "https://127.0.0.1:5000/api"
invenio_rdm_base_url = "https://publications-portal.dev-sims.ess.eu/api/"
dev_api_key='9sYFmscf0c2jlnaJFF2txClyRlHVwFkvYPzKFEUvr3vbLysoDRqQn8CX3r0n'

api_key = dev_api_key

invenio_rdm = InvenioRDM(invenio_rdm_base_url, api_key) # TODO: Move to config file # TODO: The API key is not effective. API works without it. API Key should be enforced. 

my_client = ElsClient("6858f028b3dea19f44e71ee38f8abeee") # TODO: Move to config file
my_doc_search = ElsSearch('AF-ID(60159918)', 'scopus') # TODO: Move to config file
my_doc_search.execute(my_client, get_all=False)

scopus_results = my_doc_search.results

for scopus_result in scopus_results[:1]:
  indentifier = scopus_result['dc:identifier']
  scopus_id = indentifier.split(":")[1]
  scp_doc = AbsDoc(scp_id = scopus_id)
  if scp_doc.read(my_client):
    authors = scp_doc.data['authors']['author']
    affiliations = scp_doc.data['affiliation']

    creators = get_creators(authors, affiliations)

    draft_record_payload = get_draft_record_payload(
      scopus_result["prism:aggregationType"], 
      creators,
      scp_doc.title,
      scp_doc.data['coredata']['dc:description'],
      scp_doc.data['coredata']['prism:coverDate'],
      scp_doc.data['coredata']['dc:publisher'],
      [auth_keyword['$'] for auth_keyword in scp_doc.data['authkeywords']['author-keyword']],
      scp_doc.data['coredata']['prism:doi']
    )
    
    create_draft_record_response = invenio_rdm.create_draft_record(draft_record_payload)
    print(create_draft_record_response)
    print("Draft Record Created Successfully.")
  else:
    print ("Read document failed.")