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
let get_last_5_hours_button = document.querySelector('#get_last_5_hours')
let make_task_button = document.querySelector('#add_daily_focus')
var current_timer;
var focus_mode_id;
var focus_mode_running_val = false
var all_tasks = []

get_last_5_hours_button.addEventListener('click', function() {
  get_logging_data("last_five_hours")
});
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
make_task_button.addEventListener('click', function () {
  make_task()
});

// this is an init function to get all the daily tasks
function get_daily_tasks() {
  fetch(`http://localhost:5005/get_daily_tasks`).then(response => response.json()).then(data => {
    console.log(data)  
    all_tasks = data["tasks"]
    document.querySelector("#daily_tasks_table").innerHTML = ""
    data["tasks"].reverse().forEach(task_data => {
      var tr = make_task_tr(task_data)
      document.querySelector("#daily_tasks_table").appendChild(tr)
    });
  }).catch(err => {console.log(err)});
}

function make_task_tr(task_data) {
  if (document.querySelector("#no_daily_tasks")){
    document.querySelector("#no_daily_tasks").hidden = true
  }
  console.log(task_data)
  var tr = document.createElement("tr");
  tr.id = "task_"+task_data["id"]
  
  if(task_data["complete"]){
    tr.className = "completed_task task_tr"
  }else{
    tr.className = "task_tr"
  }

  var td_name = document.createElement("td");
  td_name.innerHTML = task_data["name"]
  td_name.id = "task_name_"+task_data["id"]
  var td_date_created = document.createElement("td");
  td_date_created.innerHTML = task_data["date_created"]
  var td_completion = document.createElement("td");
  console.log(task_data["time_completed"]/task_data["estimated_time"])
  td_completion.innerHTML = ((task_data["time_completed"]/task_data["estimated_time"])*100).toFixed(2) + "%" + " (" +(task_data["estimated_time"]- task_data["time_completed"]) + " minutes left)"
  var td_complete = document.createElement("td");
  var complete_button = document.createElement("button");
  complete_button.innerHTML = "Complete"
  complete_button.className = "float-child-element button-success"
  complete_button.addEventListener('click', function(){
    complete_task(task_data["id"])
  })
  td_complete.appendChild(complete_button)
  var td_abandon = document.createElement("td");
  var abandon_button = document.createElement("button");
  abandon_button.innerHTML = "Stop Showing"
  abandon_button.className = "float-child-element button-error"
  abandon_button.addEventListener('click', function(){
    stop_showing_task(task_data["id"])
  })
  td_abandon.appendChild(abandon_button)
  var td_go_through_focus_modes = document.createElement("td");
  var go_through_focus_modes_button = document.createElement("button");
  go_through_focus_modes_button.innerHTML = "Go through focus modes"
  go_through_focus_modes_button.className = "float-child-element button-secondary"
  go_through_focus_modes_button.addEventListener('click', function(){
    go_to_focus_modes_of_task(task_data["id"])
  })
  var td_start_focus_mode = document.createElement("td");
  var start_focus_mode_button = document.createElement("button");
  start_focus_mode_button.innerHTML = "Start focus mode"
  start_focus_mode_button.className = "float-child-element button-success"
  start_focus_mode_button.addEventListener('click', function(){
    start_focus_mode_of_task(task_data["id"])
  })
  td_start_focus_mode.appendChild(start_focus_mode_button)
  td_go_through_focus_modes.appendChild(go_through_focus_modes_button)
  tr.appendChild(td_name)
  tr.appendChild(td_date_created)
  tr.appendChild(td_completion)
  tr.appendChild(td_complete)
  tr.appendChild(td_abandon)
  tr.appendChild(td_go_through_focus_modes)
  tr.appendChild(td_start_focus_mode)
  return tr

}



function get_all_focus_sessions() {
  fetch(`http://localhost:5005/get_all_focus_sessions`).then(response => response.json()).then(data => {
    console.log(data)
    document.querySelector("#previous_focus_modes_table_for_time_search").innerHTML = ""
    data["focus_sessions"].reverse().forEach(focus_session => {  
      var tr_session = create_focus_session_tr(focus_session)
      document.querySelector("#previous_focus_modes_table_for_time_search").appendChild(tr_session)
      document.querySelector("#no_previous_focus_modes").hidden = true
    });
}).catch(err => {console.log(err)});
}

