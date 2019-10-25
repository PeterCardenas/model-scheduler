/* VERSION NUMBER ONLY EDIT WHEN CHANGING VERSION */
var version = "3.1.2-beta"
/* ---------------------------------------------- */
document.getElementById("version-id").innerHTML = "Version " + version
var onMobile = false///Mobi/.test(navigator.userAgent)

g = function(elem){
    return document.getElementById(elem)
}

class Subject{
    constructor(subject, periods, semAmt, code, semList, location){
	//each class is one of the tabs at the bottom
	this.subject = subject;
	this.periods = periods;
	this.code = code;
	this.location = location
	/* Array of strings that identify what periods the class is avalible
	   High School Periods     STEAM Center periods
	   "h1" - "h8"             "s0" - "s8", "s-25", "s-36", "s-47" */


	this.semList = semList //Semesters which the class is avalible
	this.semAmt  = semAmt;
	// Should be 1 or 2, designating whether the class appears both semester or only has one semester.
	// Unlike semester, a value of 1 doesnt restrict the class to semester 1, but only allows one semester of that class total.
	this.elem = document.createElement("DIV");
	this.elem.className = "class-name";
	this.elem.title = "Click to put in schedule"
	this.elem.onclick = function(){
	    deselect();
	    displayPossibles(this);
	    for(var i = 0; i < subjects.length; i++){
		subjects[i].elem.setAttribute("active", "false")
	    }
	    this.setAttribute("active", "true")
	    event.stopPropagation()
	}
	this.elem.innerHTML = "<span style='font-weight: 700'>" + subject + "</span>   <br>" + this.location + " (" + this.semAmt + " Semester" + ((this.semAmt > 1) ? "s" : "" ) + ")";
	document.getElementById("classesBody").appendChild(this.elem);
    }


}

document.getElementById("search").addEventListener("keyup", function(event) {
    event.preventDefault();
});

function barHide(elem){
    document.getElementById("B" + elem.id.substring(1,2)).style.display = ""
}

function barShow(elem){
    document.getElementById("B" + elem.id.substring(1,2)).style.display = "block"
}

const defaultSub =  new Subject("Default",[], 1, "", [], "");
var selectedSubject = defaultSub;

function displayPossibles (element) {
    selectedSubject = subjects[parseInt(element.id.substring(15,18))];
    if(!hasRoom(selectedSubject, shownSemester)){
	deselect();
	var blocks = subjectElements(selectedSubject, shownSemester);
	if (blocks.length === 0){
	    blocks = subjectElementsNoSem(selectedSubject);
	}
	for(var block of blocks){
	    block.setAttribute("active", "selectable");
	}
    }else {
	for(var period in periods.all){
	    var x = document.getElementById(periods.all[period]);
	    var semesterName = shownSemester == "1" ? "semester_one" : "semester_two";
	    if (selectedSubject.periods[semesterName].split(",").includes(periods.all[period])){
		x.style.display = "block";
		x.setAttribute("active", "selectable");
		if(x.getAttribute("in-schedule") == "true"){

		    x.setAttribute("canReplace", "true");
		    if(x.getAttribute(shownSemAttribute) != ""){
			x.setAttribute("can-replace-disp", "true");
		    } else {
			x.setAttribute("can-replace-disp","false");
		    }
		} else {
		    x.children[0].innerHTML = selectedSubject.subject;
		}
		for(j in selectedSchedule){
		    //console.log(selectedSchedule[j][SCHEDULE_TIME_SLOT])
		    //console.log(periods.all[period])
		    if (periodsOverlap(periods.all[period], selectedSchedule[j][SCHEDULE_TIME_SLOT]) && selectedSchedule[j][SCHEDULE_SEMESTER] == shownSemester && periods.all[period] != selectedSchedule[j][SCHEDULE_TIME_SLOT]){
			//console.log("setConflicttrue" + " " + selectedSchedule[j][SCHEDULE_TIME_SLOT])
			x.setAttribute("willConflict", true)
			x.setAttribute("will-conflict-disp", true)
			x.setAttribute("conflictWith", selectedSchedule[j][SCHEDULE_TIME_SLOT])
			break
		    } else {
			x.setAttribute("willConflict", false)
			x.setAttribute("will-conflict-disp", false)
			x.setAttribute("conflictWith", "")
		    }
		}

		
	    } else {
		x.setAttribute("active", "off");
		x.setAttribute("willConflict", false)
		x.setAttribute("will-conflict-disp", false)
		x.setAttribute("conflictWith", "")
		if(x.getAttribute("in-schedule") == "true"){
		    if(x.getAttribute("canReplace") == "true"){
			x.setAttribute("canReplace", "false");
			x.setAttribute("can-replace-disp","false");
		    }
		} else {
		    if(x.getAttribute(shownSemAttribute) === ""){
			x.children[0].innerHTML = "";
		    }

		}
	    }
	    if(x.getAttribute("active") == "selectable"){
		x.children[0].innerHTML = "Click to add to " + getPeriodName(x.id);
		if(x.getAttribute("can-replace-disp") == "true"){
		    x.children[0].innerHTML = "Replace " +  x.getAttribute(shownSemAttribute);
		} else if(x.getAttribute("willConflict") == "true"){
		    x.children[0].innerHTML = "<span style='color: white'>Would conflict with " + getPeriodName(x.getAttribute("conflictWith")) + "</span>"
		    x.setAttribute("active","off")
		}
	    } else {
		x.children[0].innerHTML = x.getAttribute(shownSemAttribute);
	    }
	}
    }
}

function deselect(){
    //console.log("ran deselect")
    for(var i = 0; i < subjects.length; i++){
	subjects[i].elem.setAttribute("active", "false");
	
	subjects[i].elem.setAttribute("conflictWith", "")
    }
    //console.log(selectedSubject);
    for(var period of periods.all){
	var x  = document.getElementById(period);
	if (x.getAttribute("active") == "selectable"){
	    x.setAttribute("active", "off");
	    
	    if(x.getAttribute("canReplace") == "true"){
		x.setAttribute("canReplace", "false");
		x.setAttribute("can-replace-disp", "false")
	    }
	}	
	//console.log("setWillConflictFalse " + period)
	x.setAttribute("willConflict", false)
	x.setAttribute("will-conflict-disp",false)
	if(x.getAttribute(shownSemAttribute) === ""){
	    x.children[0].innerHTML = "";
	    if (periods.doubleBlock.includes(period)) {
		x.style.display = "none";
	    }
	} else {
	    x.children[0].innerHTML = x.getAttribute(shownSemAttribute)
	}

    }
}

