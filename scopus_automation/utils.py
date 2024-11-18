import yaml

def get_creators(authors, affiliations):
  creators = []
  for author in authors:
    affiliation = next((affiliation for affiliation in affiliations if affiliation["@id"] == author['affiliation']['@id']), {})
    creator = {
        "affiliations": [{
            # "id": affiliation.get('@id', "Unknown"), 
            "name": affiliation.get('affilname', 'Unknown'),
        }],
        "person_or_org": {
            "family_name": author.get('ce:surname', "Unknown"),
            "given_name": author.get('ce:given-name', "Unknown"),
            "name": author.get('ce:indexed-name', "Unknown"),
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
  "Book": "Book",
  "Journal": "publication-article"
} # todo: This needs to be updated.

def get_doi(doi):
  return {
    "identifier": doi,
    "scheme": "doi"
  }

def get_identifiers(doi=None):
  #todo: As of now, only doi is attached. Check with Fredrik about the others. 
  identifiers = []
  if doi is not None:
    identifiers.append(get_doi(doi))
  
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

def get_draft_record_payload(resource_type, creators, title, description, publication_date, publisher, auth_keywords, languages, doi=None):
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
      "identifiers": get_identifiers(doi),
      "publication_date": publication_date,
      "publisher": publisher,
      "resource_type": {
        "id": scopus_type_rdm_type_mapper[resource_type]
      },
      "rights": [
        {
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
      ], # This has been hardcoded, since most of the recent uploads follows this. Check with Fredrik, if this is fine. 
      "subjects": [{"subjects": subject} for subject in auth_keywords],
      "title": title,
      "version": "v1",
      "languages": get_languages(languages),
    },
    "pids": {}
  }
  return new_draft_record_payload
