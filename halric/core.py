import os
from openai import AzureOpenAI
from constants import OPENAI_ENDPOINT, OPENAI_MODEL_NAME, OPENAI_DEPLOYMENT, OPENAI_SUBSCRIPTION_KEY, OPENAI_API_VERSION

def get_advanced_summary_abstract(description):
  endpoint = OPENAI_ENDPOINT
  model_name = OPENAI_MODEL_NAME
  deployment = OPENAI_DEPLOYMENT

  subscription_key = OPENAI_SUBSCRIPTION_KEY
  api_version = OPENAI_API_VERSION

  client = AzureOpenAI(
      api_version=api_version,
      azure_endpoint=endpoint,
      api_key=subscription_key,
  )

  response = client.chat.completions.create(
      messages=[
          {
              "role": "system",
              "content": "You are a helpful assistant."
          },
          {
              "role": "user",
              "content": "description: " + description + 
                            '''
                                Summarize the article in about 200 words by answering these questions. 
                                Format the response strictly as raw HTML snippets that can be inserted directly into TinyMCE (no <!DOCTYPE>, <html>, <head>, or <body> tags). Use <h2> for headings, <p> for paragraphs, and <ul>/<li> for lists.
                                1. What is the main topic or problem being studied?
                                2. What did the researchers discover or conclude?
                                3. How might this matter to students or everyday life?

                                At the end, add definitions for the 5 most complex concepts in the text as a <ul> list, and then a <p><em>Disclaimer...</em></p>.
                            '''
          }
      ],
      max_completion_tokens=800,
      temperature=1.0,
      top_p=1.0,
      frequency_penalty=0.0,
      presence_penalty=0.0,
      model=deployment
  )

  return response.choices[0].message.content

def get_simple_summary_abstract(description):
  endpoint = OPENAI_ENDPOINT
  model_name = OPENAI_MODEL_NAME
  deployment = OPENAI_DEPLOYMENT

  subscription_key = OPENAI_SUBSCRIPTION_KEY
  api_version = OPENAI_API_VERSION

  client = AzureOpenAI(
      api_version=api_version,
      azure_endpoint=endpoint,
      api_key=subscription_key,
  )

  response = client.chat.completions.create(
      messages=[
          {
              "role": "system",
              "content": "You are a helpful assistant."
          },
          {
              "role": "user",
              "content": "description: " + description + 
                            '''
                                Summarize the article in a concise manner, focusing on the key points and main ideas. 
                                Format the response strictly as raw HTML snippets that can be inserted directly into TinyMCE (no <!DOCTYPE>, <html>, <head>, or <body> tags). Use <h2> for headings, <p> for paragraphs, and <ul>/<li> for lists.
                                Use clear and straightforward language to ensure the summary is easy to understand. 
                                
                                Generate with 100 words
                            '''
          }
      ],
      max_completion_tokens=400,
      temperature=1.0,
      top_p=1.0,
      frequency_penalty=0.0,
      presence_penalty=0.0,
      model=deployment
  )

  return response.choices[0].message.content