function getSubjectIndex(str){
    for (var subject in subjects){
	if(subjects[subject].subject == str){
	    return subject;
	}
    }
    return null;
}

var shownSemester = "0"; // can be "1", "2", or "0" - "0" opens change class window
var shownSemAttribute = "sem-1-sub"; // can be "sem-1-sub" or "sem-2-sub"
function toggleSemester(to){
    if(to == null || to == undefined){
	to = shownSemester == "1" ? "2" : "1";
    }
    
    document.getElementById("sem-0").style.color = "";
    document.getElementById("sem-1").style.color = "";
    document.getElementById("sem-2").style.color = "";
    document.getElementById("sem-0").style.backgroundColor = "";
    document.getElementById("sem-1").style.backgroundColor = "";
    document.getElementById("sem-2").style.backgroundColor = "";
    document.getElementById("sem-" + to).style.color = "#101E5B";
    document.getElementById("sem-" + to).style.backgroundColor = "#fff";	

    if(to == "0"){
	document.getElementById("next").innerHTML = "Next"
	document.getElementById("next").onclick = function(){toggleSemester(1)}
	document.getElementById("previous").style.display = "none"
    }if(to == "1"){
	document.getElementById("next").innerHTML = "Next"
	document.getElementById("next").onclick = function(){toggleSemester(2)}
	document.getElementById("previous").onclick = function(){toggleSemester(0)}
	document.getElementById("previous").style.display = ""
    } else if(to == "2"){
	if(shownSemester == "1" && canAutoPopulate()){
	    if(confirm("Would you like to automatically place your two semester classes into your schedule for the 2nd semester?")){
		autoPopulate()
	    }
	}
	document.getElementById("next").innerHTML = "Print"
	document.getElementById("previous").onclick = function(){toggleSemester(1)}
	document.getElementById("previous").style.display = ""
	document.getElementById("next").onclick = function(){printButton()}
    }
    
    localStorage.setItem("shownPage", to);
    shownSemester = to.toString();
    shownSemAttribute = "sem-" + shownSemester + "-sub";
    for(var subject in subjects){
	//console.log(selectedSchedule.filter(item => item[SCHEDULE_SUBJECT].subject == subjects[subject].subject).length < parseInt(subjects[subject].semAmt, 10))
	/*if(selectedSchedule.filter(item => item[SCHEDULE_SUBJECT].subject == subjects[subject].subject).length < parseInt(subjects[subject].semAmt, 10)){
	    subjects[subject].elem.style.display = "inline-block";
	    
	} else {
	    subjects[subject].elem.style.display = "none";
	}
	*/
	subjects[subject].elem.style.borderRight = "";

	updateSchedule();

    }
    var shownSubjects = subjects.filter(function($0){return $0.elem.style.display == "inline-block"});
    if(shownSubjects[shownSubjects.length - 1] !== undefined){
	shownSubjects[shownSubjects.length - 1].elem.style.borderRight = "none";
    }
    if(to === 0){
	document.getElementById("schedule").style.display = "none";
	classes.style.display = "none";
	document.getElementById("classSelection").style.display = ""
    } else {
	document.getElementById("schedule").style.display = "";
	classes.style.display = "block";
	document.getElementById("classSelection").style.display = "none";
    }

    deselect();
    updateSchedule();
}

function autoPopulate(){
    //Auto populates the 2nd semester based on 1st semester classes.
    //console.log("Starting auto populate")
    var list = selectedSchedule.filter(x => x[SCHEDULE_SEMESTER] == "1" && x[SCHEDULE_SUBJECT].periods.semester_two.includes(x[SCHEDULE_TIME_SLOT]))
    for(item of list){
	var potentialConflicts = selectedSchedule.filter(x => ((x[SCHEDULE_TIME_SLOT] == item[SCHEDULE_TIME_SLOT]
								|| periodsOverlap(x[SCHEDULE_TIME_SLOT], item[SCHEDULE_TIME_SLOT]))
							       && x[SCHEDULE_SEMESTER] == "2"
							       && (x[SCHEDULE_SUBJECT].code != item[SCHEDULE_SUBJECT].code)))
	if(parseInt(item[SCHEDULE_SUBJECT].semAmt,10) > 1
	   && selectedSchedule.filter(x => x[SCHEDULE_SEMESTER] == "2" && x[SCHEDULE_SUBJECT].code == item[SCHEDULE_SUBJECT].code).length == 0){
	    //console.log(potentialConflicts)
	    if(potentialConflicts.length > 0){
		if(confirm("Would you like to replace " + potentialConflicts[0][SCHEDULE_SUBJECT].subject + " in " + getPeriodName(potentialConflicts[0][SCHEDULE_TIME_SLOT]) + " with " + item[SCHEDULE_SUBJECT].subject + " (" + getPeriodName(item[SCHEDULE_TIME_SLOT]) + ")?")){
		    var pushSub = item
		    //console.log(item[SCHEDULE_SUBJECT])
		    removeFromSchedule(potentialConflicts[0][SCHEDULE_TIME_SLOT], "2")
		    //console.log(pushSub[SCHEDULE_SUBJECT])
		    selectedSchedule.push([pushSub[SCHEDULE_SUBJECT], pushSub[SCHEDULE_TIME_SLOT], "2"])
		    autoPopulate()
		    return;
		}

	    } else {
		//console.log("added")
		selectedSchedule.push([item[SCHEDULE_SUBJECT], item[SCHEDULE_TIME_SLOT], "2"])
	    }
	    
	}
    }
}

