var directionsRenderer;

const getSourceAndDestinationCoordinates = () => {
    const startDate = $("#start_datetime_picker")[0].value.trim();
    if (startStation == -1) {
        alert('Please select a start station');
    } else if (destinationStation == -1) {
        alert('Please select a destination station');
    } else if (startDate == "") {
        alert('Please select a start date');
    } else {
        const sourceLatLng = markersOnMap.find(predicate => predicate
            .station_id == startStation).LatLng;
        const destinationLatLng = markersOnMap.find(predicate => predicate
            .station_id == destinationStation).LatLng;
        showRoute(sourceLatLng, destinationLatLng, startDate);
    }
}

const showRoute = (sourceLatLng, destinationLatLng, startDate) => {
    closeAllOtherInfo();

    // Remove old routes
    removeRoute();

    var directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    var source = new google.maps.LatLng(sourceLatLng[0].lat, sourceLatLng[0].lng);
    var destination = new google.maps.LatLng(destinationLatLng[0].lat, destinationLatLng[0].lng);

    var request = {
        origin: source,
        destination: destination,
        travelMode: "BICYCLING",
        drivingOptions: {
            departureTime: new Date(startDate),
            trafficModel: 'optimistic'
        }
    };
    directionsService.route(request, function (response, status) {
        if (status == 'OK') {
            directionsRenderer.setOptions({
                polylineOptions: {
                    strokeWeight: 7,
                    strokeOpacity: 4,
                    strokeColor: 'blue'
                },
                suppressMarkers: true
            });
            directionsRenderer.setDirections(response);
            directionsRenderer.setMap(map);
            getBikeAndWeatherPrediction(response.routes[0].legs[0].distance.text, response.routes[0].legs[0].duration.text, startDate);
        }
    });
}

const removeRoute = () => {
    if (directionsRenderer != null) {
        directionsRenderer.setMap(null);
        directionsRenderer = null;
    }
}

const getBikeAndWeatherPrediction = (distance, duration, startDate) => {
    $("#route_info")[0].innerHTML = "";
    $("#show_hide_loader")[0].style.display = "block";
    let predictionInfo = "Distance: " + distance + "<br/>" + "Duration: " + duration + "<br/><br/>";
    $.ajax({
        url: API_URL + "/api/station/predict?startDate=" + startDate + "&startStation=" + startStation + "&destinationStation=" + destinationStation,
        type: "GET",
        success: function (response) {
            predictionInfo += "=========Weather Description=======<br/>";
            predictionInfo += "Weather Description: " + response.weather_description_prediction + "<br/>";
            predictionInfo += "Temperature: " + response.temperature_prediction + "<br/>";
            predictionInfo += "Feels Like: " + response.feels_like_prediction + "<br/>";
            predictionInfo += "Max Temperature: " + response.temp_max_prediction + "<br/>";
            predictionInfo += "Min Temperature: " + response.temp_min_prediction + "<br/><br/>";
            predictionInfo += "=========Start Station Info=======<br/>";
            predictionInfo += "Available Bikes: " + response.start_station_bikes_prediction + "<br/>";
            predictionInfo += "Available Bike Stands: " + response.start_station_bike_stands_prediction + "<br/><br/>";
            predictionInfo += "=========Destination Station Info=======<br/>";
            predictionInfo += "Available Bikes: " + response.destination_station_bikes_prediction + "<br/>";
            predictionInfo += "Available Bike Stands: " + response.destination_station_bike_stands_prediction + "<br/><br/>";
            $("#show_hide_loader")[0].style.display = "none";
            $("#route_info")[0].innerHTML = predictionInfo;
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("Error in getBikeAndWeatherPrediction()")
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}