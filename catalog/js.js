const COURSE_NAME = 0;
const COURSE_APPCODE = 1;
const COURSE_CODE = 2;
const COURSE_CODELEVELS = 3;
const COURSE_CODESUFFIX = 4;
const COURSE_PLACEMENT = 5;
const COURSE_CREDLOW = 6;
const COURSE_CREDHIGH = 7;
const COURSE_GRADELOW = 8;
const COURSE_GRADEHIGH = 9;
const COURSE_ISAPP = 10;
const COURSE_ISIB = 11;
const COURSE_ISDC = 12;
const COURSE_ISAP = 13;
const COURSE_ISPREAP = 14;
const COURSE_ISONLEVEL = 15;
const COURSE_ISHIDDEN = 16;
const COURSE_LOCATIONNAME = 17;
const COURSE_CATEGORYNAME = 18;
const COURSE_SUBCATEGORYNAME = 19;
const COURSE_COURSENAMEROOT = 20;
const COURSE_COURSENAMESUFFIXES = 21;
const COURSE_AHSBITMAP = 22;
const COURSE_STEAMBITMAP = 23;

const FIELDS_WITH_SELECT = [3, 4, 5, 6, 8]
const FIELDS_WITH_INPUT = [0, 1, 2, 7]


var allSubjectsNotFormatted = [];
var allSubjects = [];
var fieldsUsed = [false, false, false, false, false, false, false, false, false];
//table row format: <tr><td>name</td><td>code</td><td>Level</td><td>sucategoryname</td><td>creditsLow - credHigh</td><td>gradelow - gradehigh</td><td>semester</td><td>AppCode</td><td>locationame</td></tr>


function baseTenToBinary(num) {
    var binaryString = ""

    while (num > 0) {
	binaryString = (num % 2).toString() + binaryString
	num = parseInt(num / 2)
    }

    return binaryString
}


function baseTenToPeriodString(baseTen){
    var binaryStr = baseTenToBinary(baseTen)
    var formattedStr = binaryStr.split("").reverse().join("")
    var returnArray = []    
    for (var i in formattedStr){
	if (formattedStr[i] == "1"){
	    returnArray.push("" + (i + 1))
	}
    }
    
    return returnArray.join(", ")
}
    

function sortRows(){
    document.getElementById("scroll-table").scrollTop = 0
    var maxMatch = 0
    var totalMatches = 0;

    var table = document.getElementById("scroller");
    
    for (var subject of allSubjects) {
	matches = subject.matches;
	totalMatches += matches;
	
	if(matches > maxMatch){
	    maxMatch = matches;
	}
    }
    console.log(maxMatch);
    for (var subject of allSubjects) {
	if (subject.matches < maxMatch || (maxMatch == fieldsUsed.length - fieldsUsed.filter(fieldUsed => fieldUsed).length && fieldsUsed.includes(true))) {
	    subject.visible = false;
	}
	else {
	    subject.visible = true;
	}
    }

    var newTable = document.createElement("table");

    for (var subject of allSubjects) {
	if (subject.visible) {
	    var newRow = newTable.insertRow(-1);
	    newRow.innerHTML = subject.elem.cloneNode(true).innerHTML;
	}
    }
    console.log(newTable);
    table.innerHTML = newTable.innerHTML;
}

function onFieldChange(field) {
    setTimeout(function(){
	var table = document.getElementById("table");
	var id = field.parentNode.cellIndex;
	var value;
	
	if (FIELDS_WITH_SELECT.includes(id)) {
	    value = field.value;
	    fieldsUsed[id] = value != "default";
	}
	
     	else if (FIELDS_WITH_INPUT.includes(id)) {
	    value = field.getElementsByTagName("input")[0].value;
	    fieldsUsed[id] = value != "";
	}
	
	value = value.toUpperCase();
	
	var currField;
	var currFieldValue;
	var matched;
	
	for (var subject of allSubjects) {
	    var property = FIELD_NAMES[id];
	    currField = subject[property];
	    
	    currFieldValue = currField.value.toUpperCase();
	    matched = currField.matched;
	    currField.matched = currFieldValue.search(value) != -1 || value == "" || value == "DEFAULT";
	    console.log(currField);
	    if (matched && !currField.matched) {
		subject.matches -= 1; 
	    }
	    else if (!matched && currField.matched) {
		subject.matches += 1;
	    }
	}
	sortRows();
    }, 50)
}

const FIELD_NAMES = [
    "name",
    "code",
    "applicationCode",
    "subcategory",
    "gradeRange",
    "location",
    "placement",
    "creditRange",
    "semesters"
];

var subcategories = [];

