from flask import Flask, jsonify, request
import dbconnect

app = Flask(__name__)

GOOGLE_MAPS_KEY = "AIzaSyASZwn9rm720DhYXGEw5FAn-Frp-Oi1bCY"


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
        return "Error"


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
        return "Error"


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

        # Return response
        return jsonify(payload)

    except Exception as e:
        print('Error in get_places_by_query:', e)
        return "Error"


@app.route("/api/google/get/place/coordinates")
def get_place_coordinates():
    try:
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
        return "Error"


if __name__ == "__main__":
    app.run(debug=True)