function canAutoPopulate(){
    //checks if running autopopulate will have any impact
    var list = selectedSchedule.filter(x => x[SCHEDULE_SEMESTER] == "1" && x[SCHEDULE_SUBJECT].periods.semester_two.includes(x[SCHEDULE_TIME_SLOT]))
    //console.log(list)
    for(item of list){
	var potentialConflicts = selectedSchedule.filter(x => ((x[SCHEDULE_TIME_SLOT] == item[SCHEDULE_TIME_SLOT]
								|| periodsOverlap(x[SCHEDULE_TIME_SLOT], item[SCHEDULE_TIME_SLOT]))
							       && x[SCHEDULE_SEMESTER] == "2"
							       && x[SCHEDULE_SUBJECT].code != item[SCHEDULE_SUBJECT].code
							       && selectedSchedule.filter(x => x[SCHEDULE_SEMESTER] == "2"
											  && x[SCHEDULE_SUBJECT].code == item[SCHEDULE_SUBJECT].code).length == 0))
	/*
	console.log(potentialConflicts)
	console.log("(")
	console.log(parseInt(item[SCHEDULE_SUBJECT].semAmt,10) > 1)
	console.log(selectedSchedule.filter(x => x[SCHEDULE_SEMESTER] == "2"
					    && x[SCHEDULE_SUBJECT].code == item[SCHEDULE_SUBJECT].code))
	console.log(")")
	*/
	//console.log(selectedSchedule.filter(x => x[SCHEDULE_SEMESTER] == "2" && x[SCHEDULE_SUBJECT].code == item[SCHEDULE_SUBJECT].code))
	if(potentialConflicts.length > 0
	   || (parseInt(item[SCHEDULE_SUBJECT].semAmt,10) > 1
	       && selectedSchedule.filter(x => x[SCHEDULE_SEMESTER] == "2"
					  && x[SCHEDULE_SUBJECT].code == item[SCHEDULE_SUBJECT].code).length == 0)){
	    return true
	}
    }
    return false
}

function getTime(period){
    //takes in the period and returns the start and end times
    switch (period){
    case "h1":
	return ["08:50", "09:45"];

    case "h2":
    case "h5":
    case "h-25":
	return ["09:50", "11:25"];

    case "h3":
    case "h6":
    case "h-36":
	return ["11:30", "13:30"];

    case "h4":
    case "h7":
    case "h-47":
	return ["13:35", "15:10"];

    case "h8":
	return ["15:15", "16:10"];

    case "h-23":
    case "h-56":
	return ["09:50", "13:30"];

    case "h-34":
    case "h-67":
	return ["11:30", "15:10"];
	
    case "s0":
	return ["07:30","08:25"];
    case "s1":
	return ["08:35", "09:25"];

    case "s-25":
	return ["10:10","11:05"];

    case "s2":
    case "s5":
	return ["09:35", "11:05"];

    case "s-36":
	return ["11:45", "12:40"];

    case "s3":
    case "s6":
	return ["11:45", "13:15"];

    case "s-47":
	return ["13:55", "14:50"];

    case "s4":
    case "s7":
	return ["13:55", "15:25"];

    case "s8":
	return ["15:30", "16:25"];

    case "s-23":
    case "s-56":
	return ["09:35", "13:15"];
    case "s-34":
    case "s-67":
	return ["11:45", "15:25"];
	
    default:
	return [0,100];

    }
}
function getPeriodName(period){
    //takes in the period string, returns name to display
    switch (period){
    case "h1":
	return "Period 1";

    case "h2":
	return "Period 2";
    case "h5":
	return "Period 5";
    case "h-25":
	return "Period 2/5";
	
    case "h3":
	return "Period 3";
    case "h6":
	return "Period 6";
    case "h-36":
	return "Period 3/6";

    case "h4":
	return "Period 4";
    case "h7":
	return "Period 7";
    case "h-47":
	return "Period 4/7";

    case "h-23":
	return "Period 2/3";
    case "h-34":
	return "Period 3/4";
    case "h-56":
	return "Period 5/6";
    case "h-67":
	return "Period 6/7";
	
    case "h8":
	return "Period 8";
    case "s0":
 	return "Period 0";
    case "s1":
	return "Period 1";

    case "s2":
	return "Period 2";

    case "s3":
	return "Period 3";
    case "s4":
	return "Period 4";

    case "s5":
	return "Period 5";

    case "s6":
	return "Period 6";
    case "s7":
	return "Period 7";
    case "s8":
	return "Period 8";

    case "s-25":
	return "Period 2/5";
    case "s-36":
	return "Period 3/6";

    case "s-47":
	return "Period 4/7";

    case "s-23":
	return "Period 2/3";
    case "s-34":
	return "Period 3/4";
    case "s-56":
	return "Period 5/6";
    case "s-67":
	return "Period 6/7";

    default:
	return "N/A";

    }
}

function getTimePos(period){
    //takes in the period and returns the the start and end locations of the time blocks on the timeline as a percent
    return getTime(period).map(timetoPercent);
}


const targetFactor = 1
function setPos(elem, start, end){
    start = timetoPercent(start);
    if (end != undefined) {
	end = timetoPercent(end);
	elem.style.height = ((end) * 100 * targetFactor) - (start) * 100 * targetFactor - 2 + "vh";
	elem.childNodes[1].style.height = ((end) * 100 * targetFactor) - (start) * 100 * targetFactor - 4 + "vh"
	elem.childNodes[1].style.lineHeight = (((end) * 100 * targetFactor) - (start) * 100 * targetFactor - 4) + "vh"
	elem.style.top = 5 + (-4.5 + ((start) * 100 * targetFactor)) + "vh";
    } else {
	elem.style.top = 7 + (-4.5 + ((start) * 100 * targetFactor)) + "vh";              //5 is line offset, .84 is target factor (max vh is 84)
    }
}

function timeToMinutes(time){
    if(time.length == 4){
	time = "0" + time
    }
    var hour = parseInt(time.slice(0, 2), 10);
    var minute = parseInt(time.slice(3, 5), 10);
    return (hour * 60 + minute);
}

function timetoPercent(time){
    return ((timeToMinutes(time) - 390) / 630);
}

function dayFromPeriod(period){
    switch (period) {
    case "h1":
    case "h-25":
    case "h-36":
    case "h-47":
    case "h8":
    case "s0":	
    case "s1":
    case "s-25":
    case "s-36":
    case "s-47":
    case "s8":
	return "D";

    case "h2":
    case "h3":
    case "h4":
    case "h-23":
    case "h-34":
    case "s2":
    case "s3":
    case "s4":
    case "s-23":
    case "s-34":
	return "A";

    case "h5":
    case "h6":
    case "h7":
    case "h-56":
    case "h-67":
    case "s5":
    case "s6":
    case "s7":
    case "s-56":
    case "s-67":
	return "B";

    default:
	return "INVALID";

    }
}

function inSTEAMcenter(period){
    if(period.slice(0,1) == "o"){
	return true;
    } else {
	return false;
    }
}

function has(array,want){
    for (var i in array){
	if(array[i].equals(want)){
	    return true;
	}
    }
    return false;
}

function FixNumLength(num, length) {
    var ret = "" + num;
    while (ret.length < length) {
	ret = "0" + ret;
    }
    return ret;
}

