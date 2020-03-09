from datetime import datetime
import dbconnect
import time

# Open Weather API URL
WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather"
WEATHER_PARAMS = {'appid': "b35975e18dc93725acb092f7272cc6b8", 'lat': '53.349248', 'lon': '-6.262877'}

while True:
    print("\nStarting at:", datetime.now())
    try:
        # Connect to database
        connection = dbconnect.get_db_connection()

        # Make API request to Open Weather and get response in JSON
        response = dbconnect.get_api_response(WEATHER_URL, WEATHER_PARAMS)

        # Convert the required values
        temperature = round(response['main']['temp'] - 273.15)
        feels_like_temperature = round(response['main']['feels_like'] - 273.15)
        temperature_min = round(response['main']['temp_min'] - 273.15)
        temperature_max = round(response['main']['temp_max'] - 273.15)
        sunrise_time = datetime.fromtimestamp(response['sys']['sunrise'])
        sunset_time = datetime.fromtimestamp(response['sys']['sunset'])

        # Create sql
        sql = 'INSERT INTO weather_details (`weather`, `weather_description`, `temperature`, `feels_like`, ' \
              '`temp_min`, `temp_max`, `pressure`, `humidity`, `visibility`, `speed`, `sunrise`, `sunset`)' \
              'VALUES ("%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s")' \
              % (response['weather'][0]['main'], response['weather'][0]['description'], temperature,
                 feels_like_temperature,
                 temperature_min, temperature_max, response['main']['pressure'], response['main']['humidity'],
                 response['visibility'], response['wind']['speed'], sunrise_time, sunset_time)
        try:
            # Execute query
            connection.cursor().execute(sql)

            # Commit changes
            connection.commit()
        except Exception as e:
            print("\nError in saving weather data. Data is:-")
            print(response)
            print('Error is:', e)
            connection.rollback()

        try:
            # Closing connection.
            # Also enclosing this in try catch to prevent any connection closing exception
            connection.close()
        except Exception as e:
            print("Error in closing connection", e)

        print("\nSleeping at:", datetime.now())
        time.sleep(14400)  # sleep for 4 hours
    except Exception as e:
        print("Error in weather scraper while loop:", e)
