import yaml
import os
import argparse

from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v2.api.service_definition_api import ServiceDefinitionApi


# datadog api client https://github.com/DataDog/datadog-api-client-python
def create_or_update_datadog_service_definitions(body):
  configuration = Configuration()
  with ApiClient(configuration) as api_client:
    api_instance = ServiceDefinitionApi(api_client)
    response = api_instance.create_or_update_service_definitions(body=body)
    print(response)


if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument('--filepath', help='datadog service catalog meta data', required=True)

  if os.environ.get('DD_API_KEY') is None or os.environ.get('DD_APP_KEY') is None:
    print('need set DD_API_KEY and DD_APP_KEY in env')
    exit(1)

  args = parser.parse_args()
  filepath = args.filepath
  if os.path.isfile(filepath):
    with open(filepath, 'r') as file:
      meta_data = yaml.safe_load(file)
    if meta_data: 
      if meta_data['dd-services']:
        for dd_service in meta_data['dd-services']:
          meta_data['dd-service'] = dd_service
          create_or_update_datadog_service_definitions(body=meta_data)
      else:
        create_or_update_datadog_service_definitions(body=meta_data)