function adjustSubjectIds(){   //** Use this after adding/removing subjects **//
    for (var i in subjects){
	subjects[i].elem.id = "subject-number-" + FixNumLength(i,3);

    }
}

function addToSchedule(block){
    var showPossibles  = false;
    if(block.getAttribute(shownSemAttribute) != ""){                         //if(block.getAttribute("in-schedule")=="true"){
	block.children[0].innerHTML = "";

	//***Legacy: only use when tying two semester classes together***
	/*
	if(block.getAttribute(shownSemAttribute) != "" && block.getAttribute("sem-"+(shownSemester == "2" ? "1" : "2")+"-sub") == block.getAttribute(shownSemAttribute)){
	    //If class being replaced has another semester, remove that one too
	    block.setAttribute("sem-"+(shownSemester == "2" ? "1" : "2")+"-sub", "");
	    removeFromSchedule(block.id, (shownSemester == "2" ? "1" : "2"));
	    
	}

	*/
	block.setAttribute(shownSemAttribute, "");
	
	var removedSub = removeFromSchedule(block.id, shownSemester);
	if(block.getAttribute("canReplace") == "true"){
	    selectedSchedule.push([selectedSubject, block.id, shownSemester]);
	    block.setAttribute(shownSemAttribute, selectedSubject.subject);
	}
	
	updateSchedule();
	showPossibles = true;
	selectedSubject = removedSub;
	removedSub.elem.onclick();
	
	
    }
    else if (block.getAttribute("active") == "selectable"){
	selectedSchedule.push([selectedSubject, block.id, shownSemester]);
	var semesterName = shownSemester == "1" ? "semester_one" : "semester_two";
	for (var period of selectedSubject.periods[semesterName].split(",")) {
	    if (period != block.id && periods.doubleBlock.includes(period)) {
		var periodBlock = document.getElementById(period);
		periodBlock.style.display = "none";
	    }
	}
	block.children[0].innerHTML = selectedSubject.subject;
	block.setAttribute(shownSemAttribute, selectedSubject.subject);
	updateSchedule()
    }
    
    if (showPossibles){
	//displayPossibles(selectedSubject.elem);

    } else {
	deselect();
	selectedSubject = defaultSub;
    }
    event.stopPropagation()
};

  /* Period tag values in regards to schedule status:
  in-schedule: false if not in schedule, true if in schedule
  schedule-conflict: true if there is another class that overlaps with it otherwise false
  canReplace: true if the selected class has a period in a block that is already assigned a period on the schedule */

function updateSchedule(){
    // reset some values
    for(var period of periods.all){
	block = document.getElementById(period);
	block.setAttribute("in-schedule", "false");
	block.setAttribute("schedule-conflict", "false");
	block.setAttribute("in-sched-disp", "false");
	block.setAttribute("sem-1-sub", "");
	block.setAttribute("sem-2-sub", "");
	if(block.getAttribute("can-replace-disp") == null){
	    block.setAttribute("can-replace-disp", "false");
	}
	block.setAttribute("sched-conflict-disp", "false")
	block.setAttribute("sched-conflict-with","")
	block.children[0].innerHTML = "";
	if (periods.doubleBlock.includes(period)) {
	    block.style.display = "none";
	}
    }
    for(var schedSubject of selectedSchedule){
	var block = document.getElementById(schedSubject[SCHEDULE_TIME_SLOT]);
	if(schedSubject[SCHEDULE_SEMESTER] == "1"){
	    block.setAttribute("sem-1-sub", schedSubject[SCHEDULE_SUBJECT].subject)
	} else if(schedSubject[SCHEDULE_SEMESTER] == "2"){
	    block.setAttribute("sem-2-sub", schedSubject[SCHEDULE_SUBJECT].subject)
	}
	
	if(shownSemester == "1" || shownSemester == "2"){
	    block.children[0].innerHTML = block.getAttribute(shownSemAttribute);
	}
	block.setAttribute("in-schedule", "true");
	if(block.getAttribute(shownSemAttribute) != ""){
	    block.setAttribute("in-sched-disp","true");
	}
	if (periods.doubleBlock.includes(block.id) && block.getAttribute(shownSemAttribute) != "") {
	    block.style.display = "block";
	}
	if(!subjects.map(x => x.subject).includes(schedSubject[SCHEDULE_SUBJECT].subject)){
	    for(var i in selectedSchedule){
		if(selectedSchedule[i] == schedSubject){
		    selectedSchedule.splice(i,1);
		    updateSchedule();
		    return;
		}
	    }
	}

    }
    
    scheduleErrors = [];

    //Compare all items in selected schedule to one another to check if they conflict
    for(var i = 0; i < selectedSchedule.length;i++){
	var compareAgainst = selectedSchedule[i];
	for (var j = i+1;j<selectedSchedule.length;j++){
	    var schedItem = selectedSchedule[j]

	    if (compareAgainst[SCHEDULE_SEMESTER] == schedItem[SCHEDULE_SEMESTER]){

		if(periodsOverlap(compareAgainst[SCHEDULE_TIME_SLOT], schedItem[SCHEDULE_TIME_SLOT])){

		    document.getElementById(schedItem[SCHEDULE_TIME_SLOT]).setAttribute("schedule-conflict", "true");
		    document.getElementById(compareAgainst[SCHEDULE_TIME_SLOT]).setAttribute("schedule-conflict", "true");
		    
		    scheduleErrors.push([compareAgainst, schedItem]);
		    if(compareAgainst[SCHEDULE_SEMESTER] == shownSemester){
			document.getElementById(schedItem[SCHEDULE_TIME_SLOT]).setAttribute("sched-conflict-disp", "true");
			document.getElementById(compareAgainst[SCHEDULE_TIME_SLOT]).setAttribute("sched-conflict-disp", "true");
			document.getElementById(compareAgainst[SCHEDULE_TIME_SLOT]).setAttribute("sched-conflict-with", schedItem[SCHEDULE_TIME_SLOT]);
		    }
		}
	    }
	}
    }
    
    //Hide subject tabs that are put in schedule
    for(subElem of subjects){
	//  This code checks if the class is in the schedule, but the hasRoom function also takes into account if the class is only supposed to show up in the first semester and stuff
	/*var inSched = false;
	for (schedE of selectedSchedule){
	    if(schedE[SCHEDULE_SUBJECT].subject == subElem.subject && schedE[SCHEDULE_SEMESTER] == shownSemester || selectedSchedule.filter(item => item[SCHEDULE_SUBJECT].subject == subElem.subject).length >= parseInt(subElem.semAmt, 10)){
		inSched = true;
	    }
	}
	*/
	if(!hasRoom(subElem,shownSemester)){
	    subElem.elem.style.display = "none";
	} else {
	    subElem.elem.style.display = "inline-block";
	}
    }
    if(!subjects.map(x => x.elem.style.display).includes("inline-block") && (shownSemester == "1" || shownSemester == "2")){
	document.getElementById("classesBodyText").innerHTML = "All of your selected classes for Semester " + shownSemester + " have been added to your schedule. Click on added classes to put them back on the list, or select the Semester " + (shownSemester == "1" ? "2":"1") + " tab to modify your schedule for that semester."
    } else {
	if(subjects.length != 0){
	    document.getElementById("classesBodyText").innerHTML = ""
	}
    }
    if(finishedLocalSemUpdate){
	var semesterOne = Array(periods.all.length).fill(false)
	var semesterTwo = Array(periods.all.length).fill(false)
	
	for (subject of selectedSchedule) {
    	    if (subject[SCHEDULE_SEMESTER] == "1") {
    		semesterOne[periods.all.indexOf(subject[1])] = subject[SCHEDULE_SUBJECT].subject;
    	    }
    	    else {
    		semesterTwo[periods.all.indexOf(subject[1])] = subject[SCHEDULE_SUBJECT].subject;
    	    }
	}
	
	localStorage.setItem("semester-1", semesterOne);
	localStorage.setItem("semester-2", semesterTwo);
    }
}

