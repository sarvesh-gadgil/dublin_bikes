 // Reference: https://jqueryui.com/autocomplete/#remote-jsonp
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
             getPlaceCoordinatesFromPlaceID(ui.item.id);
         },
     });
 });

 const getPlaceCoordinatesFromPlaceID = (place_id) => {
     $.ajax({
         url: API_URL + "/api/google/get/place/coordinates?place_id=" + place_id,
         type: "GET",
         success: function (response) {
             displayNearestStations(response);
         },
         error: function (xhr, ajaxOptions, thrownError) {
             console.log("Error in getPlaceCoordinatesFromPlaceID()")
             console.log(xhr.status);
             console.log(thrownError);
         }
     });
 }

 const displayNearestStations = (latAndLng) => {
     // Resetting the station values
     startStation = -1;
     let to_from_info = $("#to_from_info")[0]
     to_from_info.innerHTML = "";

     google.maps.event.trigger(map, "resize");
     map.panTo(latAndLng);
     map.setZoom(15);
     closeAllOtherInfo();
     let isDataPresent = false;
     let table =
         "<h2>Choose starting station from below:</h2><table border = 1><th>Place Name</th><th>Available Bike Stands</th><th>Available Bikes</th>";
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
                     const link = "<a href='#!' onclick='chooseStartLocation(" + station_id + ",\"" + station_name +
                         "\"," + response.available_bike_stands + "," + response.available_bikes + ")'>" + station_name +
                         "</a>"
                     // Creating td for table
                     table += "<tr><td>" + link + "</td><td>" + response.available_bike_stands +
                         "</td><td>" +
                         response.available_bikes + "</td></tr>";
                 },
                 complete: function (data) {
                     // Getting the div id
                     let nearest_bike_locations = $("#nearest_bike_locations")[0]

                     // Setting values
                     nearest_bike_locations.innerHTML = table;
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
     startStation = station_id;

     // Getting the div id
     let to_from_info = $("#to_from_info")[0]

     // Setting values
     to_from_info.innerHTML = "Starting station: " + station_name;
 }