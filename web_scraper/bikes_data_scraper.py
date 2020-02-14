import dbconnect
import time
from datetime import datetime
import requests

URL = "https://api.jcdecaux.com/vls/v1/stations"
PARAMS = {'contract': "dublin", 'apiKey': "b238c567369cd42aa05c043e8313cb16ef7bacda"}


def get_api_response():
    return requests.get(url=URL, params=PARAMS).json()


def save_data_in_db(insert_type, data_list, conn):
    if insert_type == 'static':
        sql = "INSERT INTO static_bike_details " \
              "VALUES ('%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d')" % (
                  data_list[0], data_list[1], data_list[2], data_list[3], data_list[4], data_list[5], data_list[6],
                  data_list[7],
                  data_list[8])
    else:
        sql = "INSERT INTO dynamic_bike_details " \
              "VALUES ('%d', '%d', '%s', '%s', '%d')" % (
                  data_list[0], data_list[1], data_list[2], data_list[3], data_list[4])

    print(sql)

    # Execute query
    # conn.cursor().execute(sql)

    # Commit changes
    # conn.commit()

    # Rough code
    # sql = "INSERT INTO test (`idtest`,`data`) VALUES ('%d', '%s')" % (22, 22)
    # conn.cursor().execute(sql)
    # conn.commit()


def check_static_data_exists():
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

                # TODO check if already exists if not exists then only insert
                # use check_static_data_exists()

                static_data_list = [data['number'], data['contract_name'], data['name'], data['address'],
                                    data['position']['lat'], data['position']['lng'], data['banking'],
                                    data['bonus'], data['bike_stands']]
                save_data_in_db('static', static_data_list, connection)
            except Exception as e:
                print("Error in saving static data. Data is:-")
                print(data)
                print('Error is:', e)
                # connection.rollback()

            # Saving dynamic data
            try:
                dynamic_data_list = [data['available_bike_stands'], data['available_bikes'], data['status'],
                                     data['last_update'], data['number']]
                save_data_in_db('dynamic', dynamic_data_list, connection)
            except Exception as e:
                print("Error in saving dynamic data. Data is:-")
                print(data)
                print('Error is:', e)
                # connection.rollback()
            print()

        try:
            # Closing connection.
            # Also enclosing this in try catch to prevent any connection closing exception
            connection.close()
        except Exception as e:
            print("Error in closing connection", e)

        print("\nSleeping at:", datetime.now())
        time.sleep(300)

    except Exception as e:
        print("Error in while loop:", e)