function periodsOverlap(period1, period2){
    var timeString1 = getTime(period1);
    var timeString2 = getTime(period2);
    var day1 = dayFromPeriod(period1);
    var day2 = dayFromPeriod(period2);
    var dayMatch = ((day1 == "D" || day2 == "D") || (day1 == "A" && day2 == "A") || (day1 == "B" && day2 == "B"));
    if(dayMatch){
	if((timeString1[0] <= timeString2[1]) && (timeString1[1] >= timeString2[0])){
	    return true;
	}
    }
    return false;
}

function subjectInSchedule(subject){
    for(var e of selectedSchedule){
	if(e[SCHEDULE_SUBJECT].code == subject.code){
	    return true;
	}
    }
    return false;
}

function subjectInSchedule(subject, semester){
    for(var e of selectedSchedule){
	if(e[SCHEDULE_SUBJECT].code == subject.code && e[SCHEDULE_SEMESTER].includes(semester)){
	    return true;
	}
    }
    return false;
}

function subjectStrInSchedule(subject){
    for(var e of selectedSchedule){
	if(e[SCHEDULE_SUBJECT].subject == subject){
	    return true;
	}
    }
    return false;
}

function subjectElementsNoSem(subject){
    var ret = [];
    for(var period of periods.all){
	var x = document.getElementById(period);
	if(getSubjectFromBlock(x, "1+2").includes(subject.subject)){
	    ret.push(x);
	}
    }
    return ret;
}

function subjectElements(subject, semester){ //doesnt work with "1+2"
    var ret = [];
    for(var period of periods.all){

	var x = document.getElementById(period);
	if(getSubjectFromBlock(x, semester) == subject.subject){
	    ret.push(x);
	}
    }
    //console.log(ret)
    return ret;
}

function removeFromSchedule(period){
    for (var item in selectedSchedule){
	if(selectedSchedule[item][SCHEDULE_TIME_SLOT] == period && selectedSchedule[item][SCHEDULE_SEMESTER] == shownSemester){
	    var removedSubject = selectedSchedule[item][SCHEDULE_SUBJECT]
	    selectedSchedule.splice(item,1);

	    updateSchedule();
	    return removedSubject;
	}
    }

}

function removeFromSchedule(period, selectSemester){
    var removedSubject;
    do{
	var loop = false;
	for (item in selectedSchedule){
	    if(selectedSchedule[item][SCHEDULE_TIME_SLOT] == period && (selectedSchedule[item][SCHEDULE_SEMESTER] == selectSemester)){
		removedSubject = selectedSchedule[item][SCHEDULE_SUBJECT]
		selectedSchedule.splice(item,1);
		loop = true;
		break;


	    }
	}
    }while(loop)
    updateSchedule();
    return removedSubject;
}

const semesterSeparator = "<br>------------------<br>";
function modInnerHTML(block, str, semester){
    //Places the subject in the correct part of the string according to semester

    if (block.innerHTML == ""){
	block.innerHTML = semesterSeparator;
    }
    var sides = block.innerHTML.split(semesterSeparator);
    while(sides.length < 2){
	sides.push("");
    }
    semester = String(semester);
    switch(semester){
    case "1":
	sides[0] = str;
	break;
    case "2":
	sides[1] = str
	break;
    case "1+2": // If needed can modify this so 2 semester courses arent automatically placed on the same period
	sides[0] = str;
	sides[1] = str;
	break;
    default:
	break;
    }
    block.innerHTML = sides[0] + semesterSeparator + sides[1];
}

function getSubjectFromBlock(block, semester){
    // Get the subject from the valid semester from a specified block, or an array if semester is "1+2"
    semester = String(semester);
    switch(semester){
    case "1":
	return block.getAttribute("sem-1-sub");
    case "2":
	return block.getAttribute("sem-2-sub");
    case "1+2":
	return [block.getAttribute("sem-1-sub"), block.getAttribute("sem-2-sub")]
    default:
	return null;
    }
}

function hasRoom(subject, semester){
    var subCount = 0;
    var semIsValid = true;
    for (var item of selectedSchedule){
	if(item[SCHEDULE_SUBJECT].code == subject.code){
	    //console.log(item[SCHEDULE_SUBJECT] + " matches in period " + item[SCHEDULE_TIME_SLOT])
	    subCount += 1;
	    if(item[SCHEDULE_SEMESTER] == semester){
		semIsValid = false;
	    }
	}
    }
    if(subject.semList.includes(semester) && subCount < subject.semAmt && semIsValid){
	return true;
    } else {
	return false;
    }
}

function resetSchedule() {
    if (shownSemester == 1) {
	localStorage.setItem("semester-1", Array(periods.all.length).fill(false))
	selectedSchedule = selectedSchedule.filter(course => course[2] != "1");
    }
    if (shownSemester == 2) {
	localStorage.setItem("semester-2", Array(periods.all.length).fill(false)) 
	selectedSchedule = selectedSchedule.filter(course => course[2] != "2");
    }

    updateSchedule()
}


function resetClasses() {
    for (var subject of allSubjects) {
	subject.added = false;
    }
    
    search();
    getClasses();
}

