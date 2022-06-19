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

let logger_running = false


get_all_time_button.addEventListener('click', function(){
  get_logging_data("all")
});
get_today_time_button.addEventListener('click', function(){
  get_logging_data("today")
});
get_yesterday_time_button.addEventListener('click', function(){
  get_logging_data("yesterday")
});
get_week_time_button.addEventListener('click', function(){
  get_logging_data("week")
});
app_status_button.addEventListener('click', function(){
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
save_button_for_app_status.addEventListener('click', function(){
  save_app_status()
});

function start_logger(){
  console.log("clicked")
  fetch(`http://127.0.0.1:5005/start_logger`)

}
function stop_logger(){
  console.log("Stopping logger")
  fetch(`http://127.0.0.1:5005/stop_logger`)
}
function toggle_closing_apps(){
  console.log("Toggling closing apps")
  fetch(`http://127.0.0.1:5005/toggle_closing_apps`)
}
function save_app_status(){
  var table = document.getElementById("app_status_table")
  var applications = {}
  for (var i = 0; i < table.rows.length; i++) {
    var row = table.rows[i];
    var app_id = row.cells[1].firstChild.id;
    var app_distracting = row.cells[1].firstChild.checked;
    applications[app_id] = app_distracting
  }
  console.log(applications)
  postData('http://localhost:5005/save_app_status', {'applications': applications}).then(data => {
    console.log(data)
  });
}
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
function get_logging_data(time){
  postData('http://localhost:5005/get_time', {'time': time}).then(data => {
    // result.innerHTML = data.data['all_time']
    result.innerHTML = ""
    console.log(data)
    Object.entries(data['time']).forEach(([key, value]) => {
        result.innerHTML += `${key}: ${value/60} minutes<br>`
   });
})
}
function get_app_status(){
  
  fetch('http://localhost:5005/get_app_status').then(response =>response.json()).then(data => {
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