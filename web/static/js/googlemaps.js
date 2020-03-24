// Map variables
var markersOnMap = [];
var map;
var InforObj = [];
const centerCords = {
    lat: 53.357841,
    lng: -6.251557
};
var markersArray = [];

const addMarkerInfo = () => {
    for (var i = 0; i < markersOnMap.length; i++) {
        const marker = new google.maps.Marker({
            position: markersOnMap[i].LatLng[0],
            map: map,
            animation: google.maps.Animation.DROP,
            station_id: markersOnMap[i].station_id,
            placeName: markersOnMap[i].placeName
        });
        marker.addListener('click', function () {
            getBikesAvailabilityDetails(marker);
        });
        markersArray.push(marker);
    }
}

const getBikesAvailabilityDetails = (marker) => {

    $.ajax({
        url: API_URL + "/api/station/bikes/get/" + marker.get('station_id'),
        type: "GET",
        success: function (response) {
            closeAllOtherInfo();
            const infowindow = new google.maps.InfoWindow({
                content: "Station Name: " + marker.get('placeName') +
                    "<br/>Available Bike Stands: " + response.available_bike_stands +
                    "<br/>Available Bikes: " + response.available_bikes
            });
            infowindow.open(marker.get('map'), marker);
            InforObj.push(infowindow);

            startStation = marker.get('station_id');

            // Getting the div id
            let to_from_info = $("#to_from_info")[0]

            // Setting values
            to_from_info.innerHTML = "Starting station: " + marker.get('placeName');
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("Error in getBikesAvailabilityDetails()")
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
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
        zoom: 12,
        center: centerCords
    });
    addMarkerInfo();
}