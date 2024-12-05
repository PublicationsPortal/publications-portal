import yaml
from constants import DEFAULT_COPYRIGHTS, DEFAULT_LANGUAGE
import datetime

def ensure_array_of_dicts(input_data):
    if isinstance(input_data, dict):
        return [input_data]
    elif isinstance(input_data, list) and all(isinstance(item, dict) for item in input_data):
        return input_data
    else:
        raise ValueError("Input must be a dictionary or a list of dictionaries.")

def get_creators(authors, affiliations):
  authors = ensure_array_of_dicts(authors)
  affiliations = ensure_array_of_dicts(affiliations)

  creators = []
  for author in authors:
    author_affiliations = ensure_array_of_dicts(author.get('affiliation', []))
    
    author_affiliations_info = []
    for author_affiliation in author_affiliations:
      matching_affiliation = next((affiliation for affiliation in affiliations if affiliation["@id"] == author_affiliation['@id']), {})
      if matching_affiliation is not None:
        author_affiliations_info.append({"name": matching_affiliation.get('affilname')})

    author_preferred_name = author.get('preferred-name', {})
  
    creator = {
        "affiliations": author_affiliations_info,
        "person_or_org": {
            "family_name": author_preferred_name.get('ce:surname', "Unknown"),
            "given_name": author_preferred_name.get('ce:given-name', "Unknown"),
            "name": author_preferred_name.get('ce:indexed-name', "Unknown"),
            # "identifiers": [{
            #     "identifier": author.get('@auid', "Unknown"),
            #     "scheme": "orcid"
            # }], # TODO: This needs to be fetched from the ORCID API
            "type": "personal"
        }
    }
    creators.append(creator)
  return creators

scopus_type_rdm_type_mapper = {
  "Book": "publication-book",
  "Journal": "publication-article",
  "Conference Proceeding": "publication-conferenceproceeding"
} # todo: This needs to be updated.

def get_doi(doi):
  return {
    "identifier": doi,
    "scheme": "doi"
  }
  
def get_doi(doi):
  return {
    "identifier": doi,
    "scheme": "doi"
  }
  
def get_doi(doi):
  return {
    "identifier": doi,
    "scheme": "doi"
  }

def get_identifiers(scopus_data):
  doi = scopus_data['coredata']['prism:doi'] if 'prism:doi' in scopus_data['coredata'] else None
  isbn = scopus_data["coredata"]["prism:isbn"] if "prism:isbn" in scopus_data["coredata"] else None
  issn = scopus_data["coredata"]["prism:issn"][:8] if "prism:issn" in scopus_data["coredata"] else None
  
  identifiers = []
  if doi is not None:
    identifiers.append({
      "identifier": doi,
      "scheme": "doi"
    })
  
  if isbn is not None:
    identifiers.append({
      "identifier": isbn,
      "scheme": "isbn"
    })
  
  if issn is not None:
    identifiers.append({
      "identifier": issn,
      "scheme": "issn"
    })
  return identifiers

def get_languages(languages):
  # It is not a good idea to open the file everytime. Instead create a class and open the file only once
  with open('languages.yaml', 'r') as stream:
    ess_languages = yaml.safe_load(stream)
  
  formatted_languages = []
  
  for language in languages:
    found_language = next((language for language in ess_languages if language['title']['en'] == 'English'), None)
    
  if found_language is not None:
    formatted_languages.append(
      {
        "id": found_language["id"],
        "title": {
          "en": found_language["title"]["en"]
        }
      }
    )

  return formatted_languages

def get_imprint(scopus_data):
  title = scopus_data["coredata"]["prism:publicationName"] if "prism:publicationName" in scopus_data["coredata"] else ""
  isbn = scopus_data["coredata"]["prism:isbn"] if "prism:isbn" in scopus_data["coredata"] else ""
  return {
    "title": title,
    "isbn": isbn,
    "pages": "-"
  }
  
def get_journal(scopus_data):
  title = scopus_data["coredata"]["prism:publicationName"] if "prism:publicationName" in scopus_data["coredata"] else ""
  volume = scopus_data["coredata"]["prism:volume"] if "prism:volume" in scopus_data["coredata"] else ""
  issn = scopus_data["coredata"]["prism:issn"][:8] if "prism:issn" in scopus_data["coredata"] else ""
  issue_identifier = scopus_data["coredata"]["prism:issueIdentifier"] if "prism:issueIdentifier" in scopus_data["coredata"] else "-"
  pageRange = scopus_data["coredata"]["prism:pageRange"] if "prism:pageRange" in scopus_data["coredata"] else ""
  
  return {
    "title": title,
    "issue": issue_identifier,
    "volume": volume,
    "pages": pageRange,
    "issn": issn
  }

