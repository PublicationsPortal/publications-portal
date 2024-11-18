import yaml

with open('languages.yaml', 'r') as stream:
  languages = yaml.safe_load(stream)

found_language = next((language for language in languages if language['title']['en'] == 'English'), None)

print(found_language)