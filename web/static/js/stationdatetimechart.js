var respObjectDaily ; //global - To store the store the response and use it later for selecting based on option
const openDateTimeWiseChartWeekly = () => {
     var start = document.getElementById('selected_start_location').innerText;
     var end = document.getElementById('selected_destination_location').innerText;
     // TODO: add local storage check
     var finalUrl = "/api/station/bikes/static/getBikesTimingWeekly/" + start + "/" + end
     $.ajax({
         async : false,
         url: finalUrl,
         type: "GET",
         success: function (response) {
            console.log("Success Function");
            populateTimingsWeekly(response);
         },
         error: function (xhr, ajaxOptions, thrownError) {
             console.log("Error in Chart Details")
             console.log(xhr.status);
             console.log(thrownError);
         }
     });
}

const openDateTimeWiseChartDaily = () => {
     var start = document.getElementById('selected_start_location').innerText;
     var end = document.getElementById('selected_destination_location').innerText;
     // TODO: add local storage check
     var finalUrl = "/api/station/bikes/static/getBikesTimingDaily/" + start + "/" + end
     $.ajax({
         async : false,
         url: finalUrl,
         type: "GET",
         success: function (response) {
            console.log("Success Function");
            populateTimingsDaily(response);
         },
         error: function (xhr, ajaxOptions, thrownError) {
             console.log("Error in Chart Details")
             console.log(xhr.status);
             console.log(thrownError);
         }
     });
}

