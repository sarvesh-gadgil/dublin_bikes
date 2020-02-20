from datetime import datetime
import dbconnect
import time

# URL and PARAMS for JCDecaux API
URL = "https://api.jcdecaux.com/vls/v1/stations"
PARAMS = {'contract': "dublin", 'apiKey': "b238c567369cd42aa05c043e8313cb16ef7bacda"}


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

    # Execute query
    conn.cursor().execute(sql)

    # Commit changes
    conn.commit()


def check_static_data_exists(conn, number):
    sql = "select number from static_bike_details where number = %d" % number
    cursor = conn.cursor()
    cursor.execute(sql)
    return cursor.rowcount == 1


# def check_dynamic_data_exists(conn, available_bike_stands, available_bikes, status, number):
#     sql = "select number from dynamic_bike_details " \
#           "where available_bike_stands = '%s' and available_bikes = '%s' and status = '%s' and number = '%d'" \
#           % (available_bike_stands, available_bikes, status, number)
#     cursor = conn.cursor()
#     cursor.execute(sql)
#     return cursor.rowcount >= 1


while True:
    print("\nStarting at:", datetime.now())
    try:
        # Connect to database
        connection = dbconnect.get_db_connection()

        # Make API request to JCDecaux and get response in JSON
        json_data = dbconnect.get_api_response(URL, PARAMS)

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

        try:
            # Closing connection.
            # Also enclosing this in try catch to prevent any connection closing exception
            connection.close()
        except Exception as e:
            print("Error in closing connection", e)

        print("\nSleeping at:", datetime.now())
        time.sleep(360)  # sleep for 6 min

    except Exception as e:
        print("Error in bike scraper while loop:", e)
