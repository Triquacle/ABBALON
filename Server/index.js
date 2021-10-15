const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 5500 });
clients = [];
sessions = [];
python_client = null;
session_requesters = []
turn_color = null;

wss.on("connection", function connection(ws, req){
    const client_ip = req.socket.remoteAddress;
    clients.push(ws);
    console.log(`a user connected ip:${client_ip}`);
    ws.send("welcome");

    ws.on("message", data  =>{
        data = `${data}`;
        console.log(`a client sent us: ${data}`);

        if (data == "python connected"){ // verify python client
            console.log("client identified as python_client");
            python_client = ws;
            clients.splice(clients.indexOf(ws));
        }

        else if(data == "session_request"){ // session request from browser
            found_session = false
            for(let i = 0; i < sessions.length; i++){
                if (sessions[i].length == 2){
                    sessions[i].push(ws)
                    python_client.send(`session_start${sessions[i][0]}`)
                    sessions[i][1].send("red")
                    sessions[i][2].send("white")
                    found_session = true
                }
            }
            if (python_client != null && found_session == false){
                python_client.send("session_request"); // send session request to python
                session_requesters.push(ws);
            }
        }
        
        else if (data.slice(0,12) == "move_request"){ //move information from browser
                if (python_client != null){
                    console.log("sending message to python_client");
                    move_data = data.slice(12, data.length);
                    color_check = false;
                    let session_id = null;
                    turn_check = false;
                    for (let i = 0; i < sessions.length; i++){
                        if (sessions[i].includes(ws)){
                            session_id = sessions[i][0];
                            index = sessions[i].indexOf(ws)
                            console.log(turn_color, )
                            if ((turn_color == "W" && index == 2) || (turn_color == "R" && index == 1))
                                turn_check = true;
                        }
                    }
                    if (turn_check)
                        python_client.send(`move_data${session_id},${move_data}`); // send move information to python    
            }
        }

        else if (data.slice(0,10) == "session_id"){
            session_id = data.slice(10, data.length);
                session_id = `${session_id}`;
                sessions.push([session_id, session_requesters[0]]) // save session id
                session_requesters.splice(session_requesters.indexOf(session_requesters[0]))
        }

        else if (ws == python_client && data.slice(0, 12) == "move_respond"){ // move respond info from python
            data = data.slice(12, data.length);
            let parts = data.split(",");
            let session_id = parts[0];
            let move_data = parts[1];  
            turn_color = parts[2];
            for (let i = 0; i < sessions.length; i++){
                if (sessions[i][0] == session_id){
                    console.log(`sending new state data to all clients (length:${clients.length})`);
                    for (let j = 1; j < sessions[i].length; j++){
                        sessions[i][j].send(move_data);
                    }
                }
            }
        }
    });
    ws.on("close", () => {
        clients.splice(clients.indexOf(ws));
        for (let i = 0; i < sessions.length; i++){
            if (sessions[i].includes(ws)){
                python_client.send("session_close"+sessions[i][0])
                
                console.log("informing every client that session is closed")
                for (let j = 1; j < sessions[i].length; j++){
                    sessions[i][j].send("session_closed");
                }
                sessions.splice(sessions.indexOf(sessions[i]))
            }
        }
        console.log("a user disconnected");
    } )
})