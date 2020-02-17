import requests
from requests.exceptions import HTTPError

for url in ['https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=b238c567369cd42aa05c043e8313cb16ef7bacda']:
    try:
        response = requests.get(url)

        # If the response was successful, no Exception will be raised
        response.raise_for_status()
    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')  # Python 3.6
    except Exception as err:
        print(f'Other error occurred: {err}')  # Python 3.6
    else:
        print('Success!')
response = requests.get(
        'https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=b238c567369cd42aa05c043e8313cb16ef7bacda',
    params={'q': 'requests+language:python'},
 )
# Inspect some attributes of the `requests` repository
json_response = response.json()
repository = json_response[0]
print(f'Number: {repository["number"]}')
print(f'contract_name: {repository["contract_name"]}')