var selectedSchedule = []; // Multidimensional Array composed of [[subject, periodChosen, semesterChosen], [subject,periodChosen, semesterChosen]...]
var scheduleErrors = []; // Each element of this array is two elements of selectedSchedule, contains conflicting classes
var subjects = [];

const periods = {
    all: [
	"h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8",
	"h-23", "h-34", "h-56", "h-67",
	"h-25", "h-36", "h-47",
	"s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8",
	"s-23", "s-34", "s-56", "s-67",
	"s-25", "s-36", "s-47"
    ],
    high: [
	"h0", "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10",
	"h-01", "h-12", "h-23", "h-34", "h-45", "h-56", "h-67", "h-78", "h-89", "h-910",
	"h-25", "h-36", "h-47"
    ],
    steam: [
	"s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10",
	"s-01", "s-12", "s-23", "s-34", "s-45", "s-56", "s-67", "s-78", "s-89", "s-910",
	"s-25", "s-36", "s-47"
    ],
    doubleBlock: [
	"h-01", "h-12", "h-23", "h-34", "h-45", "h-56", "h-67", "h-78", "h-89", "h-910",
	"s-01", "s-12", "s-23", "s-34", "s-45", "s-56", "s-67", "s-78", "s-89", "s-910",
	"h-25", "h-36", "h-47"
    ]
};

const SCHEDULE_SUBJECT = 0;
const SCHEDULE_TIME_SLOT = 1;
const SCHEDULE_SEMESTER = 2;

for(var period in periods.all){
    var block = document.getElementById(periods.all[period]);
    setPos(block, getTime(periods.all[period])[0], getTime(periods.all[period])[1]);
    block.onclick = function(){
	addToSchedule(this);
    };
    block.children[0].innerHTML = "";
    block.setAttribute("sem-1-sub", "");
    block.setAttribute("sem-2-sub", "");
}

/// **********************************************************
/// *****************  BINARY CONVERT PHP  *******************
/// **********************************************************

function baseTenToBinary(num) {
    var binaryString = ""

    while (num > 0) {
	binaryString = (num % 2).toString() + binaryString
	num = parseInt(num / 2)
    }

    return binaryString
}


function baseTenToPeriodArrayAHS(baseTen){
    var binaryStr = baseTenToBinary(baseTen)
    var formattedStr = binaryStr.split("").reverse().join("")
    var returnArray = []    
    for (var i in formattedStr) {
	if (formattedStr[i] == "1"){
	    returnArray.push(periods.high[i]);
	}
    }
    return returnArray;
}

function baseTenToPeriodArraySTEAM(baseTen) {
    var binaryStr = baseTenToBinary(baseTen)
    var formattedStr = binaryStr.split("").reverse().join("")
    var returnArray = []    
    for (var i in formattedStr) {
	if (formattedStr[i] == "1"){
	    returnArray.push(periods.steam[i]);
	}
    }
    return returnArray;
}

const DB_CODE = 0;
const DB_NAME = 1;
const DB_SEMESTER = 2;
const DB_CREDLOW = 3;
const DB_CREDHIGH = 4;
const DB_GRADELOW = 5;
const DB_GRADEHIGH = 6;
const DB_ISAPP = 7;
const DB_ISIB = 8;
const DB_ISDC = 9;
const DB_ISAP = 10;
const DB_ISPREAP = 11;
const DB_ISONLEVEL = 12;
const DB_LOCATIONNAME = 13;
const DB_APPCODE = 14;
const DB_PERIODBITMAP = 15;

// Database stuff
var allSubjectsNotFormatted = [];
// If i did things right SHOULD look like [[Diving, Allen High School], [Diving, Allen High School], [Health Ed, Allen High School], [Web Technology, STEAM Center],...]; 2 Semester Classes have 2 entries
var allSubjects = [];
// Format: [[subject, periods, semestercode, semAmt]]
// Make the subject when pushing to subjects using these elements in order