function create_focus_session_tr(focus_session) {
  console.log(focus_session)
  var tr = document.createElement("tr");
  tr.id = "focus_session_tr_" + focus_session["id"]
  tr.className = "focus_session_tr"
  var td_name = document.createElement("td");
  td_name.innerHTML = focus_session["name"] ? focus_session["name"] : "No name"
  var td_date_created = document.createElement("td");
  td_date_created.innerHTML = focus_session["start_time"]
  var td_stated_completion = document.createElement("td");
  td_stated_completion.innerHTML = focus_session["stated_duration"]
  var td_completion = document.createElement("td");
  if(focus_session["time_completed"]){
    td_completion.innerHTML = focus_session["time_completed"].toFixed(2) + " minutes"
  } else {
    td_completion.innerHTML = "Not completed"
  }
  // td_completion.innerHTML = Math.round(focus_session["time_completed"]*100)/100 ? focus_session["time_completed"] : "Not finished"
  var td_see_time_spent = document.createElement("td");
  var see_time_spent_button = document.createElement("button");
  see_time_spent_button.innerHTML = "See time spent"
  see_time_spent_button.className = "float-child-element button-secondary"
  see_time_spent_button.addEventListener('click', function(){
    get_time_spent_in_focus_session(focus_session["id"])
  })
  td_see_time_spent.appendChild(see_time_spent_button)
  tr.appendChild(td_name)
  tr.appendChild(td_date_created)
  tr.appendChild(td_stated_completion)
  tr.appendChild(td_completion)
  tr.appendChild(td_see_time_spent)
  return tr

}


function get_time_spent_in_focus_session(id){
  get_logging_data(null,id)
}

function stop_focus_mode(){
  focus_mode_running_val = false
  clearInterval(current_timer)
  document.getElementById("container_for_focus_mode").hidden=true;
  document.getElementById("set_up_focus_mode").hidden=false;
  document.getElementById("time_left_focus_mode").innerHTML = "";
  document.getElementById("logger_controls_div").hidden=false;
  postData(`http://localhost:5005/stop_focus_mode`, {"id": focus_mode_id}).then(data => {
    console.log(data)
    setTimeout(get_all_focus_sessions, 1000)
    setTimeout(get_daily_tasks, 1000)
  })
  

}
function reset_focus_mode_search(){
  tasks = document.getElementsByClassName("focus_session_tr")
  for (var i = 0; i < tasks.length; i++) {
    tasks[i].hidden = false
  }
}
function go_to_focus_modes_of_task(id){
  tasks = document.getElementsByClassName("focus_session_tr")
  var focus_modes = []
  for (var i = 0; i < all_tasks.length; i++) {
    if(all_tasks[i]["id"] == id){
      focus_modes = all_tasks[i]["ids_of_focus_modes"]
    }
  }
  for (let i = 0; i < tasks.length; i++) {
    if(!focus_modes.includes(Number(tasks[i].id.split("_")[tasks[i].id.split("_").length-1]))){
      tasks[i].hidden = true
    }else{
      tasks[i].hidden = false
    }
  }
}

function start_focus_mode(){
  if(focus_mode_running()){
    alert("Focus mode already running")
    return false
  }
  var time_duration = 0
  if(document.getElementById("length_of_focus_time").value==""){
    time_duration = 30
  }else{
    time_duration = document.getElementById("length_of_focus_time").value
  }
  task_name = document.getElementById("focus_name_input").value
  task_name.value = ""
  
  send_notif_and_set_up_focus_mode(task_name, time_duration)
  send_start_focus_mode(time_duration, task_name)

}
function send_notif_and_set_up_focus_mode(task_name, time_duration){
  focus_mode_running_val = true
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification(task_name ? task_name != "": "Focus Mode Started", { 
      title: task_name ? task_name != "": "Focus Mode Started",
      body: time_duration + " minutes"
    });
  }
  document.getElementById("set_up_focus_mode").hidden=true;
  document.getElementById("container_for_focus_mode").hidden=false;
  document.getElementById("logger_controls_div").hidden=true;
  start_count_down_timer(time_duration)
}
function focus_mode_running(){
  if(focus_mode_running_val){
    return true
  }
  return false
}
function send_start_focus_mode(time_duration, task_name, task_id=null){
  
  fetch('http://localhost:5005/logger_status').then(response => response.json()).then(data => {
    console.log(data)
    if(data['logger_running_status']!=true){
      start_logger()
    }
    if(data['closing_apps']!=true){
      toggle_closing_apps()
    }
  }
  )
  postData(`http://localhost:5005/start_focus_mode`, {"duration": time_duration, "name": task_name,"task_id":task_id}).then(data => {
    console.log(data)
    focus_mode_id = data['id']
  })
}
function start_focus_mode_of_task(task_id){
  if(focus_mode_running()){
    alert("Focus mode already running")
  }else{
    task_name = document.querySelector("#task_name_"+task_id).textContent
    send_notif_and_set_up_focus_mode(task_name, 20, task_id)
    send_start_focus_mode(20, task_name, task_id)
  }
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
    document.getElementById("time_left_focus_mode").innerHTML = "COMPLETE";
    send_finshed_focus_mode_notification()
    stop_focus_mode()
  }
}, 1000);
}

