var directionsRenderer;

const getSourceAndDestinationCoordinates = () => {
    if (startStation == -1) {
        alert('Please select a start station');
    } else if (destinationStation == -1) {
        alert('Please select a destination station');
    } else {
        const sourceLatLng = markersOnMap.find(predicate => predicate
            .station_id == startStation).LatLng;
        const destinationLatLng = markersOnMap.find(predicate => predicate
            .station_id == destinationStation).LatLng;
        showRoute(sourceLatLng, destinationLatLng);
    }
}

const showRoute = (sourceLatLng, destinationLatLng) => {
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
            departureTime: new Date(Date.now()), // for the time N milliseconds from now.
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
            alert(response.routes[0].legs[0].distance.text)
            alert(response.routes[0].legs[0].duration.text)
        }
    });
}

const removeRoute = () => {
    if (directionsRenderer != null) {
        directionsRenderer.setMap(null);
        directionsRenderer = null;
    }
}