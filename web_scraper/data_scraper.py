import dbconnect
import time
from datetime import datetime
import requests

# URL and PARAMS for JCDecaux API
URL = "https://api.jcdecaux.com/vls/v1/stations"
PARAMS = {'contract': "dublin", 'apiKey': "b238c567369cd42aa05c043e8313cb16ef7bacda"}


def get_api_response():
    # Make a GET request and return json response
    return requests.get(url=URL, params=PARAMS).json()


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


def get_weather_info(lat, lng, number):
    # Steps (use open weather API):
    # 1) Get the weather info from API using lat and lng
    # 2) Extract the information and store it in db
    # 3) Check if data is unique then only save in db
    pass


while True:
    print("\nStarting at:", datetime.now())
    try:
        # Connect to database
        connection = dbconnect.get_db_connection()

        # Make API request to JCDecaux and get response in JSON
        json_data = get_api_response()

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
                # TODO Getting weather data and save it in db (use method below)
                # get_weather_info(data['position']['lat'], data['position']['lng'], data['number'])
                pass
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
