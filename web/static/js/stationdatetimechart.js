const openDateTimeWiseChart = () => {
     var start = document.getElementById('selected_start_location').innerText;
     var end = document.getElementById('selected_destination_location').innerText;
     // TODO: add local storage check
     var finalUrl = "/api/station/bikes/static/getBikesTimingMap/" + start + "/" + end
     $.ajax({
         async : false,
         url: finalUrl,
         type: "GET",
         success: function (response) {
            console.log("Success Function");
            populateTimings(response);
         },
         error: function (xhr, ajaxOptions, thrownError) {
             console.log("Error in Chart Details")
             console.log(xhr.status);
             console.log(thrownError);
         }
     });
}

const populateTimings = (response) => {
    console.log(response);
    var respObject = response;
    var startctx = document.getElementById("myChart1").getContext('2d');
    var endctx = document.getElementById("myChart2").getContext('2d');
    var startdataValues = [respObject.start.SUNDAY.total?respObject.start.SUNDAY.total:0, respObject.start.MONDAY.total, respObject.start.TUESDAY.total, respObject.start.WEDNESDAY.total, respObject.start.THURSDAY.total, respObject.start.FRIDAY.total, respObject.start.SATURDAY.total, ];
    var enddataValues = [respObject.end.SUNDAY.total, respObject.end.MONDAY.total, respObject.end.TUESDAY.total, respObject.end.WEDNESDAY.total, respObject.end.THURSDAY.total, respObject.end.FRIDAY.total, respObject.end.SATURDAY.total, ];
    var dataLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


    var myChartStart = new Chart(startctx, {
      type: 'doughnut',
      data: {
        labels: dataLabels,
        datasets: [{
          label: 'Start',
          data: startdataValues,
          backgroundColor: ['rgba(255, 99, 132, 0.8)','blue','green','yellow','orange','red','purple']
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
              beginAtZero:true
            }
          }]
        }
      }
    });

     var myChartEnd = new Chart(endctx, {
      type: 'doughnut',
      data: {
        labels: dataLabels,
        datasets: [{
          label: 'Destination',
          data: enddataValues,
           backgroundColor: ['rgba(255, 99, 132, 0.8)','blue','green','yellow','orange','red','purple']
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
              beginAtZero:true
            }
          }]
        }
      }
    });
}


