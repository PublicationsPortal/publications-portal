import requests
import json
import math
import html
import time

from constants import INVENIO_SEARCH_SIZE, INVENIO_PER_PAGE_SIZE
from core import get_advanced_summary_abstract, get_simple_summary_abstract

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
      response = requests.get(f"{self.base_url}/records", headers=self.headers, params={"q": query, "page": page+1, "size": per_page_size}, verify=False) # TODO: Remove verify=False
      if response.status_code != 200:
        print (response.text)
        raise Exception(f"Failed to search records. Status code: {response.status_code}")
    
      response_json = response.json()
      if len(response_json["hits"]["hits"]) == 0:
        break
      
      overall_records.extend(response_json["hits"]["hits"]) 
      
    self.published_records = overall_records
    self.all_records.extend(self.published_records)
    
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
      response = requests.get(f"{self.base_url}/user/records", headers=self.headers, params={"q": query, "page": page+1, "size": per_page_size, "is_published": "false"}, verify=False)
      if response.status_code != 200:
        raise Exception(f"Failed to search drafts. Status code: {response.status_code}")
    
      response_json = response.json()
      
      if len(response_json["hits"]["hits"]) == 0:
        break
      
      overall_records.extend(response_json["hits"]["hits"])
      
    self.draft_records = overall_records
    self.all_records.extend(self.draft_records)
    
    return self.draft_records
  
  def create_draft(self, id):
    print(f"{self.base_url}/records/{id}/draft")
    print(self.headers)
    
    for attempt in range(3):
      response = requests.post(f"{self.base_url}/records/{id}/draft", headers=self.headers, verify=False) # TODO: Remove verify=False
      
      if response.status_code == 201:
        return
      elif response.status_code >= 500 and attempt < 2:
        wait_time = 5 if attempt == 0 else 10
        print(f"Server error {response.status_code}. Retrying in {wait_time} seconds... (attempt {attempt+1}/3)")
        time.sleep(wait_time)
      else:
        raise Exception(f"Failed to create draft record. Status code: {response.status_code}. Status Text: {response.text}")

  def edit_record(self, id, payload):
    for attempt in range(3):
      response = requests.put(f"{self.base_url}/records/{id}/draft", headers=self.headers, data=json.dumps(payload), verify=False) # TODO: Remove verify=False
      
      if response.status_code == 200:
        print(response.json())
        return response.json()
      elif response.status_code >= 500 and attempt < 2:
        wait_time = 5 if attempt == 0 else 10
        print(f"Server error {response.status_code}. Retrying in {wait_time} seconds... (attempt {attempt+1}/3)")
        time.sleep(wait_time)
      else:
        raise Exception(f"Failed to edit published record. Status code: {response.status_code}. Status Text: {response.text}")
  
  def publish_record(self, id):
    for attempt in range(3):
      response = requests.post(f"{self.base_url}/records/{id}/draft/actions/publish", headers=self.headers, verify=False) # TODO: Remove verify=False
      
      if response.status_code == 202:
        return
      elif response.status_code >= 500 and attempt < 2:
        wait_time = 5 if attempt == 0 else 10
        print(f"Server error {response.status_code}. Retrying in {wait_time} seconds... (attempt {attempt+1}/3)")
        time.sleep(wait_time)
      else:
        raise Exception(f"Failed to publish record. Status code: {response.status_code}. Status Text: {response.text}")
  
  def fetch_records(self, query = "", total_size=__search_size, force_fetch=False):
    self.fetch_published_records(query, total_size, force_fetch=force_fetch)
    self.fetch_draft_records(query, total_size, force_fetch=force_fetch)

    for record in self.published_records:
      simple_abstract_summary = record.get("custom_fields", {}).get("summarization:summarization", {}).get("simple",  "")
      advanced_abstract_summary = record.get("custom_fields", {}).get("summarization:summarization", {}).get("advanced", "")
      description = record.get("metadata", {}).get("description", "")
      
      if not simple_abstract_summary or not advanced_abstract_summary:
        advanced_summary_abstract = get_advanced_summary_abstract(description)
        simple_summary_abstract = get_simple_summary_abstract(description)
        print("Abstract Summary: ", record["id"])
        print("Advanced Summary: ", advanced_summary_abstract)
        print("Simple Summary: ", simple_summary_abstract)
        self.create_draft(record["id"])
        if "custom_fields" not in record:
            record["custom_fields"] = {}
        if "summarization:summarization" not in record["custom_fields"]:
            record["custom_fields"]["summarization:summarization"] = {}
        record["custom_fields"]["summarization:summarization"]["simple"] = simple_summary_abstract
        record["custom_fields"]["summarization:summarization"]["advanced"] = advanced_summary_abstract
        self.edit_record(record["id"], record)
        self.publish_record(record["id"])
