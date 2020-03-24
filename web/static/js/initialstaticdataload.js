// URL for APIs
const API_URL = "http://127.0.0.1:5000";
const API_KEY = "AIzaSyASZwn9rm720DhYXGEw5FAn-Frp-Oi1bCY";
var static_bikes_details = [];
var markersOnMapCount = 0;
var startStation = -1; // -1 means station has not been choosed

$(document).ready(function () {
    loadStaticBikesData()
});

const loadStaticBikesData = () => {
    // Getting static bikes data from server
    $.ajax({
        url: API_URL + "/api/station/bikes/static/all",
        type: "GET",
        success: function (response) {
            // let select_field = "<select id=\"stations\" onchange=\"selectLocationAndDisplayBikesInfo();\">";
            // select_field += "<option value=''>Select a location</option>"

            // Iterating the response
            response.forEach(function (element) {
                static_bikes_details.push(element);

                // Pushing values for select field
                // select_field += "<option value=" + element.number + ">" + element.name + "</option>";

                // Pushing the co-ordinates in map
                markersOnMap.push({
                    placeName: element.name,
                    LatLng: [{
                        lat: parseFloat(element.lat),
                        lng: parseFloat(element.lng)
                    }],
                    station_id: element.number
                });
            });

            markersOnMapCount = markersOnMap.length;
            // select_field += "</select>";

            // Getting the div id
            // let bike_locations = $("#bike_locations")[0]

            // Setting values
            // bike_locations.innerHTML = select_field;
            // bike_locations.style.display = "block";

            // Initialize the map
            initMap();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("Error in loadStaticBikesData()")
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}

const selectLocationAndDisplayBikesInfo = () => {
    const station_id = $("#stations :selected").val();

    // Getting latest availability bikes data
    $.ajax({
        url: API_URL + "/api/station/bikes/get/" + station_id,
        type: "GET",
        success: function (response) {
            const static_bike_markers = markersArray.find(predicate => predicate.station_id == station_id);
            google.maps.event.trigger(map, "resize");
            map.panTo(static_bike_markers.position);
            map.setZoom(14);
            closeAllOtherInfo();
            const infowindow = new google.maps.InfoWindow({
                content: 'Available Bike Stands: ' + response.available_bike_stands +
                    "<br/>Available Bikes: " + '' + response.available_bikes
            });
            infowindow.open(map, static_bike_markers);
            InforObj.push(infowindow);
            const currentMarker = markersOnMap.find(predicate => predicate.station_id == station_id);
            for (var i = 0; i < markersOnMap.length; i++) {
                // if this location is within 1KM of the user, add it to the list
                if (distance(currentMarker.LatLng[0].lat, currentMarker.LatLng[0].lng, markersOnMap[i]
                        .LatLng[0].lat, markersOnMap[i].LatLng[0].lng, "K") <= 0.3 && station_id != markersOnMap[i]
                    .station_id) {
                    const station_id = markersOnMap[i].station_id;
                    $.ajax({
                        url: API_URL + "/api/station/bikes/get/" + markersOnMap[i].station_id,
                        type: "GET",
                        success: function (response) {
                            const infowindow = new google.maps.InfoWindow({
                                content: 'Available Bike Stands: ' + response.available_bike_stands +
                                    "<br/>Available Bikes: " + '' + response.available_bikes
                            });
                            const suggestedStations = markersArray.find(predicate => predicate
                                .station_id == station_id);
                            infowindow.open(map, suggestedStations);
                            InforObj.push(infowindow);
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            console.log("Error in selectLocationAndDisplayBikesInfo()")
                            console.log(xhr.status);
                            console.log(thrownError);
                        }
                    });
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("Error in selectLocationAndDisplayBikesInfo()")
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}

// Reference: https://stackoverflow.com/questions/51819224/how-to-find-nearest-location-using-latitude-and-longitude-from-a-json-data
const distance = (lat1, lon1, lat2, lon2, unit) => {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") {
        dist = dist * 1.609344
    }
    if (unit == "N") {
        dist = dist * 0.8684
    }
    return dist
}