function send_finshed_focus_mode_notification() {
  var notification = new Notification('Focus mode finished', {
    title: 'Congratulations',
    body: 'Focus mode finished'
  })
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
function stop_showing_task(task_id){
  console.log("Stop Showing Task")
  postData(`http:///127.0.0.1:5005/stop_showing_task`, {"id": task_id}).then(data => {
    console.log(data)
    setTimeout(get_daily_tasks, 1000)
  })
}
function complete_task(task_id){
  console.log("Completing task")
  postData(`http:///127.0.0.1:5005/complete_task`, {"id": task_id}).then(data => {
    console.log(data)
    setTimeout(get_daily_tasks, 1000)
  })
}

function make_task(){
  console.log("Making task")
  task_name = document.getElementById("task_name_input").value
  task_name.value = ""
  task_estimate_time = document.getElementById("guessed_time_duration").value
  task_estimate_time.value = 30
  task_repeating = document.getElementById("repeating_daily_focus_input").checked
  postData(`http://localhost:5005/add_daily_task`, {"name": task_name,"task_estimate_time":task_estimate_time,"task_repeating":task_repeating}).then(data => {
    console.log(data)
  })
  get_daily_tasks()
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
      document.getElementById("toggle_closing_apps").classList = ["float-child-element button-error"]
      document.getElementById("toggle_closing_apps").value = "Disable Closing Apps"
    } else {
      document.getElementById("closing_app_status").innerText = "Closing apps is disabled"
      document.getElementById("toggle_closing_apps").classList = ["float-child-element button-success"]
      document.getElementById("toggle_closing_apps").value = "Enable Closing Apps"
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

function get_logging_data(time=null,id=null) {
  postData('http://localhost:5005/get_time_log', { // sends an time if its a preset and sends the id if its from a focus mode
    'time': time,
    'id': id
  }).then(data => {
    // result.innerHTML = data.data['all_time']
    result.innerHTML = ""
    console.log(data)
    data['time'].forEach((value) => {
      result.innerHTML += `${value[0]}: ${(value[1]/60).toFixed(2)} minutes<br>`
    });
    var final_for_chart = []
    data['time'].forEach((value) => {
      if (value[0] != "Total") {
        if(data['time'][0][1] > 15000){
          if(value[1] > 180){
            final_for_chart.push({
              "x": value[0],
              "y": (value[1] / 60).toFixed(2)
            })
          }
        } else {
          final_for_chart.push({
            "x": value[0],
            "y": (value[1] / 60).toFixed(2)
          })
        } 
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
    document.querySelector("#time_result_name").innerHTML = "In the time segment of " + data['name'] + ", " + (data['time'][0][1]/60).toFixed(2) + " minutes have been logged."
    document.querySelector("#distractions_list_for_review").innerHTML ="Your Applications and Websites listed as distractions included <br>" + data['relevant_distractions'].join(", ")
    document.getElementById("number_of_times_distracted").innerText = "During this time period you were distracted "+data['distractions']['distractions_number']+" times; "
    document.getElementById("average_time_between_distractions").innerText = "During this time, on average, you were distracted every " +(data['distractions']['distractions_time_min']*60).toFixed(2) + " seconds based on apps that are currently deemed distracting."
    
  })
}

function set_clicked(id) {
  var checkbox = document.getElementById(id)
  checkbox.checked = !checkbox.checked
}

function search_table_refresh(){
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("app_status_search");
  filter = input.value.toUpperCase();
  table = document.getElementById("app_status_table");
  tr = table.getElementsByTagName("tbody");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        if(document.getElementById("app_status_distracted_check").checked == true){
          if( tr[i].getElementsByTagName("td")[1].firstChild.checked){
            tr[i].style.display = "";
          }else{
            tr[i].style.display = "none";
          }
        }else{
          tr[i].style.display = "";
        }
      } else {
        tr[i].style.display = "none";
      }
    } 
  }
}

function get_app_status() {

  fetch('http://localhost:5005/get_app_status').then(response => response.json()).then(data => {
    document.getElementById("app_status_instructions").hidden = false
    document.getElementById("save_button_for_app_status").hidden = false
    document.getElementById("app_status_table").innerHTML = ""
    var table = document.getElementById("app_status_table")
    console.log(data)
    Object.entries(data['applications']).forEach(([key, value]) => {
      table.innerHTML += `<tr><td onclick="set_clicked(${key})">${value["name"]}</td><td><input type="checkbox" id='${key}' ${(Boolean(value["distracting"])) ? "checked":"unchecked"}></td></tr>`
      console.log(Boolean(value["distracting"]))

    });
    // sortTable()
    document.getElementById("app_status_table_div").hidden = false
    document.getElementById("app_status_search").hidden = false
    document.getElementById("app_status_distracted_check").hidden = false
    document.getElementById("app_status_distracted_check_label").hidden = false
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

function start_running(){
      fetch('http://localhost:5005/is_running').then(response => response.json()).then(data => {
        get_daily_tasks()
        get_all_focus_sessions()
      }).catch(error => {
        console.log("trying to start")
        setTimeout(start_running, 1000);
      })
    
}
start_running()