var dataRequest = new XMLHttpRequest();
dataRequest.onload = function() {
    //Put the database raw data into an array
    allSubjectsNotFormatted = JSON.parse(this.responseText);
    //Format the Array into another array
    var lastComponent = null;  //Tracks the last component, adds to semAmt if theres a duplicate class (they should show up next to each other)
    var currentComponent = null;

    //currentComponent = [component[COURSE_NAME], component[COURSE_TIME_SLOTS] == "Allen High School" ? PERIODS_HIGH : PERIODS_STEAM, courseCodeToSubject(component[COURSE_SUBJECT]), parseInt(component[COURSE_SEMESTER_COUNT])];
    //testing double blocking
    /*allSubjects.push({
	name: "Horizontal Double Blocking",
	location: "Allen High School",
	codes: ["ABCDEA", "ABCDEB"],
	timeSlots: {
	    semester_one: ["h-25", "h-36", "h-47"],
	    semester_two: ["h-25", "h-36", "h-47"]
	},
	placement: "On Level",
	applicationCode: "",
	credRange: "1.0",
	gradeRange: "10",
	semesterList: "1,2",
	semesterCount: 2
    });
    allSubjects.push({
	name: "Vertical Double Blocking",
	location: "Allen High School",
	codes: ["BCDEFA", "BCDEFB"],
	timeSlots: {
	    semester_one: ["h-23", "h-34", "h-56", "h-67", "s-23", "s-34", "s-56", "s-67"],
	    semester_two: ["h-23", "h-34", "h-56", "h-67", "s-23", "s-34", "s-56", "s-67"]
	},
	placement: "On Level",
	applicationCode: "",
	credRange: "1.0",
	gradeRange: "10",
	semesterList: "1,2",
	semesterCount: 2
    });
    */
    for (var component of allSubjectsNotFormatted) {
	var semester = component[DB_SEMESTER];
	var timeSlots = {
	    semester_one: null,
	    semester_two: null
	};
	
	var semesterName = semester == "S1" ? "semester_one" : "semester_two";
	switch (component[DB_LOCATIONNAME]) {
	case "Allen High School":
	    timeSlots[semesterName] = baseTenToPeriodArrayAHS(component[DB_PERIODBITMAP]);
	    break;
	case "STEAM Center":
	    timeSlots[semesterName] = baseTenToPeriodArraySTEAM(component[DB_PERIODBITMAP]);
	    break;
	}
	var currAddedSemester = timeSlots[semesterName]
	
	var matched = false;
	for (var subject of allSubjects) {
	    if (subject.codes[0].substring(0, 5) == component[DB_CODE].substring(0, 5)) {
		subject.codes = [...new Set([...subject.codes, ...[component[DB_CODE]]])];
		var currSemester = subject.timeSlots[semesterName];
		if (!currSemester) {
		    subject.timeSlots[semesterName] = currAddedSemester;
		    subject.semesterList = "1,2";
		    if (subject.codes[0].substring(5) != "C") {
			subject.semesterCount += 1;
		    }
		}
		else {
		    currSemester = [...new Set([...currSemester, ...currAddedSemester])];
		}
		matched = true;
	    }
	}

	if (matched) {
	    continue;
	}
	
	var placement = "ERR";

	if (component[DB_ISIB] == "1") {
	    placement = "IB";
	}
	else if (component[DB_ISDC] == "1") {
	    placement = "DC";
	}
	else if (component[DB_ISAP] == "1") {
	    placement = "AP";
	}
	else if (component[DB_ISPREAP] == "1") {
	    placement = "Pre-AP/IB";
	}
	else if (component[DB_ISONLEVEL] == "1") {
	    placement = "On Level";
	}

	var credRange = "ERR";

	if (component[DB_CREDLOW] != component[DB_CREDHIGH]) {
	    credRange = component[DB_CREDLOW] + "-" + component[DB_CREDHIGH];
	}
	else {
	    credRange = component[DB_CREDLOW];
	}

	var gradeRange = "ERR";

	if (component[DB_GRADEHIGH] != component[DB_GRADELOW]) {
	    gradeRange = component[DB_GRADELOW] + "-" + component[DB_GRADEHIGH] + "";
	}
	else {
	    gradeRange = component[DB_GRADELOW];
	}

	var codes = [component[DB_CODE]];
	var semesterList = "";
	if (semester == "S1") {
	    semesterList = "1";
	}
	else {
	    semesterList = "2";
	}
	var semesterCount = 1;
	
	currentComponent = {
	    name: component[DB_NAME],
	    location: component[DB_LOCATIONNAME],
	    codes: codes,
	    timeSlots: timeSlots,
	    placement: placement,
	    applicationCode: component[DB_APPCODE],
	    credRange: credRange,
	    gradeRange: gradeRange,
	    semesterList: semesterList,
	    semesterCount: semesterCount
	};
	allSubjects.push(currentComponent);
    }
    
    for (i in allSubjects) {
	allSubjects[i].added = false
	
	allSubjects[i].element = document.createElement("li")
	allSubjects[i].element.className = "ui-state-default"
	allSubjects[i].element.id = Number(i) + 1
	allSubjects[i].element.onclick = function(){
	    allSubjects[Number(this.id) - 1].added = !allSubjects[Number(this.id) - 1].added;
	    g("addedclasses").style.display = "block"
	    search()
	}
	allSubjects[i].element.setAttribute("title", allSubjects[i].name)
	if(!onMobile){
	    allSubjects[i].element.innerHTML = "<b>" + allSubjects[i].name + "</b> (" + allSubjects[i].codes.join(", ") + ")<span class='choose-icon'>></span>"
	} else {
	    allSubjects[i].element.innerHTML = "<b>" + allSubjects[i].name + "</b> <br>" + allSubjects[i].codes.join(", ") + "<span class='choose-icon'>></span>"
	}
	allSubjects[i].element.setAttribute("period-sem-one", allSubjects[i].timeSlots.semester_one == null ? "" : allSubjects[i].timeSlots.semester_one);
	allSubjects[i].element.setAttribute("period-sem-two", allSubjects[i].timeSlots.semester_two == null ? "" : allSubjects[i].timeSlots.semester_two);
	allSubjects[i].element.setAttribute("sems", allSubjects[i].semesterCount)
	allSubjects[i].element.setAttribute("code", allSubjects[i].codes)
	allSubjects[i].element.setAttribute("semester-list", allSubjects[i].semesterList)
	allSubjects[i].element.setAttribute("location", allSubjects[i].location)
	allSubjects[i].added = false;
    }
    
    finishedLocalSemUpdate = false;
    if (localStorage.getItem("classList") == null) {
	localStorage.setItem("classList", "empty");
    }  else if (localStorage.getItem("classList") != "empty") {
	g("addedclasses").style.display = "block"
	var subjectNamesRaw = localStorage.getItem("classList");
	var subjectNames = subjectNamesRaw.split(",");
	
	for (subject of allSubjects) {
	    if (subjectNames.includes(subject.name)) {
		subject.added = true;
	    }
	}
	
	search();
	getClasses();
    }

    for(var e = 1; e < 3; e++){
	if (localStorage.getItem("semester-" + e) == null) {
	    localStorage.setItem("semester-" + e, Array(periods.all.length).fill(false));
	} else {
	    var rawData = localStorage.getItem("semester-" + e);
	    var timeSlots = rawData.split(",");
	    for (var i = 0; i < timeSlots.length; i++) {
		var timeSlot = periods.all[i];
		var subjectName = timeSlots[i];
		
		for (subject of subjects) {
		    if (subject.subject == subjectName) {
			selectedSchedule.push([subject, timeSlot, e.toString()]);
			var periodBlock = document.getElementById(timeSlot);
			periodBlock.setAttribute("sem-" + e.toString() + "-sub", subjectName);
			if (periods.doubleBlock.includes(timeSlot)) {
			    periodBlock.style.display = "block";
			}
		    }
		}
	    }
	}
    }
    
    finishedLocalSemUpdate = true;
    
    if (localStorage.getItem("shownPage") != null) {
	toggleSemester(parseInt(localStorage.getItem("shownPage")));
    } else {
	toggleSemester(0)
    }
   
    search()
};

dataRequest.open("get", "database.php", true);
dataRequest.send();

subjects.push(selectedSubject);

var finishedLocalSemUpdate = false;

for(var i = 7; i < 16; i++){
    var short = document.createElement("DIV")
    short.className = "shortline"
    setPos(short, i - 1 + ":30")
    short.style.transform = "translateY(" + (2.75) + "vh)"
    var long = document.createElement("DIV")
    long.className = "longline"
    setPos(long, i + ":00")
    long.innerHTML = "<div>" + (i % 12 + 1) + ":00</div>"
    long.style.transform = "translateY(" + (2.75) + "vh)"
    document.getElementById("back").appendChild(short)
    document.getElementById("back").appendChild(long)
}