const populateTimingsWeekly = (response) => {
    var respObject = response;
    var startctx = document.getElementById("myChart1").getContext('2d');
    var endctx = document.getElementById("myChart2").getContext('2d');
    var startdataValues = [respObject.start.SUNDAY?Math.ceil(respObject.start.SUNDAY.total/24):0, respObject.start.MONDAY?Math.ceil(respObject.start.MONDAY.total/24):0, respObject.start.TUESDAY?Math.ceil(respObject.start.TUESDAY.total/24):0,respObject.start.WEDNESDAY? Math.ceil(respObject.start.WEDNESDAY.total/24):0, respObject.start.THURSDAY?Math.ceil(respObject.start.THURSDAY.total/24):0,respObject.start.FRIDAY?Math.ceil( respObject.start.FRIDAY.total/24):0,respObject.start.SATURDAY?Math.ceil( respObject.start.SATURDAY.total/24):0 ];
    var enddataValues = [respObject.end.SUNDAY?Math.ceil(respObject.end.SUNDAY.total/24):0, respObject.end.MONDAY?Math.ceil(respObject.end.MONDAY.total/24):0, respObject.end.TUESDAY?Math.ceil(respObject.end.TUESDAY.total/24):0,respObject.end.WEDNESDAY?Math.ceil( respObject.end.WEDNESDAY.total/24):0, respObject.end.THURSDAY?Math.ceil(respObject.end.THURSDAY.total/24):0,respObject.end.FRIDAY?Math.ceil( respObject.end.FRIDAY.total/24):0,respObject.end.SATURDAY?Math.ceil( respObject.end.SATURDAY.total/24):0 ];
    var dataLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


    var myChartStart = new Chart(startctx, {
      type: 'line',
      data: {
        labels: dataLabels,
        datasets: [{
        label:'Start',
          data: startdataValues,
          backgroundColor: ['rgba(255, 99, 132, 0.8)']
         // backgroundColor: ['rgba(255, 99, 132, 0.8)','blue','green','yellow','orange','red','purple']
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
      type: 'line',
      data: {
        labels: dataLabels,
        datasets: [{
        label:'Destination',
          data: enddataValues,
           backgroundColor: ['rgba(255, 99, 132, 0.8)']
          // backgroundColor: ['rgba(255, 99, 132, 0.8)','blue','green','yellow','orange','red','purple']
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

const populateTimingsDaily = (response) => {
     respObjectDaily = response;
     populateTimingsDailyTemp();
}

const populateTimingsDailyTemp = () => {
    var day = document.getElementById("chartDay").value;

    var starthourWiseValueHolder = respObjectDaily.start[day].hours;
    var endhourWiseValueHolder = respObjectDaily.end[day].hours;

    var startctx = document.getElementById("myChartDayWise1").getContext('2d');
    var endctx = document.getElementById("myChartDayWise2").getContext('2d');
    var startdataValues = [starthourWiseValueHolder[0],starthourWiseValueHolder[1],starthourWiseValueHolder[2],starthourWiseValueHolder[3],starthourWiseValueHolder[4],starthourWiseValueHolder[5],starthourWiseValueHolder[6],starthourWiseValueHolder[7],starthourWiseValueHolder[8],starthourWiseValueHolder[9],starthourWiseValueHolder[10],starthourWiseValueHolder[11],starthourWiseValueHolder[12],starthourWiseValueHolder[13],starthourWiseValueHolder[14],starthourWiseValueHolder[15],starthourWiseValueHolder[16],starthourWiseValueHolder[17],starthourWiseValueHolder[18],starthourWiseValueHolder[19],starthourWiseValueHolder[20],starthourWiseValueHolder[21],starthourWiseValueHolder[22],starthourWiseValueHolder[23]];
    var enddataValues = [endhourWiseValueHolder[0],endhourWiseValueHolder[1],endhourWiseValueHolder[2],endhourWiseValueHolder[3],endhourWiseValueHolder[4],endhourWiseValueHolder[5],endhourWiseValueHolder[6],endhourWiseValueHolder[7],endhourWiseValueHolder[8],endhourWiseValueHolder[9],endhourWiseValueHolder[10],endhourWiseValueHolder[11],endhourWiseValueHolder[12],endhourWiseValueHolder[13],endhourWiseValueHolder[14],endhourWiseValueHolder[15],endhourWiseValueHolder[16],endhourWiseValueHolder[17],endhourWiseValueHolder[18],endhourWiseValueHolder[19],endhourWiseValueHolder[20],endhourWiseValueHolder[21],endhourWiseValueHolder[22],endhourWiseValueHolder[23]];
    //var startdataValues = [respObject.start.SUNDAY?respObject.start.SUNDAY.total:0, respObject.start.MONDAY?respObject.start.MONDAY.total:0, respObject.start.TUESDAY?respObject.start.TUESDAY.total:0,respObject.start.WEDNESDAY? respObject.start.WEDNESDAY.total:0, respObject.start.THURSDAY?respObject.start.THURSDAY.total:0,respObject.start.FRIDAY? respObject.start.FRIDAY.total:0,respObject.start.SATURDAY? respObject.start.SATURDAY.total:0 ];
    //var enddataValues = [respObject.end.SUNDAY?respObject.end.SUNDAY.total:0, respObject.end.MONDAY?respObject.end.MONDAY.total:0, respObject.end.TUESDAY?respObject.end.TUESDAY.total:0,respObject.end.WEDNESDAY? respObject.end.WEDNESDAY.total:0, respObject.end.THURSDAY?respObject.end.THURSDAY.total:0,respObject.end.FRIDAY? respObject.end.FRIDAY.total:0,respObject.end.SATURDAY? respObject.end.SATURDAY.total:0 ];
    var dataLabels = ['0', '1', '2', '3', '4', '5', '6', '7','8', '9','10', '11', '12', '13', '14', '15', '16', '17','18', '19','20', '21', '22', '23'];

    var myChartStartDayWise = new Chart(startctx, {
      type: 'line',
      data: {
        labels: dataLabels,
        datasets: [{
            label:'Start',
          data: startdataValues,
          backgroundColor: ['rgba(255, 99, 132, 0.8)']
         // backgroundColor: ['rgba(255, 99, 132, 0.8)','blue','green','yellow','orange','red','purple']
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

     var myChartEndDayWise = new Chart(endctx, {
      type: 'line',
      data: {
        labels: dataLabels,
        datasets: [{
        label:'Destination',
          data: enddataValues,
           backgroundColor: ['rgba(255, 99, 132, 0.8)']
          // backgroundColor: ['rgba(255, 99, 132, 0.8)','blue','green','yellow','orange','red','purple']
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