def get_meeting(scopus_data):
  title = ""
  place = ""
  dates = ""
  website = ""
  
  try:
    confevent = scopus_data["item"]["bibrecord"]["head"]["source"]["additional-srcinfo"]["conferenceinfo"]["confevent"]
  except:
    pass
  
  try:
    title = confevent["confname"]
  except:
    pass
  
  try:
    conflocation = confevent["conflocation"]
    venue = conflocation.get("venue", "")
    city = conflocation.get("city", "")
    country = conflocation.get("@country", "")
    
    venue = f"{venue}, " if venue is not "" else ""
    city = f"{city}, " if city is not "" else ""
    country = f"{country}" if country is not "" else ""
    
    place = f"{venue}{city}{country}"
  except:
    pass
  
  try:
    confdate = confevent["confdate"]
    startdate = datetime.datetime(int(confdate["startdate"]["@year"]), int(confdate["startdate"]["@month"]), int(confdate["startdate"]["@day"]))
    enddate = datetime.datetime(int(confdate["enddate"]["@year"]), int(confdate["enddate"]["@month"]), int(confdate["enddate"]["@day"]))
    
    dates = f"{startdate.strftime('%d-%B-%Y')} through {enddate.strftime('%d-%B-%Y')}"
  except:
    pass
  
  try:
    website = confevent["confURL"]
  except:
    pass
  
  return {
    "dates": dates,
    "place": place,
    "title": title,
    "website": website
  }

def get_custom_fields(scopus_data, rdm_resource_type):
  custom_fields = {}
  
  if rdm_resource_type == "publication-article":
    custom_fields["journal:journal"] = get_journal(scopus_data)
  
  elif rdm_resource_type == "publication-conferenceproceeding":
    custom_fields["meeting:meeting"] = get_meeting(scopus_data)
    custom_fields["journal:journal"] = get_journal(scopus_data)
  
  elif rdm_resource_type == "publication-book":
    custom_fields["imprint:imprint"] = get_imprint(scopus_data)
  
  return custom_fields

def get_references(scopus_data):
  try:
    scopus_references = scopus_data["item"]["bibrecord"]["tail"]["bibliography"]["reference"]
    return [ 
            {
              "identifier": "", 
              "scheme": "", 
              "reference": scopus_reference["ref-fulltext"] if "ref-fulltext" in scopus_reference else ""
            } 
            for scopus_reference in scopus_references
          ]
  except:
    return []

def get_keywords(scopus_data):
  auth_keywords = []
  auth_keywords_from_citation = []
  try:
    auth_keywords = [auth_keyword['$'] for auth_keyword in scopus_data['authkeywords']['author-keyword']]
  except:
    pass
  
  try:
    auth_keywords_from_citation = [auth_keyword['$'] for auth_keyword in scopus_data['item']['bibrecord']['head']['citation-info']['author-keywords']['author-keyword']]
  except:
    pass

  return [{'subject': keyword} for keyword in list(set(auth_keywords + auth_keywords_from_citation))]

def get_draft_record_payload(scopus_data):
  authors = scopus_data['authors']['author'] if 'author' in scopus_data['authors'] else []
  affiliations = scopus_data['affiliation']
    
  resource_type = scopus_data['coredata']["prism:aggregationType"]
  creators = get_creators(authors, affiliations)
  title = scopus_data['coredata']['dc:title'] if 'dc:title' in scopus_data['coredata'] else ""
  description = scopus_data['coredata']['dc:description'] if 'dc:description' in scopus_data['coredata'] else ""
  publication_date = scopus_data['coredata']['prism:coverDate'] if 'prism:coverDate' in scopus_data['coredata'] else ""
  publisher = scopus_data['coredata']['dc:publisher'] if 'dc:publisher' in scopus_data['coredata'] else ""
  languages = []
  
  rdm_resource_type = scopus_type_rdm_type_mapper[resource_type]
  new_draft_record_payload = {
    "access": {
      "files": "public",
      "record": "public"
    },
    "files": {
      "enabled": False
    },
    "metadata": {
      "creators": creators,
      "description": description,
      "identifiers": get_identifiers(scopus_data),
      "publication_date": publication_date,
      "publisher": publisher,
      "resource_type": {
        "id": rdm_resource_type
      },
      "rights": [ DEFAULT_COPYRIGHTS ],
      "subjects": get_keywords(scopus_data),
      "title": title,
      "version": "v1",
      "languages": [ DEFAULT_LANGUAGE ],
      "references": get_references(scopus_data)
    },
    "custom_fields": get_custom_fields(scopus_data, rdm_resource_type),
    "pids": {}
  }
  
  return new_draft_record_payload
  