function search(){
    document.getElementById("availclasses").innerHTML = ""
    document.getElementById("addedclasses").innerHTML = ""
    var searchValue = g("search").value.toLowerCase()
    
    allSubjects.forEach(function(subject){
	entry = subject.element
	if(entry.innerHTML != undefined && !subject.added){
	    if(entry.title.toLowerCase().includes(g("search").value.toLowerCase()) || entry.getAttribute("code").toLowerCase().includes(g("search").value.toLowerCase())){
		document.getElementById("availclasses").appendChild(entry)
	    }
	}
	if(subject.added){
	    document.getElementById("addedclasses").appendChild(entry)
	}
    })
    getClasses()
    document.getElementById('availclasses').scrollTo(0, 0);
}

function getClasses(){
    subjects = []
    document.getElementById("classesBody").innerHTML = "";
    if(document.getElementById("addedclasses").childNodes.length <= 0){
	document.getElementById("classesBodyText").innerHTML = "You have not selected any classes for placement in your schedule. To add classes to your schedule, go to the Class Selection tab above.";
	localStorage.setItem("classList", "empty");
	return;
    }

    document.getElementById("addedclasses").childNodes.forEach(function(elem){
	if(elem.innerHTML != undefined){
	    subjects.push(new Subject(elem.getAttribute("title"), {semester_one: elem.getAttribute("period-sem-one"), semester_two: elem.getAttribute("period-sem-two")}, elem.getAttribute("sems"), elem.getAttribute("code"), elem.getAttribute("semester-list").split(","), elem.getAttribute("location")));
	}
    })

    classList = [];

    for (subject of subjects) {
    	classList.push(subject.subject);
    }

    localStorage.setItem("classList", classList);

    adjustSubjectIds();
    updateSchedule();
}

function printButton(){
    var twoSemesterClasses = selectedSchedule.filter(subject => subject[SCHEDULE_SUBJECT].semList.length == "2");
    twoSemesterClasses = twoSemesterClasses.map(subject => [subject[SCHEDULE_SUBJECT].subject, subject[SCHEDULE_TIME_SLOT], subject[SCHEDULE_SEMESTER]]);
    if(scheduleErrors.length == 0
       && twoSemesterClasses.every(subject => twoSemesterClasses.filter(subject2 => subject2[SCHEDULE_SUBJECT] == subject[SCHEDULE_SUBJECT]).length == 2)){
	g("print-cover").style.display = "block"
	
	let orderedSelectedSchedule = selectedSchedule.sort(function(a, b){
	    //First Sort By Time
	    if(timeToMinutes(getTime(a[1])[0]) != timeToMinutes(getTime(b[1])[0])){
		return timeToMinutes(getTime(a[1])[0])-timeToMinutes(getTime(b[1])[0])
	    }
	    
	    //Sort Periods with Same Time Slots, A day b4 B day
	    if(a[1] != b[1]){
		var aDayVal = 0
		var bDayVal = 0
		switch(dayFromPeriod(a[1])){
		case "A":
		    aDayVal = 2
		    break
		case "B":
		    aDayVal = 1
		    break
		case "D":
		    aDayVal = 3
		    break
		default:
		    aDayVal = 0
		    break
		}
		
		switch(dayFromPeriod(b[1])){
		case "A":
		    bDayVal = 2
		    break
		case "B":
		    bDayVal = 1
		    break
		case "D":
		    bDayVal = 3
		    break
		default:
		    bDayVal = 0
		    break
		}
		if(aDayVal != bDayVal){
		    //console.log(a[1] + " " + aDayVal + " " + b[1] + " " + bDayVal)
		    return parseInt(bDayVal,10) - parseInt(aDayVal,10)
		}
	    }
	    return parseInt(a[2],10)-parseInt(b[2],10)
	})
	
	g("print-table").innerHTML = ""
	$("<tr><td>Time</td><td>Fall Course</td><td>Spring Course</td></tr>").appendTo(g("print-table"))
	var skipNext = false
	for (slot of orderedSelectedSchedule){
	    if(!skipNext){
		var x =  document.createElement("tr")
		let period = slot[1]
		let perName = getPeriodName(period)
		let timeRange = getTime(period)[0] + " - " + getTime(period)[1]
		let location = period.includes("s") ? "STEAM Center" : (period.includes("h") ? "Allen HS" : "ERR_LocationNotFound")
		let day = ""
		switch(dayFromPeriod(period)){
		case "D":
		    day = "Daily";
		    break;
		case "A":
		    day = "A Day";
		    break;
		case "B":
		    day = "B Day";
		    break;
		default:
		    day = "failed to get day value";
		    break;
		    
		}
	    	
		$("<td><span style='font-size:20px'>" + perName + "</span><br>" + timeRange + "<br>" + location + " - <b>" + day + "</b></td>").appendTo(x)
		
		skipNext = orderedSelectedSchedule.filter(x=>x[1] == period).length == 2
		
		var filteredList = orderedSelectedSchedule.filter(x=>x[1] == period)
		var counter = 0
		for(classToAdd of filteredList){
		    var emptyBefore = false
		    var emptyAfter = false
		    
		    if(filteredList.length == 1){
			
			(filteredList[0][2] == "2") ? emptyBefore = true : emptyAfter = true
		    }
		    
		    
		    let className = classToAdd[0].subject
		    //console.log(classToAdd[0].code.split(","))
		    
		    
		    x.setAttribute("height", 0)
		    if(emptyBefore){
			$("<td></td>").appendTo(x)
			counter += 1;
		    }
		    let classCode = classToAdd[0].code.split(",").length > 1 ? classToAdd[0].code.split(",")[counter] : classToAdd[0].code
		    $("<td>" + className + "<br><b>" + classCode + "</b></td>").appendTo(x)
		    if(emptyAfter){
			$("<td></td>").appendTo(x)
		    }
		    g("print-table").appendChild(x)
		    counter += 1
		}
		
	    } else {
		skipNext = false
	    }
	}
	print();
	g("print-cover").style.display = "none"
    } else if (!twoSemesterClasses.every(subject => twoSemesterClasses.filter(subject2 => subject2[SCHEDULE_SUBJECT] == subject[SCHEDULE_SUBJECT]).length == 2)){
	alert("Please schedule your two semester classes for both semesters.");
    } else {
	alert("There are currently errors in your schedule.")
    }
}

$(document).ready(function() {
    document.getElementById("print-button").onclick = printButton    
    document.getElementById("search").onkeydown = function(){
	setTimeout(search, 50)
    }
})

setTimeout(function(){
    
    document.getElementById("loading-cover").style.display = "none"
}, 500)
