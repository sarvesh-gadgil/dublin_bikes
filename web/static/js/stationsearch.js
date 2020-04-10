 // Reference: https://jqueryui.com/autocomplete/#remote-jsonp
 const LOCATION = {
     SOURCE: "source",
     DESTINATION: "destination"
 };

 const start_location_table =
     "<h5><b>Choose starting station from below:</b></h5><div class=\"list-group\" style=\"text-align: center; font-size: small\">";

 const destination_location_table =
     "<h5><b>Choose destination station from below:</b></h5><div class=\"list-group\" style=\"text-align: center; font-size: small\">";

 $(function () {
     $("#start_location").autocomplete({
         source: function (request, response) {
             $.ajax({
                 url: API_URL + "/api/google/get/places?query=" + request.term,
                 type: "GET",
                 success: function (data) {
                     response(data);
                 },
                 error: function (xhr, ajaxOptions, thrownError) {
                     console.log("Error in start_location")
                     console.log(xhr.status);
                     console.log(thrownError);
                 }
             });
         },
         minLength: 3,
         select: function (event, ui) {
             getPlaceCoordinatesFromPlaceID(ui.item.id, LOCATION.SOURCE);
         },
     });
 });

 $(function () {
     $("#destination_location").autocomplete({
         source: function (request, response) {
             $.ajax({
                 url: API_URL + "/api/google/get/places?query=" + request.term,
                 type: "GET",
                 success: function (data) {
                     response(data);
                 },
                 error: function (xhr, ajaxOptions, thrownError) {
                     console.log("Error in destination_location")
                     console.log(xhr.status);
                     console.log(thrownError);
                 }
             });
         },
         minLength: 3,
         select: function (event, ui) {
             getPlaceCoordinatesFromPlaceID(ui.item.id, LOCATION.DESTINATION);
         },
     });
 });

 const getPlaceCoordinatesFromPlaceID = (place_id, locType) => {
     $.ajax({
         url: API_URL + "/api/google/get/place/coordinates?place_id=" + place_id,
         type: "GET",
         success: function (response) {
             $("#nearest_bike_locations")[0].innerText = "";
             if (response.station_id == null) {
                 displayNearestStations(response, locType);
             } else {
                 const station_name = response.station_name.replace("'", "###");
                 if (locType == LOCATION.SOURCE) {
                     chooseStartLocation(response.station_id, station_name);
                 } else {
                     chooseDestinationLocation(response.station_id, station_name);
                 }
             }
         },
         error: function (xhr, ajaxOptions, thrownError) {
             console.log("Error in getPlaceCoordinatesFromPlaceID()")
             console.log(xhr.status);
             console.log(thrownError);
         }
     });
 }

 const setStart = (data) => {
     let startLoc = $("#selected_start_location")[0];
     startLoc.value = data;
 }

 const setDestination = (data) => {
     let startLoc = $("#selected_destination_location")[0];
     startLoc.value = data;
 }

 const isLocationSet = (locType) => {
     if (locType == LOCATION.SOURCE) {
         return $("#selected_start_location")[0].innerText != "";
     } else {
         return $("#selected_destination_location")[0].innerText != "";
     }
 }

 const displayNearestStations = (latAndLng, locType) => {
     // Resetting the station values
     if (locType == LOCATION.SOURCE && isLocationSet(locType)) {
         setStart("");
     } else if (locType == LOCATION.DESTINATION && isLocationSet(locType)) {
         setDestination("");
     }

     google.maps.event.trigger(map, "resize");
     map.panTo(latAndLng);
     map.setZoom(15);
     closeAllOtherInfo();
     let isDataPresent = false;

     let tableDetails = "";
     if (locType == LOCATION.SOURCE) {
         tableDetails = start_location_table;
     } else {
         tableDetails = destination_location_table;
     }

     for (var i = 0; i < markersOnMap.length; i++) {
         // if this location is within 1KM of the user, add it to the list
         if (distance(latAndLng.lat, latAndLng.lng, markersOnMap[i].LatLng[0].lat, markersOnMap[i].LatLng[0].lng,
                 "K") <= 0.3) {
             isDataPresent = true;
             const station_id = markersOnMap[i].station_id;
             const station_name = markersOnMap[i].placeName;
             const infowindow = new google.maps.InfoWindow({
                 content: "Station Name: " + station_name
             });
             const suggestedStations = markersArray.find(predicate => predicate
                 .station_id == station_id);
             infowindow.open(map, suggestedStations);
             InforObj.push(infowindow);
             // Creating link
             let link = "<a href='#!' class=\"list-group-item\" onclick='";
             if (locType == LOCATION.SOURCE) {
                 link += "chooseStartLocation";
             } else {
                 link += "chooseDestinationLocation";
             }
             const stationReplaced = station_name.replace("'", "###");
             link += "(" + station_id + ",\"" + stationReplaced + "\")'>" + station_name + "</a>";
             tableDetails += link;
         }
     }
     // Getting the div id
     let nearest_bike_locations = $("#nearest_bike_locations")[0]
     if (!isDataPresent) {
         nearest_bike_locations.innerHTML = "<div class=\"alert alert-danger\" style=\"width: auto; text-align: center\">Oops. There are <strong>no stations</strong> found near this location.</div>";
         nearest_bike_locations.style.display = "block";
     } else {
         tableDetails += "</div>"
         // Setting values
         nearest_bike_locations.innerHTML = tableDetails;
         nearest_bike_locations.style.display = "block";
     }
 }

 const chooseStartLocation = (station_id, station_name) => {
     if (destinationStation != null && station_id == destinationStation) {
         swal("Oops...", "Start and destination station cannot be same!", "warning");
         $("#start_location")[0].value = $("#selected_start_location")[0].value;
         return;
     }
     station_name = station_name.replace("###", "'");
     closeAllOtherInfo();
     const infowindow = new google.maps.InfoWindow({
         content: "Station Name: " + station_name
     });
     const choosedStation = markersArray.find(predicate => predicate
         .station_id == station_id);
     infowindow.open(map, choosedStation);
     InforObj.push(infowindow);
     setStart(station_name);
     $("#start_location")[0].value = station_name;
     $("#start_validation")[0].style.display = "none";
     startStation = station_id;
     isStartStation = true;
     setStartSelectMarker(choosedStation);

     // Remove old routes
     removeRoute();
     clearAllRouteInfo();
 }

 const chooseDestinationLocation = (station_id, station_name) => {
     if (startStation != null && station_id == startStation) {
         swal("Oops...", "Start and destination station cannot be same!", "warning");
         $("#destination_location")[0].value = $("#selected_destination_location")[0].value;
         return;
     }
     station_name = station_name.replace("###", "'");
     closeAllOtherInfo();
     const infowindow = new google.maps.InfoWindow({
         content: "Station Name: " + station_name
     });
     const choosedStation = markersArray.find(predicate => predicate
         .station_id == station_id);

     infowindow.open(map, choosedStation);
     InforObj.push(infowindow);
     setDestination(station_name);
     $("#destination_location")[0].value = station_name;
     $("#destination_validation")[0].style.display = "none";
     destinationStation = station_id;
     isStartStation = false;
     setEndSelectMarker(choosedStation);

     // Remove old routes
     removeRoute();
     clearAllRouteInfo();
 }