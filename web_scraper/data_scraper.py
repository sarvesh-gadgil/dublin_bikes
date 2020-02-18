import datetime as datetime
import dbconnect
import time
from datetime import datetime
import requests

# URL and PARAMS for JCDecaux API
URL = "https://api.jcdecaux.com/vls/v1/stations"
PARAMS = {'contract': "dublin", 'apiKey': "b238c567369cd42aa05c043e8313cb16ef7bacda"}

# Open Weather API URL
WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather"
WEATHER_PARAMS = {'appid': "b35975e18dc93725acb092f7272cc6b8"}


def get_api_response(api_type, **kwargs):
    # Make a GET request and return json response
    if api_type == 'bikes':
        return requests.get(url=URL, params=PARAMS).json()
    elif api_type == 'weather':
        return requests.get(url=WEATHER_URL, params=kwargs['weather_data']).json()


def save_data_in_db(insert_type, response, conn):
    # Save data in db on the basis of insert_type
    if insert_type == 'static':
        sql = 'INSERT INTO static_bike_details ' \
              '(`number`, `contract_name`, `name`, `address`, `lat`, `lng`, `banking`, `bonus`, `bike_stands`) ' \
              'VALUES ("%d", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%d")' % (
                  response['number'], response['contract_name'], response['name'], response['address'],
                  response['position']['lat'], response['position']['lng'], response['banking'],
                  response['bonus'], response['bike_stands'])
    elif insert_type == 'dynamic':
        # Dividing by 1000 below because of occuring Error : year 52103 is out of range in fromtimestamp function
        sql = "INSERT INTO dynamic_bike_details " \
              "(`available_bike_stands`, `available_bikes`, `status`, `last_update`, `number`)" \
              "VALUES ('%d', '%d', '%s', '%s', '%d')" % (
                  response['available_bike_stands'], response['available_bikes'], response['status'],
                  datetime.fromtimestamp(response['last_update'] // 1000), response['number'])
    else:
        temperature = round(response['main']['temp'] - 273.15)
        feels_like_temperature = round(response['main']['feels_like'] - 273.15)
        temperature_min = round(response['main']['temp_min'] - 273.15)
        temperature_max = round(response['main']['temp_max'] - 273.15)
        sunrise_time = datetime.fromtimestamp(response['sys']['sunrise'])
        sunset_time = datetime.fromtimestamp(response['sys']['sunset'])

        sql = 'INSERT INTO weather_details (`weather`, `weather_description`, `temperature`, `feels_like`, ' \
              '`temp_min`, `temp_max`, `pressure`, `humidity`, `visibility`, `speed`, `sunrise`, `sunset`,`number`)' \
              'VALUES ("%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%d")' \
              % (response['weather'][0]['main'], response['weather'][0]['description'], temperature,
                 feels_like_temperature,
                 temperature_min, temperature_max, response['main']['pressure'], response['main']['humidity'],
                 response['visibility'], response['wind']['speed'], sunrise_time, sunset_time, response["number"])

    # Execute query
    conn.cursor().execute(sql)

    # Commit changes
    conn.commit()


def check_static_data_exists(conn, number):
    sql = "select number from static_bike_details where number = %d" % number
    cursor = conn.cursor()
    cursor.execute(sql)
    return cursor.rowcount == 1


def check_dynamic_data_exists(conn, available_bike_stands, available_bikes, status, number):
    sql = "select number from dynamic_bike_details " \
          "where available_bike_stands = '%s' and available_bikes = '%s' and status = '%s' and number = '%d'" \
          % (available_bike_stands, available_bikes, status, number)
    cursor = conn.cursor()
    cursor.execute(sql)
    return cursor.rowcount >= 1


def save_weather_info(lat, lng, number, conn):
    # Adding more params for accuracy instead of just getting weather of Dublin
    WEATHER_PARAMS["lat"] = lat
    WEATHER_PARAMS["lon"] = lng
    # Sending request and getting response
    response = get_api_response('weather', weather_data=WEATHER_PARAMS)
    # Adding primary key of number for passing response to function
    response["number"] = number
    # Saving data in DB
    save_data_in_db('weather', response, conn)


while True:
    print("\nStarting at:", datetime.now())
    try:
        # Connect to database
        connection = dbconnect.get_db_connection()

        # Make API request to JCDecaux and get response in JSON
        json_data = get_api_response('bikes')

        # Iterating json response
        for data in json_data:
            # Saving static data
            try:
                # Only saving data if the data is updated
                if not check_static_data_exists(connection, data['number']):
                    save_data_in_db('static', data, connection)
            except Exception as e:
                print("\nError in saving static data. Data is:-")
                print(data)
                print('Error is:', e)
                connection.rollback()

            # Saving dynamic data
            try:
                # if not check_dynamic_data_exists(connection, data['available_bike_stands'], data['available_bikes'],
                #                                  data['status'], data['number']):
                save_data_in_db('dynamic', data, connection)
            except Exception as e:
                print("\nError in saving dynamic data. Data is:-")
                print(data)
                print('Error is:', e)
                connection.rollback()

            # Saving weather data
            try:
                save_weather_info(data['position']['lat'], data['position']['lng'], data['number'], connection)
            except Exception as e:
                print("\nError in saving weather data. Data is:-")
                print(data)
                print('Error is:', e)
                connection.rollback()

        try:
            # Closing connection.
            # Also enclosing this in try catch to prevent any connection closing exception
            connection.close()
        except Exception as e:
            print("Error in closing connection", e)

        print("\nSleeping at:", datetime.now())
        time.sleep(360)  # sleep for 6 min

    except Exception as e:
        print("Error in while loop:", e)
