import datetime as datetime
import dbconnect
import time
from datetime import datetime
import requests

# URL and PARAMS for JCDecaux API
URL = "https://api.jcdecaux.com/vls/v1/stations"
PARAMS = {'contract': "dublin", 'apiKey': "b238c567369cd42aa05c043e8313cb16ef7bacda"}

WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather"


def get_api_response(api_type, **kwargs):
    # Make a GET request and return json response
    if api_type == 'bikes':
        return requests.get(url=URL, params=PARAMS).json()
    elif api_type == 'weather':
        return requests.get(url=WEATHER_URL, params=kwargs['weather_data']).json()


def save_data_in_db(insert_type, data_list, conn):
    # Save data in db on the basis of insert_type
    if insert_type == 'static':
        sql = 'INSERT INTO static_bike_details ' \
              '(`number`, `contract_name`, `name`, `address`, `lat`, `lng`, `banking`, `bonus`, `bike_stands`) ' \
              'VALUES ("%d", "%s", "%s", "%s", "%s", "%s", "%s", "%s", "%d")' % (
                  data_list[0], data_list[1], data_list[2], data_list[3], data_list[4], data_list[5], data_list[6],
                  data_list[7],
                  data_list[8])
    else:
        sql = "INSERT INTO dynamic_bike_details " \
              "(`available_bike_stands`, `available_bikes`, `status`, `last_update`, `number`)" \
              "VALUES ('%d', '%d', '%s', '%s', '%d')" % (
                  data_list[0], data_list[1], data_list[2], data_list[3], data_list[4])

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


def save_weather_info(lat, lng, number):
    WEATHER_PARAMS = {'appid': "b35975e18dc93725acb092f7272cc6b8", 'lat': lat, 'lon': lng}
    response = get_api_response('weather', weather_data=WEATHER_PARAMS)
    print("weather json:-", response)
    temperature = (response['temp'] - 32) / 1.8
    feels_like_temperature = (response['feels_like'] - 32) / 1.8
    temperature_min = (response['temp_min'] - 32) / 1.8
    temperature_max = (response['temp_max'] - 32) / 1.8
    sunrise_time = datetime.fromtimestamp(response['sunrise'])
    sunset_time = datetime.fromtimestamp(response['sunset'])

    sql = 'INSERT INTO weather_details ' \ '('number' , 'weather', 'weather_description', 'temperature', 'feels_like', 'temp_min', 'temp_max', 'pressure', 'humidity', 'visibility', 'speed', 'sunrise', 'sunset
     \
     = 'VALUES ("%d", "%s", "%s", "%f", "%f", "%f", "%f", "%f", "%d", "%d", "%d", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S")' % (
        data['number'], response['weather']['main'], response['weather']['main'], temperature, feels_like_temperature,
        temperature_min, temperature_max, response['main']['pressure'], response['main']['humidity'],
        response['visiblity'], response['wind']['speed']
        , sunrise_time, sunset_time)
    )
    cursor = conn.cursor()
    cursor.execute(sql)
    return cursor.rowcount == 1


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
                    static_data_list = [data['number'], data['contract_name'], data['name'], data['address'],
                                        data['position']['lat'], data['position']['lng'], data['banking'],
                                        data['bonus'], data['bike_stands']]
                    save_data_in_db('static', static_data_list, connection)
            except Exception as e:
                print("Error in saving static data. Data is:-")
                print(data)
                print('Error is:', e)
                connection.rollback()

            # Saving dynamic data
            try:
                # Only saving data if the data is updated
                if not check_dynamic_data_exists(connection, data['available_bike_stands'], data['available_bikes'],
                                                 data['status'], data['number']):
                    dynamic_data_list = [data['available_bike_stands'], data['available_bikes'], data['status'],
                                         data['last_update'], data['number']]
                    save_data_in_db('dynamic', dynamic_data_list, connection)
            except Exception as e:
                print("Error in saving dynamic data. Data is:-")
                print(data)
                print('Error is:', e)
                connection.rollback()

            try:
                save_weather_info(data['position']['lat'], data['position']['lng'], data['number'])
            except Exception as e:
                print("Error in saving weather data. Data is:-")
                print(data)
                print('Error is:', e)
                connection.rollback()
            print()

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