var dataRequest = new XMLHttpRequest();
dataRequest.onload = function(){
    //Put the database raw data into an array
    allSubjectsNotFormatted = JSON.parse(this.responseText);
    //Go through the array and create table rows
    table = document.getElementById("scroller");
    for (var component of allSubjectsNotFormatted) {

	if (component[COURSE_ISHIDDEN] == "1") {
	    continue;
	}
	var newRow = document.createElement("tr");

	var courseName = component[COURSE_NAME];
	var rowArray = [].slice.call(table.rows);
	if (!subcategories.includes(component[COURSE_SUBCATEGORYNAME])) {
	    subcategories.push(component[COURSE_SUBCATEGORYNAME]);
	}
	var matchFound = false;
	rowArray.forEach((row, i) => {
	    if (row.cells[0].innerText == courseName) {
		console.log(courseName);
		row.cells[3].getElementsByTagName("p")[0].innerHTML += "<br>" + component[COURSE_SUBCATEGORYNAME];
		allSubjects[i].subcategory.value += " " + component[COURSE_SUBCATEGORYNAME];
		allSubjects[i].elem.cells[3].getElementsByTagName("p")[0].innerHTML += "<br>" + component[COURSE_SUBCATEGORYNAME];
		matchFound = true;
	    }
	});
	if (matchFound) {
	    continue;
	}
	var courseCodeLevels = component[COURSE_CODELEVELS].split(",");
	var courseCode = ""
	var courseCodes = ""
	for (var codeLevel of courseCodeLevels) {
	    courseCode += component[COURSE_CODE] + codeLevel + component[COURSE_CODESUFFIX] + "<br />";
	    courseCodes += (component[COURSE_CODE] + codeLevel + component[COURSE_CODESUFFIX]) + " "; 
	}
//	var coursePeriods
	/*if (component[COURSE_AHSBITMAP] != null) {
	    coursePeriods = baseTenToPeriodString(component[COURSE_AHSBITMAP]);
	}
	else {
	    coursePeriods = baseTenToPeriodString(component[COURSE_STEAMBITMAP]);
	}*/
	var courseDiffLevel

	if(component[COURSE_ISIB] == "1"){
	    courseDiffLevel = "I.B."
	}
	else if (component[COURSE_ISAP] == "1") {
	    courseDiffLevel = "A.P.";
	}
	else if (component[COURSE_ISONLEVEL] == "1") {
	    courseDiffLevel = "O.L.";
	}
	else if (component[COURSE_ISDC] == "1") {
	    courseDiffLevel = "D.C.";
	}
	else if (component[COURSE_ISPREAP] == "1") {
	    courseDiffLevel = "PAP/IB";
	}
	else if (component[COURSE_ISHIDDEN] == "1") {
	    courseDiffLevel = "SpEd";
	}
	else {
	    courseDiffLevel = "ERR";
	}

	var courseSubCategory = component[COURSE_SUBCATEGORYNAME]
	var courseGradeRange = (component[COURSE_GRADELOW] != component[COURSE_GRADEHIGH] ? component[COURSE_GRADELOW] + "th - " + component[COURSE_GRADEHIGH] + "th" : component[COURSE_GRADELOW] + "th Only");
	var courseGrades = "";
	for (var grade = parseInt(component[COURSE_GRADELOW], 10); grade <= parseInt(component[COURSE_GRADEHIGH], 10); grade++) {
	    courseGrades += grade + "th ";
	}
	if (component[COURSE_CODESUFFIX] == "A/B") {
	    courseSemesters = "1st and 2nd"
	}
	else {
	    var courseSemesters = (component[COURSE_CODESUFFIX] == "A" ? "1st Only" : component[COURSE_CODESUFFIX] == "B" ? "2nd Only" : "1st or 2nd");
	}
	var courseAppCode = component[COURSE_APPCODE] == null ? "" : component[COURSE_APPCODE]
	var courseLocationName = component[COURSE_LOCATIONNAME]
	var courseCredRange = (component[COURSE_CREDLOW] != component[COURSE_CREDHIGH] ? component[COURSE_CREDLOW] + " - " + component[COURSE_CREDHIGH] : component[COURSE_CREDLOW]);

	$("<td>" + courseName + "</td><td><p>" + courseCode + "</p></td><td>" + courseAppCode + "</td><td><p>" + courseSubCategory + "</p></td><td>" + courseGradeRange + "</td><td>" + courseLocationName + "</td><td>" + courseDiffLevel + "</td><td>" + courseCredRange + "</td><td>" + courseSemesters + "</td>").appendTo(newRow)
	table.appendChild(newRow);

	var currComponent = {
	    name: {
		value: courseName,
		matched: true
	    },
	    code: {
		value: courseCodes,
		matched: true
	    },
	    applicationCode: {
		value: courseAppCode,
		matched: true
	    },
	    subcategory: {
		value: courseSubCategory,
		matched: true
	    },
	    gradeRange: {
		value: courseGrades + " " + courseGradeRange,
		matched: true
	    },
	    location: {
		value: courseLocationName,
		matched: true
	    },
	    placement: {
		value: courseDiffLevel,
		matched: true
	    },
	    creditRange: {
		value: courseCredRange,
		matched: true
	    },
	    semesters: {
		value: courseSemesters,
		matched: true
	    },
	    matches: 9,
	    visible: true,
	    elem: newRow.cloneNode(true)
	};
	
	allSubjects.push(currComponent);	
    }
    
}

dataRequest.open("get", "getData.php", true);
dataRequest.send();
setTimeout(function() {
    var categorySelect = document.getElementById("header").getElementsByTagName("select")[0];
    subcategories.sort((subcategoryOne, subcategoryTwo) => subcategoryOne.localeCompare(subcategoryTwo))
    for (var subcategory of subcategories) {
	var option = document.createElement("option");
	option.text = subcategory;
	categorySelect.add(option);
    }
    allSubjects.sort((courseOne, courseTwo) => courseOne.name.value.localeCompare(courseTwo.name.value));
    sortRows();
}, 50);
