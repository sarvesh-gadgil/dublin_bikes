var weeklyDataLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var hourlyDataLabels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
var hourlyChart = null,
    weeklyChart = null;

const displayWeeklyChartPerStation = () => {
    if (weeklyChart != null) {
        weeklyChart.destroy();
    }
    $("#show_hide_loader_weekly")[0].style.display = "block";
    $.ajax({
        url: "/api/station/bikes/chart/weekly/" + currentChartStation,
        type: "GET",
        success: function (response) {
            $("#show_hide_loader_weekly")[0].style.display = "none";
            var ctx = document.getElementById('weeklyChart').getContext('2d');
            weeklyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: weeklyDataLabels,
                    datasets: [{
                        label: 'Average Weekly Bike Availability',
                        data: [response.sunday, response.monday, response.tuesday, response.wednesday, response.thursday, response.friday, response.saturday],
                        // data: [1, 2, 3, response.wednesday, response.thursday, response.friday, response.saturday],
                        backgroundColor: ['rgb(41, 41, 41)']
                    }]
                },
                options: {
                    scales: {
                        xAxes: [{
                            display: false,
                            barPercentage: 1.3,
                            ticks: {
                                max: 3,
                            }
                        }, {
                            display: true,
                            ticks: {
                                autoSkip: false,
                                max: 4,
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("Error in Weekly Chart Details")
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}

const displayHourlyChartPerStation = () => {
    if (hourlyChart != null) {
        hourlyChart.destroy();
    }
    $("#show_hide_loader_hourly")[0].style.display = "block";
    $.ajax({
        url: "/api/station/bikes/chart/hourly/" + currentChartStation + "?startDate=" + $("#selected_datetime")[0].value,
        type: "GET",
        success: function (response) {
            $("#show_hide_loader_hourly")[0].style.display = "none";
            var ctx = document.getElementById('hourlyChart').getContext('2d');
            hourlyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: hourlyDataLabels,
                    datasets: [{
                        label: 'Average Hourly Bike Availability',
                        data: [response.hour_0, response.hour_1, response.hour_2, response.hour_3,
                            response.hour_4, response.hour_5, response.hour_6, response.hour_7, response.hour_8,
                            response.hour_9, response.hour_10, response.hour_11, response.hour_12, response.hour_13,
                            response.hour_14, response.hour_15, response.hour_16, response.hour_17, response.hour_18,
                            response.hour_19, response.hour_20, response.hour_21, response.hour_22, response.hour_23
                        ],
                        backgroundColor: ['rgb(41, 41, 41)']
                    }]
                },
                options: {
                    scales: {
                        xAxes: [{
                            display: false,
                            barPercentage: 1.3,
                            ticks: {
                                max: 3,
                            }
                        }, {
                            display: true,
                            ticks: {
                                autoSkip: false,
                                max: 4,
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log("Error in Hourly Chart Details")
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}