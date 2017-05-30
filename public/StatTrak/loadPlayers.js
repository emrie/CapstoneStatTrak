var score = 0;
var score2 = 0;
var players;
var players2;
var teamCode1;
var teamCode2;
var team1;
var team2;

function add(x, number) {
    score += x;
    if (x != 3) {
        document.getElementById("score").innerHTML = "Score: " + score;
    } else {
        document.getElementById("score").innerHTML = "Score: " + score;
    }
    addToPlayer(x, number);
    var currScore = parseInt(document.getElementById(number).innerHTML);
    currScore += x;
    document.getElementById(number).innerHTML = currScore;
}

function add2(x, number) {
    score2 += x;
    if (x != 3) {
        document.getElementById("score2").innerHTML = "Score: " + score2;
    } else {
        document.getElementById("score2").innerHTML = "Score: " + score2;
    }
    addToPlayer2(x, number);
    var currScore = parseInt(document.getElementById(number).innerHTML);
    currScore += x;
    document.getElementById(number).innerHTML = currScore;
}

function addToPlayer(x, number) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].number == number) {
            if (x == 1) {
                players[i].pt1++;
            } else if (x == 2) {
                players[i].pt2++;
            } else {
                players[i].pt3++;
            }
        }
    }
}

function addToPlayer2(x, number) {
    for (var i = 0; i < players2.length; i++) {
        if (players2[i].number == number) {
            if (x == 1) {
                players2[i].pt1++;
            } else if (x == 2) {
                players2[i].pt2++;
            } else {
                players2[i].pt3++;
            }
        }
    }
}

function loadPlayers() {
    var teamCode = document.getElementById("teamCode").value;
    if (teamCode == "") {
        alert("Please enter a team code.");
        exit();
    }
    var socket = io.connect('http://localhost:3000');
    socket.emit('getPlayers', teamCode, function(data, name) {
        document.getElementById('team1').innerHTML = name;
        team1 = name;
        var result = data;
        players = result;
        teamCode1 = teamCode;
        addToScreen(players);
        socket.close();
    });
    document.getElementById("load1").style.display = 'none';
}

function addToScreen(players) {
    var number = 0;
    for (var i = 0; i < players.length; i++) {
        players[i].pt1 = 0;
        players[i].pt2 = 0;
        players[i].pt3 = 0;
        document.getElementById("players").innerHTML += "<div class='col-md-3'><h2>" + players[i].name.first + " " + players[i].name.last + "</h2></div><div class='col-md-3'><h2>" + players[i].number + "</h2></div><div class='col-md-2'><input type='checkbox'><input type='checkbox'><input type='checkbox'><input type='checkbox'><input type='checkbox'></div><div class='col-md-2 btn-group'><button class='btn btn-success btn-lg' id='counter1' onclick='add(1," + players[i].number + ")'>+1</button><button class='btn btn-success btn-lg' id='counter1' onclick='add(2," + players[i].number + ")'>+2</button><button class='btn btn-success btn-lg' id='counter1' onclick='add(3," + players[i].number + ")'>+3</button></div><div class='col-md-2'><h2 id='" + players[i].number + "'>0</h2></div>";
    }
    //document.getElementById("save").innerHTML += "<button class='btn btn-success btn-lg' id='logo'>Save Stats</button>";
}

function loadPlayers2() {
    var teamCode = document.getElementById("teamCode2").value;
    if (teamCode == "") {
        alert("Please enter a team code.");
        exit();
    }
    var socket = io.connect('http://localhost:3000');
    socket.emit('getPlayers', teamCode, function(data, name) {
        document.getElementById('team2').innerHTML = name;
        team2 = name;
        var result = data;
        players2 = result;
        teamCode2 = teamCode;
        addToScreen2(players2);
        socket.close();
    });

    document.getElementById('load2').style.display = 'none';
}

function save() {
    var socket = io.connect('http://localhost:3000');
    socket.emit('save', players, players2, score, score2, teamCode1, teamCode2, team1, team2,function(data) {
        if (data == "success") {
            location.href = "/mainpage";
            alert("Game successfully recorded and saved.")
        } else {
            alert("Error: Game could not be recorded.")
        }
    });
}

function addToScreen2(players) {
    var number = 0;
    for (var i = 0; i < players.length; i++) {
        players2[i].pt1 = 0;
        players2[i].pt2 = 0;
        players2[i].pt3 = 0;
        document.getElementById("players2").innerHTML += "<div class='col-md-3'><h2>" + players[i].name.first + " " + players[i].name.last + "</h2></div><div class='col-md-3'><h2>" + players[i].number + "</h2></div><div class='col-md-2'><input type='checkbox'><input type='checkbox'><input type='checkbox'><input type='checkbox'><input type='checkbox'></div><div class='col-md-2 btn-group'><button class='btn btn-success btn-lg' id='counter1' onclick='add2(1," + players[i].number + ")'>+1</button><button class='btn btn-success btn-lg' id='counter1' onclick='add2(2," + players[i].number + ")'>+2</button><button class='btn btn-success btn-lg' id='counter1' onclick='add2(3," + players[i].number + ")'>+3</button></div><div class='col-md-2'><h2 id='" + players[i].number + "'>0</h2></div>";
    }
    //document.getElementById("save").innerHTML += "<button class='btn btn-success btn-lg' id='logo'>Save Stats</button>";
}

function myFunction() {
    var x = document.getElementById('one');
    var y = document.getElementById('two');
    if (x.style.display === 'none') {
        x.style.display = 'block';
        y.style.display = 'none';
    } else {
        x.style.display = 'none';
        y.style.display = 'block';
    }
}
