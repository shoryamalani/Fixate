let input = document.querySelector('#input')
let result = document.querySelector('#result')
let start_logger_button = document.querySelector('#start_logger_button')
let stop_logger_button = document.querySelector('#stop_logger_button')
let toggle_closing_app_button = document.querySelector('#toggle_closing_apps')
let get_all_time_button = document.querySelector('#get_all_time')
let get_today_time_button = document.querySelector('#get_today_time')
let get_yesterday_time_button = document.querySelector('#get_yesterday_time')
let get_week_time_button = document.querySelector('#get_week_time')
let app_status_button = document.querySelector('#app_status_button')
let save_button_for_app_status = document.querySelector('#save_button_for_app_status')
let start_focus_button = document.querySelector('#start_focus_button')
let stop_focus_button = document.querySelector('#stop_focus_button')
var current_timer;
var focus_mode_id;

stop_focus_button.addEventListener('click', function() {
  stop_focus_mode()
});
start_focus_button.addEventListener('click', () => {
  start_focus_mode()
});
get_all_time_button.addEventListener('click', function () {
  get_logging_data("all")
});
get_today_time_button.addEventListener('click', function () {
  get_logging_data("today")
});
get_yesterday_time_button.addEventListener('click', function () {
  get_logging_data("yesterday")
});
get_week_time_button.addEventListener('click', function () {
  get_logging_data("week")
});
app_status_button.addEventListener('click', function () {
  get_app_status()
});

start_logger_button.addEventListener('click', () => {
  start_logger();
});
stop_logger_button.addEventListener('click', () => {
  stop_logger();
});
toggle_closing_app_button.addEventListener('click', () => {
  toggle_closing_apps();
});
save_button_for_app_status.addEventListener('click', function () {
  save_app_status()
});

function stop_focus_mode(){
  clearInterval(current_timer)
  document.getElementById("container_for_focus_mode").hidden=true;
  document.getElementById("set_up_focus_mode").hidden=false;
  document.getElementById("time_left_focus_mode").innerHTML = "";
  document.getElementById("logger_controls_div").hidden=false;
  postData(`http://localhost:5005/stop_focus_mode`, {id: focus_mode_id}).then(data => {
    console.log(data)
  })

}

function start_focus_mode(){
  var time_duration = 0
  if(document.getElementById("length_of_focus_time").value==""){
    time_duration = 30
  }else{
    time_duration = document.getElementById("length_of_focus_time").value
  }
  document.getElementById("set_up_focus_mode").hidden=true;
  document.getElementById("container_for_focus_mode").hidden=false;
  document.getElementById("logger_controls_div").hidden=true;
  start_count_down_timer(time_duration)
  fetch('http://localhost:5005/logger_status').then(response => response.json()).then(data => {
    if(data.data['logger_running_status']!=true){
      start_logger()
    }
    if(data.data['closing_apps']!=true){
      toggle_closing_apps()
    }
  })
  postData(`http://localhost:5005/start_focus_mode`, {"duration": time_duration}).then(data => {
    console.log(data)
  })
}

function start_count_down_timer(duration){
  // Set the date we're counting down to
var countDownDate = new Date().getTime() + duration * 60 * 1000;

// Update the count down every 1 second
current_timer = setInterval(function() {

  // Get today's date and time
  var now = new Date().getTime();

  // Find the distance between now and the count down date
  var distance = countDownDate - now;

  // Time calculations for hours, minutes and seconds
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="demo"
  document.getElementById("time_left_focus_mode").innerHTML =  hours + ":"
  + minutes + ":" + seconds;

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("time_left_focus_mode").innerHTML = "COMPLETE";
  }
}, 1000);
}

function start_logger() {
  console.log("clicked")
  fetch(`http://127.0.0.1:5005/start_logger`)

}

function stop_logger() {
  console.log("Stopping logger")
  fetch(`http://127.0.0.1:5005/stop_logger`)
}

function toggle_closing_apps() {
  console.log("Toggling closing apps")
  fetch(`http://127.0.0.1:5005/toggle_closing_apps`)
}

function save_app_status() {
  var table = document.getElementById("app_status_table")
  var applications = {}
  for (var i = 0; i < table.rows.length; i++) {
    var row = table.rows[i];
    var app_id = row.cells[1].firstChild.id;
    var app_distracting = row.cells[1].firstChild.checked;
    applications[app_id] = app_distracting
  }
  console.log(applications)
  postData('http://localhost:5005/save_app_status', {
    'applications': applications
  }).then(data => {
    console.log(data)
  });
}
setInterval(function () {
  fetch('http://localhost:5005/logger_status').then(response => response.json()).then(data => {
    if (data['logger_running_status'] == true) {
      document.getElementById("start_logger_button").hidden = true
      document.getElementById("stop_logger_button").hidden = false
      document.getElementById("is_logging").innerText = "Logger is running"
    } else {
      document.getElementById("start_logger_button").hidden = false
      document.getElementById("stop_logger_button").hidden = true
      document.getElementById("is_logging").innerText = "Logger is not running"
    }
    if (data['closing_apps'] == true) {
      document.getElementById("closing_app_status").innerText = "Closing apps is enabled"
    } else {
      document.getElementById("closing_app_status").innerText = "Closing apps is disabled"
    }
  })
}, 2000)
async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

function get_logging_data(time) {
  postData('http://localhost:5005/get_time', {
    'time': time
  }).then(data => {
    // result.innerHTML = data.data['all_time']
    result.innerHTML = ""
    console.log(data)
    data['time'].forEach((value) => {
      result.innerHTML += `${value[0]}: ${(value[1]/60).toFixed(2)} minutes<br>`
    });
    var final_for_chart = []
    data['time'].forEach((value) => {
      if (value[0] != "Total" && value[1] > 180) {
        final_for_chart.push({
          "x": value[0],
          "y": (value[1] / 60).toFixed(2)
        })
      }
    });
    var options = {
      "chart": {
        "height": 800,
        "type": "treemap"
      },
      "plotOptions": {
        "treemap": {
          "enableShades": false,
        }
      },
      "series": [{
        "data": final_for_chart
      }]
    }
    // create the chart

    var chart = new ApexCharts(document.querySelector("#time_result_chart"), options);
    chart.render();
  })
}

function get_app_status() {

  fetch('http://localhost:5005/get_app_status').then(response => response.json()).then(data => {
    document.getElementById("app_status_instructions").hidden = false
    document.getElementById("save_button_for_app_status").hidden = false
    document.getElementById("app_status_table").innerHTML = ""
    var table = document.getElementById("app_status_table")
    console.log(data)
    Object.entries(data['applications']).forEach(([key, value]) => {
      table.innerHTML += `<tr><td>${value["name"]}</td><td><input type="checkbox" id='${key}' ${(Boolean(value["distracting"])) ? "checked":"unchecked"}></td></tr>`
      console.log(Boolean(value["distracting"]))

    });
    sortTable()
    document.getElementById("app_status_table").hidden = false
  })
}
// start_logger_button.dispatchEvent(new Event('click'))
function sortTable() {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("app_status_table");
  switching = true;
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      x = rows[i].getElementsByTagName("td")[0];
      y = rows[i + 1].getElementsByTagName("td")[0];
      // Check if the two rows should switch place:
      if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
        // If so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}