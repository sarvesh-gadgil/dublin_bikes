var directionsRenderer;
var startStationCircle;
var destinationStationCircle;
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const getSourceAndDestinationCoordinates = () => {
    const startDate = $("#selected_datetime")[0].value;
    if (startStation == -1) {
        $("#start_validation")[0].style.display = "block";
    } else if (destinationStation == -1) {
        $("#destination_validation")[0].style.display = "block";
    } else if (startDate == "") {
        $("#start_date_validation")[0].style.display = "block";
    } else {
        $("#start_validation")[0].style.display = "none";
        $("#destination_validation")[0].style.display = "none";
        $("#start_date_validation")[0].style.display = "none";
        $("#nearest_bike_locations")[0].innerText = "";
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
    if (startStationCircle != null) {
        startStationCircle.setMap(null);
        startStationCircle = null;
    }
    if (destinationStationCircle != null) {
        destinationStationCircle.setMap(null);
        destinationStationCircle = null;
    }
    if (startpopup != null) {
        startpopup.setMap(null);
        startpopup = null;
    }
    if (destinationpopup != null) {
        destinationpopup.setMap(null);
        destinationpopup = null;
    }
}

const getBikeAndWeatherPrediction = (distance, duration, startDate) => {
    clearAllRouteInfo();
    const degreeCelcius = "°C";
    $("#show_hide_loader")[0].style.display = "block";
    let predictionInfo = "";
    $.ajax({
        url: API_URL + "/api/station/predict?startDate=" + startDate + "&startStation=" + startStation + "&destinationStation=" + destinationStation,
        type: "GET",
        success: function (response) {
            let weather_description = null;
            let warning_message = null;
            switch (response.weather_description_prediction) {
                case "scattered clouds":
                case "broken clouds":
                    weather_description = "Partly Cloudy";
                    $("#div_cloudy")[0].style.display = "block";
                    warning_message = "<div class=\"alert alert-info\" style=\"width: inherit; text-align: center; font-size:small\">Seems like a good day to go out and enjoy!</div>";
                    break;
                case "few clouds":
                case "overcast clouds":
                    weather_description = "Mostly Cloudy";
                    $("#div_cloudy")[0].style.display = "block";
                    warning_message = "<div class=\"alert alert-info\" style=\"width: inherit; text-align: center; font-size:small\">It's a gloomy day. So have some refreshing beverage before you leave!</div>";
                    break;
                case "light intensity drizzle":
                case "drizzle":
                case "light intensity drizzle rain":
                    weather_description = "Drizzle";
                    $("#div_drizzle")[0].style.display = "block";
                    warning_message = "<div class=\"alert alert-warning\" style=\"width: inherit; text-align: center; font-size:small\">Watch out for rain and carry an umbrella with you!</div>";
                    break;
                case "moderate rain":
                case "shower rain":
                case "light rain":
                case "light intensity shower rain":
                    weather_description = "Rainy";
                    $("#div_high_rain")[0].style.display = "block";
                    warning_message = "<div class=\"alert alert-danger\" style=\"width: inherit; text-align: center; font-size:small\">Looks like it's going be a rainy day, so carry an umbrella with you!</div>";
                    break;
            }
            $("#weather_desc")[0].innerText = weather_description;
            $("#temperature")[0].innerText = response.temperature_prediction + degreeCelcius;
            $("#feels_like")[0].innerText = response.feels_like_prediction + degreeCelcius;
            $("#max_temp")[0].innerText = response.temp_max_prediction + degreeCelcius;
            $("#min_temp")[0].innerText = response.temp_min_prediction + degreeCelcius;
            $("#warning_message")[0].innerHTML = warning_message;

            // Setting distance and duration
            $("#distance")[0].innerText = distance;
            $("#duration")[0].innerText = duration;
            const control = document.getElementById('floating-panel');
            control.style.display = 'block';
            map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);

            $("#show_hide_loader")[0].style.display = "none";
            $("#weather_div")[0].style.display = "block";

            // create circle for start 
            // Reference: https://developers.google.com/maps/documentation/javascript/examples/circle-simple
            const startStationForRadius = markersArray.find(predicate => predicate
                .station_id == startStation);
            const startBikesCount = (response.start_station_bikes_prediction / startStationForRadius.bike_stands) * 100;
            let startBikesRadius = null;
            let startBikesRadiusColor = null;
            if (startBikesCount <= 10) {
                startBikesRadius = 30;
                startBikesRadiusColor = '#FF0000';
            } else if (startBikesCount > 10 && startBikesCount <= 40) {
                startBikesRadius = 50;
                startBikesRadiusColor = 'darkorange';
            } else if (startBikesCount > 40) {
                startBikesRadius = 70;
                startBikesRadiusColor = 'darkgreen';
            }
            startStationCircle = new google.maps.Circle({
                strokeColor: startBikesRadiusColor,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: startBikesRadiusColor,
                fillOpacity: 0.6,
                map: map,
                center: startStationForRadius.position,
                radius: startBikesRadius
            });

            // Create popup marker for showing available bikes and available bike stands at start
            // Reference: https://developers.google.com/maps/documentation/javascript/examples/overlay-popup
            document.getElementById('startContentCreate').innerHTML = "<div id=\"startContent\"></div>";
            const customPopOverLatLngStart = markersOnMap.find(predicate => predicate
                .station_id == startStation).LatLng[0];
            startPrediction = "Station Name: <b>" + startStationForRadius.placeName + "</b><br/>";
            startPrediction += "Available Bikes: <b>" + response.start_station_bikes_prediction + "</b><br/>";
            startPrediction += "Available Bike Stands: <b>" + response.start_station_bike_stands_prediction + "</b><br/>";
            startPrediction += "<div style=\"text-align: center\"><a href='#!' onclick=\"showStartStationAnalytics()\">View More</a></div>";
            document.getElementById('startContent').innerHTML = startPrediction;
            Popup = createPopupClass();
            startpopup = new Popup(
                new google.maps.LatLng(customPopOverLatLngStart.lat, customPopOverLatLngStart.lng),
                document.getElementById('startContent'));
            startpopup.setMap(map);

            // create circle for destination 
            // Reference: https://developers.google.com/maps/documentation/javascript/examples/circle-simple
            const destinationStationForRadius = markersArray.find(predicate => predicate
                .station_id == destinationStation);
            const destinationBikesCount = (response.destination_station_bikes_prediction / destinationStationForRadius.bike_stands) * 100;
            let destinationBikesRadius = null;
            let destinationBikesRadiusColor = null;
            if (destinationBikesCount <= 10) {
                destinationBikesRadius = 30;
                destinationBikesRadiusColor = '#FF0000';
            } else if (destinationBikesCount > 10 && destinationBikesCount <= 40) {
                destinationBikesRadius = 50;
                destinationBikesRadiusColor = 'darkorange';
            } else if (destinationBikesCount > 40) {
                destinationBikesRadius = 70;
                destinationBikesRadiusColor = 'darkgreen';
            }
            destinationStationCircle = new google.maps.Circle({
                strokeColor: destinationBikesRadiusColor,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: destinationBikesRadiusColor,
                fillOpacity: 0.6,
                map: map,
                center: destinationStationForRadius.position,
                radius: destinationBikesRadius
            });

            // Create popup marker for showing available bikes and available bike stands at destination
            // Reference: https://developers.google.com/maps/documentation/javascript/examples/overlay-popup
            document.getElementById('destinationContentCreate').innerHTML = "<div id=\"destinationContent\"></div>";
            const customPopOverLatLngDestination = markersOnMap.find(predicate => predicate
                .station_id == destinationStation).LatLng[0];
            destinationPrediction = "Station Name: <b>" + destinationStationForRadius.placeName + "</b><br/>";
            destinationPrediction += "Available Bikes: <b>" + response.destination_station_bikes_prediction + "</b><br/>";
            destinationPrediction += "Available Bike Stands: <b>" + response.destination_station_bike_stands_prediction + "</b><br/>";
            destinationPrediction += "<div style=\"text-align: center\"><a href='#!' onclick=\"showDestinationStationAnalytics()\">View More</a></div>";
            document.getElementById('destinationContent').innerHTML = destinationPrediction;
            Popup = createPopupClass();
            destinationpopup = new Popup(
                new google.maps.LatLng(customPopOverLatLngDestination.lat, customPopOverLatLngDestination.lng),
                document.getElementById('destinationContent'));
            destinationpopup.setMap(map);

        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("Error in getBikeAndWeatherPrediction()")
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}

const clearAllRouteInfo = () => {
    $("#route_info")[0].innerHTML = "";
    $("#weather_div")[0].style.display = "none";
    $("#div_cloudy")[0].style.display = "none";
    $("#div_drizzle")[0].style.display = "none";
    $("#div_high_rain")[0].style.display = "none";
    $("#floating-panel")[0].style.display = "none";
    if (startpopup != null) {
        startpopup.setMap(null);
        startpopup = null;
    }
    if (destinationpopup != null) {
        destinationpopup.setMap(null);
        destinationpopup = null;
    }
}

const showStartStationAnalytics = () => {
    currentChartStation = startStation;
    getWeeklyBikeAvailabilityGraph();
    $('#visualisationModal').modal('show');
}

const showDestinationStationAnalytics = () => {
    currentChartStation = destinationStation;
    getWeeklyBikeAvailabilityGraph();
    $('#visualisationModal').modal('show');
}

const getWeeklyBikeAvailabilityGraph = () => {
    $("#station_name_for_graph")[0].innerHTML = markersArray.find(predicate => predicate
        .station_id == currentChartStation).placeName;
    displayWeeklyChartPerStation();
    $("#weekly_tab_id").tab('show');
}

const getHourlyBikeAvailabilityGraph = () => {
    displayHourlyChartPerStation();
    $("#hourly_tab_id").tab('show');
}