// Map variables
var markersOnMap = [];
var map;
var InforObj = [];
const centerCords = {
    lat: 53.346519,
    lng: -6.258644
};
var markersArray = [];
var sourceMarker = null;
var endMarker = null;
var isStartStation = null;
var startStation = -1; // -1 means station has not been choosed
var destinationStation = -1;
var globalMarker = null;

// https://developers.google.com/chart/infographics/docs/dynamic_icons#pins
const addMarkerInfo = () => {
    for (var i = 0; i < markersOnMap.length; i++) {
        const marker = new google.maps.Marker({
            position: markersOnMap[i].LatLng[0],
            map: map,
            animation: google.maps.Animation.DROP,
            station_id: markersOnMap[i].station_id,
            placeName: markersOnMap[i].placeName,
            icon: "static/image/marker_red.png"
        });
        marker.addListener('click', function () {
            decideSourceDestination(marker);
        });
        marker.addListener('mouseover', function () {
            const infowindow = new google.maps.InfoWindow({
                content: "Station Name: " + marker.get('placeName')
            });
            infowindow.open(marker.get('map'), marker);
            InforObj.push(infowindow);
        });
        marker.addListener('mouseout', function () {
            closeAllOtherInfo();
        });
        markersArray.push(marker);
    }
    const control = document.getElementById('legend');
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(control);
    control.style.display = 'block';
}

const decideSourceDestination = (marker) => {
    $('#sourceDestinationModal').modal('show');
    globalMarker = marker;
}

const setStartStationViaOnclick = () => {
    // clearStartAndEndSearch();
    $("#nearest_bike_locations")[0].innerText = "";
    // Remove old routes
    removeRoute();
    const marker = globalMarker;
    if (destinationStation != null && marker.get('station_id') == destinationStation) {
        alert("Start and destination station cannot be same.")
        return;
    }
    isStartStation = true;
    setStartSelectMarker(marker);
    setStart(marker.get('station_id'));
    // let starting_location_text = $("#start_location_name")[0];
    // starting_location_text.innerHTML = "Starting station: " + marker.get('placeName');
    $("#start_location")[0].value = marker.get('placeName');
    startStation = marker.get('station_id');
    getBikesAvailabilityDetails();
    if (startStation != -1 && destinationStation != -1) {
        getSourceAndDestinationCoordinates();
    }
}

const setEndStationViaOnclick = () => {
    // clearStartAndEndSearch();
    $("#nearest_bike_locations")[0].innerText = "";
    // Remove old routes
    removeRoute();
    const marker = globalMarker;
    if (startStation != null && marker.get('station_id') == startStation) {
        alert("Start and destination station cannot be same.")
        return;
    }
    isStartStation = false;
    setEndSelectMarker(marker);
    setDestination(marker.get('station_id'));
    // let destination_location_text = $("#destination_location_name")[0];
    // destination_location_text.innerHTML = "Destination station: " + marker.get('placeName');
    $("#destination_location")[0].value = marker.get('placeName');
    destinationStation = marker.get('station_id');
    getBikesAvailabilityDetails();
    if (startStation != -1 && destinationStation != -1) {
        getSourceAndDestinationCoordinates();
    }
}

const getBikesAvailabilityDetails = () => {
    const marker = globalMarker;
    closeAllOtherInfo();
    const infowindow = new google.maps.InfoWindow({
        content: "Station Name: " + marker.get('placeName')
    });
    infowindow.open(marker.get('map'), marker);
    InforObj.push(infowindow);
    // $.ajax({
    //     url: API_URL + "/api/station/bikes/get/" + marker.get('station_id'),
    //     type: "GET",
    //     success: function (response) {
    //         closeAllOtherInfo();
    //         const infowindow = new google.maps.InfoWindow({
    //             content: "Station Name: " + marker.get('placeName')
    //             // + "<br/>Available Bike Stands: " + response.available_bike_stands +
    //             //     "<br/>Available Bikes: " + response.available_bikes
    //         });
    //         infowindow.open(marker.get('map'), marker);
    //         InforObj.push(infowindow);
    //     },
    //     error: function (xhr, ajaxOptions, thrownError) {
    //         console.log("Error in getBikesAvailabilityDetails()")
    //         console.log(xhr.status);
    //         console.log(thrownError);
    //     }
    // });
}

const closeOtherInfo = () => {
    if (InforObj.length > 0) {
        InforObj[0].set("marker", null);
        InforObj[0].close();
        InforObj.length = 0;
    }
}

const closeAllOtherInfo = () => {
    for (var i = 0; i < InforObj.length; i++) {
        InforObj[i].close();
    }
}

const initMap = () => {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: centerCords
    });
    addMarkerInfo();
}

const setStartSelectMarker = (marker) => {
    if (sourceMarker != null) {
        sourceMarker.setIcon("static/image/marker_red.png");
        sourceMarker = null;
    };
    sourceMarker = marker;
    marker.setIcon("static/image/marker_black.png");
}

const setEndSelectMarker = (marker) => {
    if (endMarker != null) {
        endMarker.setIcon("static/image/marker_red.png");
        endMarker = null;
    };
    endMarker = marker;
    marker.setIcon("static/image/marker_green.png");
}

const clearStartAndEndSearch = () => {
    $("#start_location")[0].value = "";
    $("#destination_location")[0].value = "";
    $("#nearest_bike_locations")[0].innerText = "";
}