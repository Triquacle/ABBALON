const ws = new WebSocket("ws://localhost:5500");
ws.addEventListener("open", ()=>{
  ws.send("session_request")
})
state = "";
ws.addEventListener("message", ({data}) =>{
  console.log(`server sent us ${data}`);

  if (data.slice(0, 4) == "data"){
    new_state = data.slice(4, data.length);
    console.log(`new state:${new_state}`);
    state = new_state;
    render()
  }

  else if (data.slice(0, 5) == "white"){

  }

  else if ((data.slice(0, 3) == "red")){
    rotate_board()
  }
})

var selected = [];
var command = "9";

// add/remove an element to selected lşst and change its class
function select(elementid) {
  if (selected.includes(document.getElementById(elementid))){
    selected.pop(document.getElementById(elementid));
    document.getElementById(elementid).className = document.getElementById(elementid).className.replace(" selected", "");
    console.log(elementid + " removed")
  }
  else{
    selected.push(document.getElementById(elementid));
    document.getElementById(elementid).className += " selected";
    console.log(elementid + " added")
  }
}
// read move command and send a move_requets to server
function read_command(){
    command = document.getElementById("text").value;

    let data_selected = [];
    for (let i = 0; i < selected.length; i++){
      selected_id = selected[i].id
      data_selected.push(selected_id)
    }

    console.log(data_selected);
    console.log(command);

    command_string = command.toString();
    data_selected_string = "";
    for (let i = 0; i<data_selected.length; i++){
      data_selected_string += data_selected[i].toString();
    }
    data = data_selected_string + command_string;
    ws.send(`move_request${data}`);
    selected = []
  }
// Give the appropriate classes to the buttons according to server state data
function render(){
  all_elements = document.getElementsByTagName("button")
  for (let i = 0; i < all_elements.length; i++){
    all_elements[i].className = "circle grey"
  }

  for (let i = 0; i < state.length / 3; i++){
    id = state[i*3] + state[i*3 + 1]
    color = state[i*3 + 2]

    element = document.getElementById(id)
    if (color == "W")
      element.className = "circle white"
    if (color == "R")
      element.className = "circle red"
  }
}

function rotate_board(){
  all_elements = document.getElementsByTagName("button")
  for (let i = 0; i < all_elements.length; i++){
    all_elements[i].id = all_elements[i].id[0] + (8 - parseInt(all_elements[i].id[1])).toString()
  }
}

//Modal Box username check function
function check(){
  let form  = document.forms["play-form"];
  let checkusername = form["name"].value;

  if(checkusername == ""){
      alert("Username must be entered");
      return(false);
  }
  return(true);
}