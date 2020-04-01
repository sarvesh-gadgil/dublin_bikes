 // Reference: https://jqueryui.com/autocomplete/#remote-jsonp
 const LOCATION = {
     SOURCE: "source",
     DESTINATION: "destination"
 };

 const start_location_table =
     "<h2>Choose starting station from below:</h2><table border = 1><th>Place Name</th><th>Available Bike Stands</th><th>Available Bikes</th>";

 const destination_location_table =
     "<h2>Choose destination station from below:</h2><table border = 1><th>Place Name</th><th>Available Bike Stands</th><th>Available Bikes</th>";

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
             if (response.station_id == null) {
                 displayNearestStations(response, locType);
             } else {
                 const station_name = response.station_name.replace("'", "###");
                 if (locType == LOCATION.SOURCE) {
                     chooseStartLocation(response.station_id, station_name, response.available_bike_stands, response.available_bikes);
                 } else {
                     chooseDestinationLocation(response.station_id, station_name, response.available_bike_stands, response.available_bikes);
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
     startLoc.innerText = data;
 }

 const setDestination = (data) => {
     let startLoc = $("#selected_destination_location")[0];
     startLoc.innerText = data;
 }

 //  const resetToFromInfo = () => {
 //      let to_from_info = $("#to_from_info")[0];
 //      to_from_info.innerHTML = "";
 //  }

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
     //  resetToFromInfo();

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
             $.ajax({
                 url: API_URL + "/api/station/bikes/get/" + markersOnMap[i].station_id,
                 type: "GET",
                 success: function (response) {
                     const infowindow = new google.maps.InfoWindow({
                         content: "Station Name: " + station_name +
                             "<br/>Available Bike Stands: " + response.available_bike_stands +
                             "<br/>Available Bikes: " + response.available_bikes
                     });
                     const suggestedStations = markersArray.find(predicate => predicate
                         .station_id == station_id);
                     infowindow.open(map, suggestedStations);
                     InforObj.push(infowindow);
                     // Creating link
                     let link = "<a href='#!' onclick='";
                     if (locType == LOCATION.SOURCE) {
                         link += "chooseStartLocation";
                     } else {
                         link += "chooseDestinationLocation";
                     }
                     const stationReplaced = station_name.replace("'", "###");
                     link += "(" + station_id + ",\"" + stationReplaced +
                         "\"," + response.available_bike_stands + "," + response.available_bikes + ")'>" + station_name +
                         "</a>";
                     // Creating td for table
                     tableDetails += "<tr><td>" + link + "</td><td>" + response.available_bike_stands +
                         "</td><td>" +
                         response.available_bikes + "</td></tr>";
                 },
                 complete: function (data) {
                     // Getting the div id
                     let nearest_bike_locations = $("#nearest_bike_locations")[0]

                     // Setting values
                     nearest_bike_locations.innerHTML = tableDetails;
                     nearest_bike_locations.style.display = "block";
                 },
                 error: function (xhr, ajaxOptions, thrownError) {
                     console.log("Error in selectLocationAndDisplayBikesInfo()")
                     console.log(xhr.status);
                     console.log(thrownError);
                 }
             });
         }
     }
     if (!isDataPresent) {
         // Getting the div id
         let nearest_bike_locations = $("#nearest_bike_locations")[0]

         // Setting values
         nearest_bike_locations.innerHTML = "<br/>No Stations Found";
         nearest_bike_locations.style.display = "block";
     }
 }

 const chooseStartLocation = (station_id, station_name, available_bike_stands, available_bikes) => {
     if (destinationStation != null && station_id == destinationStation) {
         alert("Start and destination station cannot be same.")
         return;
     }
     station_name = station_name.replace("###", "'");
     closeAllOtherInfo();
     const infowindow = new google.maps.InfoWindow({
         content: "Station Name: " + station_name +
             "<br/>Available Bike Stands: " + available_bike_stands +
             "<br/>Available Bikes: " + available_bikes
     });
     const choosedStation = markersArray.find(predicate => predicate
         .station_id == station_id);
     infowindow.open(map, choosedStation);
     InforObj.push(infowindow);
     setStart(station_id);

     // Getting the div id
     let starting_location_text = $("#start_location_name")[0];

     // Setting values
     starting_location_text.innerHTML = "Starting station: " + station_name;

     startStation = station_id;

     isStartStation = true;

     setStartSelectMarker(choosedStation);

     // Remove old routes
     removeRoute();
 }

 const chooseDestinationLocation = (station_id, station_name, available_bike_stands, available_bikes) => {
     if (startStation != null && station_id == startStation) {
         alert("Start and destination station cannot be same.")
         return;
     }
     closeAllOtherInfo();
     const infowindow = new google.maps.InfoWindow({
         content: "Station Name: " + station_name +
             "<br/>Available Bike Stands: " + available_bike_stands +
             "<br/>Available Bikes: " + available_bikes
     });
     const choosedStation = markersArray.find(predicate => predicate
         .station_id == station_id);
     if (station_id == $("#selected_start_location")[0].innerText) {
         alert('Destination station cannot be same as the starting station');
     } else {

         infowindow.open(map, choosedStation);
         InforObj.push(infowindow);
         setDestination(station_id);

         // Getting the div id
         let destination_location_text = $("#destination_location_name")[0];

         // Setting values
         destination_location_text.innerHTML = "Destination station: " + station_name;

         destinationStation = station_id;

         isStartStation = false;

         setEndSelectMarker(choosedStation);

         // Remove old routes
         removeRoute();
     }
 }