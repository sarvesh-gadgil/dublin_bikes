from flask import Flask, jsonify, request, abort
from datetime import datetime
import calendar
import pickle
import dbconnect

app = Flask(__name__)

GOOGLE_MAPS_KEY = "AIzaSyASZwn9rm720DhYXGEw5FAn-Frp-Oi1bCY"

DAYS = ["DUMMY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
DAY_NAME_ONE_HOT_ENCODED = {"Monday": [1, 0, 0, 0, 0, 0], "Tuesday": [0, 0, 0, 0, 1, 0],
                            "Wednesday": [0, 0, 0, 0, 0, 1],
                            "Thursday": [0, 0, 0, 1, 0, 0], "Friday": [0, 0, 0, 0, 0, 0],
                            "Saturday": [0, 1, 0, 0, 0, 0],
                            "Sunday": [0, 0, 1, 0, 0, 0]}

DAY_NAME_ENCODED = {"Monday": 1, "Tuesday": 5, "Wednesday": 6, "Thursday": 4, "Friday": 0, "Saturday": 2, "Sunday": 3}
TIME_OF_DAY_ENCODED = {"Afternoon": 0, "Night": 2, "Morning": 1}
WEATHER_DESCRIPTION_ENCODED = {9: "scattered clouds", 2: "few clouds", 0: "broken clouds", 6: "light rain",
                               5: "light intensity shower rain", 7: "moderate rain", 8: "overcast clouds",
                               10: "shower rain", 3: "light intensity drizzle", 1: "drizzle",
                               4: "light intensity drizzle rain"}

WEATHER_DESCRIPTION_ONE_HOT_ENCODED = {"drizzle": [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                       "few clouds": [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                                       "light intensity drizzle": [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                                       "light intensity drizzle rain": [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
                                       "light intensity shower rain": [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                                       "light rain": [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
                                       "moderate rain": [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                                       "overcast clouds": [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                                       "scattered clouds": [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
                                       "shower rain": [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                                       "broken clouds": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}


@app.route("/")
def root():
    return app.send_static_file('html/index.html')


@app.route("/api/station/bikes/get/<int:station_id>")
def get_bike_data_by_station_id(station_id):
    # Connect to database
    connection = dbconnect.get_db_connection()

    # Create sql
    sql = "SELECT b.available_bike_stands, b.available_bikes, b.status, b.last_update, b.date_created " \
          "FROM dublin_bikes.static_bike_details a, dublin_bikes.dynamic_bike_details b " \
          "where a.number = %d and a.number = b.number order by b.date_created desc limit 1" % station_id

    try:
        # Create cursor object
        cursor = connection.cursor()

        # Execute query
        cursor.execute(sql)

        # Getting all the records
        rows = cursor.fetchall()
        result = rows[0]

        # Preparing JSON response
        content = {'available_bike_stands': result[0], 'available_bikes': result[1], 'status': result[2],
                   'last_update': result[3], 'date_created': result[4]}

        # Returning response
        return jsonify(content)
    except Exception as e:
        print('Error in get_station_details_by_station_id:', e)
        abort(jsonify(message="Something went wrong"), 500)
    finally:
        try:
            connection.close()
        except Exception as e:
            print("Error in closing connection", e)


@app.route("/api/station/bikes/static/all")
def get_all_static_bikes_data():
    # Connect to database
    connection = dbconnect.get_db_connection()

    # Create sql
    sql = "SELECT * FROM static_bike_details order by number asc"

    try:
        # Create cursor object
        cursor = connection.cursor()

        # Execute query
        cursor.execute(sql)

        # Getting all the records
        rows = cursor.fetchall()
        payload = []

        # Creating JSON response
        for result in rows:
            content = {'number': result[0], 'contract_name': result[1], 'name': result[2], 'address': result[3],
                       'lat': result[4], 'lng': result[5], 'banking': result[6], 'bonus': result[7],
                       'bike_stands': result[8], 'date_created': result[9]}
            payload.append(content)

        # Return response
        return jsonify(payload)

    except Exception as e:
        print('Error in get_station_details_by_station_id:', e)
        abort(jsonify(message="Something went wrong"), 500)
    finally:
        try:
            connection.close()
        except Exception as e:
            print("Error in closing connection", e)


@app.route("/api/google/get/places")
def get_places_by_query():
    try:
        # Get response from Google
        response = dbconnect.get_api_response("https://maps.googleapis.com/maps/api/place/autocomplete/json",
                                              {'input': request.args.get("query"),
                                               'key': GOOGLE_MAPS_KEY,
                                               'location': '53.357841,-6.251557', 'radius': 2000})
        # Create JSON response
        payload = []
        for result in response['predictions']:
            content = {'value': result['description'], 'id': result['place_id']}
            payload.append(content)

        # Getting stations from database
        # Connect to database
        connection = dbconnect.get_db_connection()

        try:
            param = "%" + request.args.get("query") + "%"
            sql = "SELECT number, name FROM static_bike_details where name like \"%s\"" % param

            # Create cursor object
            cursor = connection.cursor()

            # Execute query
            cursor.execute(sql)

            # Getting all the records
            rows = cursor.fetchall()

            # Creating JSON response
            for result in rows:
                content = {'value': result[1] + " (This is a station)", 'id': 'local_from_db_' + str(result[0])}
                payload.append(content)

        except Exception as e:
            print('Error in get_places_by_query:', e)
        finally:
            try:
                connection.close()
            except Exception as e:
                print("Error in closing connection", e)

        # Return response
        return jsonify(payload)

    except Exception as e:
        print('Error in get_places_by_query:', e)
        abort(jsonify(message="Something went wrong"), 500)


@app.route("/api/google/get/place/coordinates")
def get_place_coordinates():
    try:
        if "local_from_db_" in request.args.get("place_id"):
            station_id = request.args.get("place_id").replace("local_from_db_", "")

            # Connect to database
            connection = dbconnect.get_db_connection()

            sql = "SELECT a.name, b.available_bike_stands, b.available_bikes " \
                  "FROM static_bike_details a, dynamic_bike_details b " \
                  "where a.number = %d and a.number = b.number order by b.date_created desc limit 1" % int(station_id)

            # Create cursor object
            cursor = connection.cursor()

            # Execute query
            cursor.execute(sql)

            # Getting all the records
            rows = cursor.fetchall()
            result = rows[0]

            content = {'station_id': int(station_id), 'station_name': result[0], 'available_bike_stands': result[1],
                       'available_bikes': result[2]}

            try:
                connection.close()
            except Exception as e:
                print("Error in closing connection", e)
        else:
            # Get response from Google
            response = dbconnect.get_api_response("https://maps.googleapis.com/maps/api/place/details/json",
                                                  {'placeid': request.args.get("place_id"), 'key': GOOGLE_MAPS_KEY})

            # Create JSON response
            content = {'lat': response['result']['geometry']['location']['lat'],
                       'lng': response['result']['geometry']['location']['lng']}

        # Return response
        return jsonify(content)

    except Exception as e:
        print('Error in get_place_coordinates:', e)
        abort(jsonify(message="Something went wrong"), 500)


@app.route("/api/station/predict")
def get_bike_and_weather_prediction():
    try:
        start_date = datetime.strptime(request.args.get("startDate"), "%d/%m/%Y %H:%M")
        start_station = request.args.get("startStation")
        destination_station = request.args.get("destinationStation")
        print("Start date in date type is:", start_date)
        print(calendar.day_name[start_date.weekday()])

        time_of_day_dict = get_time_of_day(start_date.hour)

        # Predict temperature
        model = load_ml_model('ml_model/weather/temperature.pkl')
        x_features = [start_date.day, start_date.month, start_date.hour, start_date.minute]
        x_features += time_of_day_dict['time_of_day_for_prediction']
        x_features += DAY_NAME_ONE_HOT_ENCODED[calendar.day_name[start_date.weekday()]]
        temperature_prediction = model.predict([x_features])[0]
        print("temperature_prediction:", temperature_prediction)

        # Predict feels like
        model = load_ml_model('ml_model/weather/feels_like.pkl')
        feels_like_prediction = model.predict([x_features])[0]
        print("feels_like_prediction:", feels_like_prediction)

        # Predict temp max
        model = load_ml_model('ml_model/weather/temp_max.pkl')
        temp_max_prediction = model.predict([x_features])[0]
        print("temp_max_prediction:", temp_max_prediction)

        # Predict temp min
        model = load_ml_model('ml_model/weather/temp_min.pkl')
        temp_min_prediction = model.predict([x_features])[0]
        print("temp_min_prediction:", temp_min_prediction)

        # Predict weather description
        x_features = [start_date.day, start_date.month, start_date.hour, start_date.minute,
                      DAY_NAME_ENCODED[calendar.day_name[start_date.weekday()]],
                      TIME_OF_DAY_ENCODED[time_of_day_dict['time_of_day']]]
        model = load_ml_model('ml_model/weather/weather_description.pkl')
        weather_description_prediction = WEATHER_DESCRIPTION_ENCODED[model.predict([x_features])[0]]
        print("weather_description_prediction:", weather_description_prediction)

        # Create input features for prediction (available bikes and available bikes stands)
        x_features = [start_date.day, start_date.month, start_date.hour, start_date.minute]
        x_features += time_of_day_dict['time_of_day_for_prediction']
        x_features += DAY_NAME_ONE_HOT_ENCODED[calendar.day_name[start_date.weekday()]]
        x_features.append(int(round(temperature_prediction)))
        x_features += WEATHER_DESCRIPTION_ONE_HOT_ENCODED[weather_description_prediction]

        # Predict available bikes for start station
        model = load_ml_model('ml_model/available_bikes/available_bikes_' + str(start_station) + ".pkl")
        start_station_bikes_prediction = model.predict([x_features])[0]
        print("start_station_bikes_prediction", start_station_bikes_prediction)

        # Predict available bike stands for start station
        model = load_ml_model('ml_model/available_bike_stands/available_bike_stands_' + str(start_station) + ".pkl")
        start_station_bike_stands_prediction = model.predict([x_features])[0]
        print("start_station_bike_stands_prediction", start_station_bike_stands_prediction)

        # Predict available bikes for destination station
        model = load_ml_model('ml_model/available_bikes/available_bikes_' + str(destination_station) + ".pkl")
        destination_station_bikes_prediction = model.predict([x_features])[0]
        print("destination_station_bikes_prediction", destination_station_bikes_prediction)

        # Predict available bike stands for destination station
        model = load_ml_model(
            'ml_model/available_bike_stands/available_bike_stands_' + str(destination_station) + ".pkl")
        destination_station_bike_stands_prediction = model.predict([x_features])[0]
        print("destination_station_bike_stands_prediction", destination_station_bike_stands_prediction)

        # Create JSON response
        content = {"temperature_prediction": int(round(temperature_prediction)),
                   "feels_like_prediction": int(round(feels_like_prediction)),
                   "temp_max_prediction": int(round(temp_max_prediction)),
                   "temp_min_prediction": int(round(temp_min_prediction)),
                   "weather_description_prediction": weather_description_prediction,
                   "start_station_bikes_prediction": int(round(start_station_bikes_prediction)),
                   "start_station_bike_stands_prediction": int(round(start_station_bike_stands_prediction)),
                   "destination_station_bikes_prediction": int(round(destination_station_bikes_prediction)),
                   "destination_station_bike_stands_prediction": int(round(destination_station_bike_stands_prediction))}

        # Return response
        return jsonify(content)
    except Exception as e:
        print("Error in get_bike_and_weather_prediction: ", e)
        abort(jsonify(message="Something went wrong"), 500)


@app.route("/api/station/bikes/chart/weekly/<int:station_id>")
def calculate_average_bike_availability_weekly(station_id):
    # Connect to database
    connection = dbconnect.get_db_connection()

    # Create sql
    sql = "SELECT DAYOFWEEK(date_created),hour(date_created),floor(avg(available_bikes)),number " \
          "FROM dublin_bikes.dynamic_bike_details where number in ({0}) " \
          "group by number, hour(date_created),DAYOFWEEK(date_created) order by 4, 1,2".format(int(station_id))

    try:
        # Create cursor object
        cursor = connection.cursor()

        # Execute query
        cursor.execute(sql)

        # Getting all the records
        rows = cursor.fetchall()
        weekdays_count = {}

        # Iterating all records
        for result in rows:
            if DAYS[result[0]] in weekdays_count.keys():
                weekdays_count[DAYS[result[0]]] += result[2]
            else:
                weekdays_count[DAYS[result[0]]] = result[2]

        # Creating JSON response
        content = {"monday": int(round(weekdays_count['MONDAY'] / 24)),
                   "tuesday": int(round(weekdays_count['TUESDAY'] / 24)),
                   "wednesday": int(round(weekdays_count['WEDNESDAY'] / 24)),
                   "thursday": int(round(weekdays_count['THURSDAY'] / 24)),
                   "friday": int(round(weekdays_count['FRIDAY'] / 24)),
                   "saturday": int(round(weekdays_count['SATURDAY'] / 24)),
                   "sunday": int(round(weekdays_count['SUNDAY'] / 24))}

        # Return response
        return jsonify(content)

    except Exception as e:
        print('Error in calculate_average_bike_availability_weekly:', e)
        abort(jsonify(message="Something went wrong"), 500)
    finally:
        try:
            connection.close()
        except Exception as e:
            print("Error in closing connection", e)


@app.route("/api/station/bikes/chart/hourly/<int:station_id>")
def calculate_average_bike_availability_hourly(station_id):
    # Convert start date into date type
    start_date = datetime.strptime(request.args.get("startDate"), "%d/%m/%Y %H:%M")

    # Connect to database
    connection = dbconnect.get_db_connection()

    # Create sql
    sql = "SELECT hour(date_created),floor(avg(available_bikes)) " \
          "FROM dublin_bikes.dynamic_bike_details where number in ({0}) and DAYOFWEEK(date_created) = {1} " \
          "group by number, hour(date_created),DAYOFWEEK(date_created) " \
          "order by 1,2".format(int(station_id), DAYS.index(calendar.day_name[start_date.weekday()].upper()))

    try:
        # Create cursor object
        cursor = connection.cursor()

        # Execute query
        cursor.execute(sql)

        # Getting all the records
        rows = cursor.fetchall()
        hourly_data = {}
        counter = 0

        # Iterating rows
        for result in rows:
            hourly_data["hour_" + str(counter)] = result[1]
            counter += 1

        # Return JSON response
        return jsonify(hourly_data)

    except Exception as e:
        print('Error in calculate_average_bike_availability_hourly:', e)
        abort(jsonify(message="Something went wrong"), 500)
    finally:
        try:
            connection.close()
        except Exception as e:
            print("Error in closing connection", e)


def load_ml_model(path):
    with open(path, 'rb') as handle:
        model = pickle.load(handle)
    return model


def get_time_of_day(hours):
    if 0 <= hours <= 3:
        return {'time_of_day_for_prediction': [0, 1], 'time_of_day': "Night"}
    elif 4 <= hours <= 11:
        return {'time_of_day_for_prediction': [1, 0], 'time_of_day': "Morning"}
    elif 12 <= hours <= 20:
        return {'time_of_day_for_prediction': [0, 0], 'time_of_day': "Afternoon"}
    else:
        return {'time_of_day_for_prediction': [0, 1], 'time_of_day': "Night"}


if __name__ == "__main__":
    app.run(debug=True)
