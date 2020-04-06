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
    var startdataValues = [respObject.start.SUNDAY?respObject.start.SUNDAY.total:0, respObject.start.MONDAY?respObject.start.MONDAY.total:0, respObject.start.TUESDAY?respObject.start.TUESDAY.total:0,respObject.start.WEDNESDAY? respObject.start.WEDNESDAY.total:0, respObject.start.THURSDAY?respObject.start.THURSDAY.total:0,respObject.start.FRIDAY? respObject.start.FRIDAY.total:0,respObject.start.SATURDAY? respObject.start.SATURDAY.total:0 ];
    var enddataValues = [respObject.end.SUNDAY?respObject.end.SUNDAY.total:0, respObject.end.MONDAY?respObject.end.MONDAY.total:0, respObject.end.TUESDAY?respObject.end.TUESDAY.total:0,respObject.end.WEDNESDAY? respObject.end.WEDNESDAY.total:0, respObject.end.THURSDAY?respObject.end.THURSDAY.total:0,respObject.end.FRIDAY? respObject.end.FRIDAY.total:0,respObject.end.SATURDAY? respObject.end.SATURDAY.total:0 ];
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


