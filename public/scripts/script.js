function openTab(tabName) {
    var i;
    var x = document.getElementsByClassName("tab");
    var q = document.getElementsByClassName("tabactive");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    console.log(q[0]);
    for(k = 0; k < q.length; k++){
        q[k].classList.add("tabs");
        q[k].classList.remove('tabactive');
    }
    document.getElementById(tabName).style.display = "block";
    event.target.classList.add('tabactive');
    event.target.classList.remove('tabs');
    //.classList.add('tabactive')
}
