const checkStartFieldValidity = () => {
    if (startStation == -1) {
        $("#start_validation")[0].style.display = "block";
    } else {
        $("#start_validation")[0].style.display = "none";
    }
}
const checkDestinationFieldValidity = () => {
    if (destinationStation == -1) {
        $("#destination_validation")[0].style.display = "block";
    } else {
        $("#destination_validation")[0].style.display = "none";
    }
}
const removeStartStationOnKeyUp = () => {
    if (sourceMarker != null) {
        sourceMarker.setIcon("static/image/marker_red.png");
        sourceMarker = null;
    }
    startStation = -1;
    $("#selected_start_location")[0].value = $("#start_location")[0].value;
}
const removeDestinationStationOnKeyUp = () => {
    if (endMarker != null) {
        endMarker.setIcon("static/image/marker_red.png");
        endMarker = null;
    }
    destinationStation = -1;
    $("#selected_destination_location")[0].value = $("#destination_location")[0].value;
}