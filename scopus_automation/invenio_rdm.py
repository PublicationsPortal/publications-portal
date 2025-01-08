import requests
import json
import math
import html

from constants import INVENIO_SEARCH_SIZE, INVENIO_PER_PAGE_SIZE

class InvenioRDM:
  __search_size = INVENIO_SEARCH_SIZE
  __per_page_size = INVENIO_PER_PAGE_SIZE
  
  def __init__(self, base_url, token):
    self.base_url = base_url
    self.token = token
    self.headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": f"Bearer {token}"
    }
    self.published_records = []
    self.draft_records = []
    self.all_records = []
  
  def fetch_published_records(self, query = "", total_page_size = __search_size, per_page_size=__per_page_size, force_fetch=False):
    if not force_fetch:
      try: 
        with open("published_records.json", "r") as outfile:
          self.published_records = json.load(outfile)
          self.all_records.extend(self.published_records)
        if len(self.published_records) > 0:
          return self.published_records
      except:
        pass
    
    overall_records = []
    for page in range(math.ceil(total_page_size/per_page_size)):
      print(f"=============Fetching Published Data - Page {page + 1}=================")
      print({"q": query, "page": page+1, "size": per_page_size})
      response = requests.get(f"{self.base_url}/records", headers=self.headers, params={"q": query, "page": page+1, "size": per_page_size}, verify=False) # TODO: Remove verify=False
      if response.status_code != 200:
        print (response.text)
        raise Exception(f"Failed to search records. Status code: {response.status_code}")
    
      response_json = response.json()
      if len(response_json["hits"]["hits"]) == 0:
        print("End of records...................")
        break
      
      overall_records.extend(response_json["hits"]["hits"]) 
      
    self.published_records = overall_records
    self.all_records.extend(self.published_records)
    
    with open("published_records.json", "w") as f:
      f.write(json.dumps(self.published_records))
    
    return self.published_records
  
  def fetch_draft_records(self, query = "",  total_page_size = __search_size, per_page_size=__per_page_size, force_fetch=False):
    if not force_fetch:
     
      try: 
        with open("draft_records.json", "r") as outfile:
          self.draft_records = json.load(outfile)
          self.all_records.extend(self.draft_records)
        if len(self.draft_records) > 0:
          return self.draft_records
      except:
        pass
    
    overall_records = []
    for page in range(math.ceil(total_page_size/per_page_size)):
      print(f"=============Fetching Draft Data - Page {page + 1}=================")
      print({"q": query, "page": page+1, "size": per_page_size})
      
      response = requests.get(f"{self.base_url}/user/records", headers=self.headers, params={"q": query, "page": page+1, "size": per_page_size, "is_published": "false"}, verify=False)
      if response.status_code != 200:
        print (response.text)
        raise Exception(f"Failed to search drafts. Status code: {response.status_code}")
    
      response_json = response.json()
      
      if len(response_json["hits"]["hits"]) == 0:
        break
      
      overall_records.extend(response_json["hits"]["hits"])
      
    self.draft_records = overall_records
    self.all_records.extend(self.draft_records)
    
    with open("draft_records.json", "w") as f:
      f.write(json.dumps(self.draft_records))
      
    return self.draft_records
  
  def fetch_records(self, query = "", total_size=__search_size, force_fetch=False):
    self.fetch_published_records(query, total_size, force_fetch=force_fetch)
    self.fetch_draft_records(query, total_size, force_fetch=force_fetch)
  
  def check_record_exists(self, doi, title):
    if len(self.all_records) == 0:
      raise Exception("No records found in Publication Portal.")
    
    for record in self.all_records:
      try:
        metadata = record["metadata"]
        # Compare DOI
        if "identifiers" in metadata and next((doi for identifier in metadata["identifiers"] if identifier["scheme"] == "doi" and identifier["identifier"] == doi), None) is not None:
          return True
        
        # Compare title
        if metadata["title"] == html.unescape(title.replace("<inf>", "").replace("</inf>", "").replace("<sup>", "").replace("</sup>", "")):
          return True
      except Exception as e:
        print(e)
        print("Error while checking ESS record.")
        break
    
    return False
        
  def create_draft_record(self, payload):
    response = requests.post(f"{self.base_url}/records", headers=self.headers, data=json.dumps(payload), verify=False) # TODO: Remove verify=False
    
    if response.status_code != 201:
      raise Exception(f"Failed to create draft record. Status code: {response.status_code}. Status Text: {response.text}")
    
    return response.json()
  
  def delete_draft_record(self, record_id):
    requests.delete(f"{self.base_url}/records/{record_id}/draft", headers=self.headers, verify=False)

  def delete_all_draft_records(self):
    self.fetch_draft_records(force_fetch=True)
    for record in self.draft_records:
      self.delete_draft_record(record["id"])
      print(f"Draft record {record['metadata']['title']} deleted successfully.")
    
    print("All draft records deleted successfully.")