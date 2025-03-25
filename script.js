var code = document.getElementById("code");
var title = document.getElementById("title");
var output = document.getElementById("output");
var btn = document.getElementById("btn");
var stopBtn = document.getElementById("stop");
var input = document.getElementById("upload");
var save = document.getElementById("save");
var newFile = document.getElementById("new");
var fileSelectDiv = document.getElementById("container");
var newFileName = document.getElementById("new-name");

code.disabled = true;
title.disabled = true;
newFileName.disabled = true;

const outputHandler = () => {
    // output.innerHTML = code.value
    // console.log(123)
    isStop = false;
    btn.disabled = true;
    stopBtn.disabled = false;
    startProgram(code.value);
};

const stopHandler = () => {
    clearInterval(interval);
    clearInterval(gameInterval);
    isStop = true;
    btn.disabled = false;
    stopBtn.disabled = true;
    if (usingModules.indexOf("GAME") >= 0) {
        if (showCanvas != null) {
            showCanvas.removeEventListener("mousemove", moveMouseHandler);
        }
    }
    if (usingModules.indexOf("FILE") >= 0) {
        for (var i = 0; i < playingMp3.length; i++) {
            playingMp3[i].pause();
        }
    }
    showCanvas = null;
};

const newFileHandler = () => {
    if (newFileName.value == "") {
        alert("공백 파일은 만들 수 없습니다.");
        return;
    }
    title.value = newFileName.value;
    code.value = "";
    saveTextFile();
    alert("파일이 생성되었습니다. 사용하려면 다시 폴더를 불러와주세요.");
};

const focusHandler = () => {
    isFocused = !isFocused;
}

const focusTitleHandler = () => {
    isFocusedTitle = !isFocusedTitle;
}

var goldlangFiles = {};
var imageFiles = {};
var audioFiles = {};

function saveImageFiles() {
    const selectedFile = input.files;
    imageFiles = {};
    for (var file of selectedFile) {
        const fileName = file.name;
        imageFiles[fileName] = file;
        const extension = fileName.split(".")[1];
        var reader = new FileReader();
        reader.readAsDataURL(imageFiles[fileName]);
        if (file.name.split(".")[1] == "png" || file.name.split(".")[1] == "jpg") {
            autoImgFiles[fileName.split(".")[0]] = file;
            const newAutoImg = new Image();
            newAutoImg.src = window.URL.createObjectURL(autoImgFiles[fileName.split(".")[0]]);
            newAutoImg.onload = (e) => {
                autoImgFilesInfo[fileName.split(".")[0]] = [newAutoImg.width, newAutoImg.height];
            }
        }
    
    }
}

function saveMp3Files() {
    const selectedFile = input.files;
    mp3Files = {};
    for (var file of selectedFile) {
        const fileName = file.name;
        audioFiles[fileName] = file;
        var reader = new FileReader();
        reader.readAsDataURL(audioFiles[fileName]);
        if (file.name.split(".")[1] == "mp3") {
            autoMp3Files[fileName.split(".")[0]] = file;
            const newAutoMp3 = new Audio();
            newAutoMp3.src = window.URL.createObjectURL(autoMp3Files[fileName.split(".")[0]]);
        }
    }
}

const showTextFile = () => {
    const selectedFile = input.files;
    goldlangFiles = {};
    fileSelectDiv.innerHTML = "";
    
    for (var file of selectedFile) {
        const fileName = file.name;
        goldlangFiles[fileName] = file;
        const extension = fileName.split(".")[1];
        const fileBtn = document.createElement("button");
        fileBtn.textContent = fileName;
        fileBtn.addEventListener("click", function() {
            if (extension == "txt") {
                var reader = new FileReader();
                reader.readAsText(goldlangFiles[fileBtn.textContent], "UTF-8");
                reader.onload = function() {
                    code.value = reader.result;
                    title.value = fileName.split(".")[0];
                    code.disabled = false;
                    title.disabled = false;
                }
            } else if (extension == "png" || extension == "jpg") {
                var reader = new FileReader();
                reader.readAsDataURL(goldlangFiles[fileBtn.textContent]);
                reader.onload = function() {
                    title.value = fileName.split(".")[0];
                    code.value = "";
                    code.disabled = true;
                    title.disabled = true;
                }
            } else {
                code.value = "";
                title.value = "";
                code.disabled = true;
                title.disabled = true;
            }
        });
        fileSelectDiv.appendChild(fileBtn);
    }
    newFileName.disabled = false;
}

btn.addEventListener("click", outputHandler);
stopBtn.addEventListener("click", stopHandler);
code.addEventListener("focus", focusHandler);
code.addEventListener("blur", focusHandler);
title.addEventListener("focus", focusTitleHandler);
title.addEventListener("blur", focusTitleHandler);
newFile.addEventListener("click", newFileHandler);

//변수 등 저장공간
var varsDict = {};
var functionDict = {};
var varsInFunctionDict = {};
var varsType = {};
var varsInFunctionType = {};
var usingModules = [];
var inputFunc = {};
var inputStopFunc = {};
var gameCodes = [];
var waits = [];
var classDict = {};
var funcInClassDict = {};
var varsInClassFunc = {};

// GAME 모듈 변수
var showCanvas = null;
var gameFps = 10;
var mouseX = 0;
var mouseY = 0;

// INPUT 모듈 변수
var fps = 10;

// FILE 모듈 변수'
var autoImgFiles = {};
var imgFiles = {};
var autoImgFilesInfo = {};
var imgFilesInfo = {};
var autoMp3Files = {};
var mp3Files = {};
var playingMp3 = [];

// 기타 변수
var nowLine = 0;
var totalCode;
var totalLine = 0;
var nowBraclet = {"function" : "", "class" : ""};
var nowClassVars = {};
var element = "";
var isStop = true;
var isFocused = false;
var isFocusedTitle = false;
var nowInputFunc = [];
stopBtn.disabled = true;
var interval;
var gameInterval;
var isWait = false;
var nowClassVar = "";

const BRACLET_CODE = ["IF", "REPEAT", "FUNCTION", "WHILE", "CLASS", "INPUT_GETKEY", "INPUT_KEYUP"];
const VALUE_CODE = ["GET", "ADD", "SUB", "MUL", "DIV", "JOIN", "BIGGER", "SMALLER", "SAME", "NOT", "ALL", "OR", "INDEX", "LENGTH", "GAME_SIZE", "GAME_CREATE_RECT", "GAME_CREATE_CIRCLE", "MATH_RANDOM", "SET_FPS", "GAME_FPS", "CHANGE", "NEWLIST", "DELETE", "MATH_ABS", "GET_CLASS_VAR", "CHANGE_CLASS_LIST", "NEW_CLASS_LIST", "DELETE_CLASS", "GAME_MOUSE_X", "GAME_MOUSE_Y", "GAME_DRAW_IMAGE", "IMAGE_WIDTH", "IMAGE_HEIGHT", "GAME_WRITE"];
const DIVIDING_CHAR = [",", "<", " ", '"'];
const VARS_TYPE = ["VARS", "LIST", "CLASS", "CLASS_LIST"];
const MODULES = ["GAME", "INPUT", "MATH", "FILE"];
const INPUT_KEY = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

const moveMouseHandler = (e) => {
    mouseX = e.pageX - showCanvas.getContext("2d").canvas.offsetLeft;
    mouseY = e.pageY - showCanvas.getContext("2d").canvas.offsetTop;
}

// 저장 및 불러오기
input.addEventListener("change", showTextFile);
input.addEventListener("change", saveImageFiles);
input.addEventListener("change", saveMp3Files);
// function getTextFile() {
//     const selectedFile = input.files;

//     showTextFile();

//     var reader = new FileReader();
//     reader.onload = function() {
//         code.value = reader.result;
//     }
//     reader.readAsText(selectedFile[0], "UTF-8");
//     title.value = selectedFile[0].name.slice(0, -4);
// }

save.addEventListener("click", saveTextFile);
function saveTextFile() {
    const blob = new Blob([code.value], {type:'text/plain'});
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = title.value;
    document.body.appendChild(a);

    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);

    showTextFile();
    saveImageFiles();
    saveMp3Files();
}

document.addEventListener("keydown", function(event) {
    if (!isStop && !(document.activeElement.className == "codes")) {
        if (event.key in inputFunc) {
            nowInputFunc.push(inputFunc[event.key]);
        }
    }
});

document.addEventListener("keyup", function(event) {
    if (!isStop && !(document.activeElement.className == "codes")) {
        if (event.key in inputStopFunc) {
            nowInputFunc.push(inputStopFunc[event.key]);
        }
    }
});

function doEvent() {
    // EVENT
    if (nowInputFunc.length == 0) {
        return;
    }
    var beforeEventLine = nowLine;
    for (var i = 0; i < nowInputFunc.length; i++) {
        nowLine = nowInputFunc[i][0] - 1;
        while (nowLine < nowInputFunc[i][1]) {
            nowLine++;
            if (eraseSpace(totalCode[nowLine]) == "STOP;") {
                nowLine = beforeEventLine;
                nowInputFunc = [];
                return;
            }
            doProgramLine(eraseSpace(totalCode[nowLine]));
        }
    }
    nowLine = beforeEventLine;
    nowInputFunc = [];
}

function doGame() {
    if (gameCodes.length == 0) {
        return;
    }

    var beforeEventLine = nowLine;
    for (var i = 0; i < gameCodes.length; i++) {
        nowLine = gameCodes[i][0] - 1;
        while (nowLine < gameCodes[i][1]) {
            nowLine++;
            if (eraseSpace(totalCode[nowLine]) == "STOP;") {
                nowLine = beforeEventLine;
                //gameCodes = [];
                return;
            }
            if (!(eraseSpace(totalCode[nowLine]).split(" ")[0] == "GAME_START{")) {
                doProgramLine(eraseSpace(totalCode[nowLine]));
            }
        }
    }
    nowLine = beforeEventLine;
    //gameCodes = [];
}

function startWait(ms) {
    return new Promise((r1, r2) => {
        setTimeout(() => {}, ms);
    })
}

function eraseSpace(nowLintCode) {
    for (var i = 0; i < nowLintCode.length; i) {
        if (nowLintCode.indexOf(" ") == 0) {
            nowLintCode = nowLintCode.slice(1);
        } else {
            break;
        }
    }
    return nowLintCode;
}

// 프로그램 각 줄 실행
function doProgramLine(lineCode) {
    if (isStop) {
        nowLine = -1;
        return;
    }
    element = eraseSpace(changeValue(lineCode));
 
    if (element == ";") {
        return;
    }

    var elementBySpace = element.split(" ");
    // SET MODULES
    if (elementBySpace.length >= 2 && elementBySpace[0] == "#USE") {
        if (MODULES.indexOf(elementBySpace[1].slice(0, -1)) >= 0) {
            usingModules.push(elementBySpace[1].slice(0, -1));
        } else {
            ShowError(12);
            return;
        }
    }

    // SHOW
    if (elementBySpace.length >= 2 && elementBySpace[0] == "SHOW" && element.slice(5, 6) == '"' && element.slice(element.length - 2, element.length - 1) == '"') {
        const showMessage = document.createElement("p");
        showMessage.append(element.slice(6, element.length - 2));
        output.append(showMessage);

    }

    // SET
    if (elementBySpace.length >= 4 && elementBySpace[0] == "SET" && elementBySpace[2] == "IS") {
        if (nowBraclet["function"] == "") {
            varsDict[elementBySpace[1]] = element.slice(8 + elementBySpace[1].length, -1);
            varsType[elementBySpace[1]] = "VARS";
        } else {
            varsInFunctionDict[elementBySpace[1]] = element.slice(8 + elementBySpace[1].length, -1);
            varsInFunctionType[elementBySpace[1]] = "VARS";
        }
        return;
    }

    // IF
    if ((elementBySpace.length >= 3 && elementBySpace[0] == "IF" && elementBySpace[2].slice(0, 5) == "THEN{")) {
        if (elementBySpace[1] == "FALSE") {
            var ifCount = 1;
            while (ifCount > 0 && nowLine < totalLine) {
                nowLine++;
                if (BRACLET_CODE.indexOf(eraseSpace(totalCode[nowLine]).split(" ")[0]) >= 0) {
                    ifCount++;
                } else if (eraseSpace(totalCode[nowLine]).split(" ")[0] == "}") {
                    ifCount--;
                }
            }
        } else if (elementBySpace[1] != "TRUE") {
            ShowError(3);
            return;
        }
        return;
    }

    // REPEAT
    if (elementBySpace.length >= 3 && elementBySpace[0] == "REPEAT" && elementBySpace[2].slice(0, 6) == "START{") {
        var startLine = nowLine;
        var endLine = startLine;
        var totalRepeatCount = 1;
        if (isNaN(Number(elementBySpace[1]))) {
            ShowError(3);
            return;
        }
        var repeatCount = Number(elementBySpace[1]);
        while (totalRepeatCount > 0 && nowLine < totalLine) {
            nowLine++;
            if (BRACLET_CODE.indexOf(eraseSpace(totalCode[nowLine]).split(" ")[0]) >= 0) {
                totalRepeatCount++;
            } else if (eraseSpace(totalCode[nowLine]).split(" ")[0] == "}") {
                totalRepeatCount--;
            }
        }
        endLine = nowLine;
        nowLine = startLine;

        for (var i = 0; i < repeatCount; i++) {
            while (nowLine < endLine) {
                nowLine++;
                if (eraseSpace(totalCode[nowLine]) == "STOP;") {
                    nowLine = endLine;
                    return;
                }
                doProgramLine(eraseSpace(totalCode[nowLine]));
            }
            nowLine = startLine;
        }
        nowLine = endLine;
        return;
    }

    // FUNCTION
    if (elementBySpace.length >= 3 && elementBySpace[0] == "FUNCTION" && elementBySpace[2].slice(0, 6) == "START{") {
        var funcName = elementBySpace[1].split("(")[0];

        
        if (!(funcName in functionDict)) {
            var functionStartLine = nowLine + 1;
            var fucntionCount = 1;
            while (fucntionCount > 0 && nowLine < totalLine) {
                nowLine++;
                if (BRACLET_CODE.indexOf(eraseSpace(totalCode[nowLine]).split(" ")[0]) >= 0) {
                    fucntionCount++;
                } else if (eraseSpace(totalCode[nowLine]).split(" ")[0] == "}") {
                    fucntionCount--;
                }
            }
            var varsNameObject = [];
            var varsValueObject = [];
            if (elementBySpace[1].split("(")[1] != ")") {
                var varsName = elementBySpace[1].split(")")[0].split("(")[1].split(",");
                
                for (var i = 0; i < varsName.length; i++) {
                    varsNameObject.push(varsName[i]);
                    varsValueObject.push("");
                }
            }
            varsNameObject = varsNameObject.filter((e) => e != "");
            varsValueObject = varsValueObject.filter((e) => e != "");
            var funcLine = {startline: functionStartLine, endline: nowLine, varsname: varsNameObject, varsValue: varsValueObject}
            
            functionDict[funcName] = funcLine;
        } else {
            ShowError(4);
            return;
        }
        return;
    }

    // DO
    if (elementBySpace.length >= 2 && elementBySpace[0] == "DO") {
        var funcName = elementBySpace[1].split("(")[0];
        if (!(funcName in functionDict)) {
            ShowError(5);
            return;
        }
        var varsInfo = elementBySpace[1].split(")")[0].split("(")[1].split(",");
        varsInfo = varsInfo.filter((e) => e != "");
        if (functionDict[funcName].varsname.length != varsInfo.length) {
            ShowError(6);
            return;
        }
        for (var i = 0; i < varsInfo.length; i++) {
            functionDict[funcName].varsValue[i] = varsInfo[i];
        }
        lastLine = nowLine;
        nowLine = Number(functionDict[funcName].startline);
        finalLine = Number(functionDict[funcName].endline);
        nowBraclet["function"] = funcName;
        for (var i = nowLine; i < lastLine - 1; i++) {
            if (totalCode[i] == "STOP;") {
                nowBraclet["function"] = "";
                varsInFunctionDict = {};
                nowLine = lastLine;
                return;
            }
            doProgramLine(totalCode[i]);
        }
        nowBraclet["function"] = "";
        varsInFunctionDict = {};
        nowLine = lastLine;

        return;
    }

    // LIST
    if (elementBySpace.length >= 4 && elementBySpace[0] == "LIST" && elementBySpace[2] == "IS") {
        var listName = elementBySpace[1];
        
        if (lineCode[9 + listName.length] != "[" || lineCode[lineCode.length - 2] != "]") {
            ShowError(9);
            return;
        }
        var listText = lineCode.slice(10 + listName.length, -2);
        var listValues;
        if (listText == "") {
            listValues = [];
        } else {
            listValues = listText.split(",");
        }

        if (nowBraclet["function"] == "") {
            varsDict[listName] = listValues;
            varsType[listName] = "LIST";
        } else {
            varsInFunctionDict[listName] = listValues;
            varsInFunctionType[listName] = "LIST";
        }

        return;
    }

    // WHILE
    if (elementBySpace.length >= 3 && elementBySpace[0] == "WHILE" && elementBySpace[2].slice(0, 6) == "START{") {
        var startLine = nowLine;
        var endLine = startLine;
        var totalRepeatCount = 1;
        if (elementBySpace[1] != "TRUE" && elementBySpace[1] != "FALSE") {
            ShowError(3);
            return;
        }
        var repeatCount = Number(elementBySpace[1]);
        while (totalRepeatCount > 0 && nowLine < totalLine) {
            nowLine++;
            if (BRACLET_CODE.indexOf(eraseSpace(totalCode[nowLine]).split(" ")[0]) >= 0) {
                totalRepeatCount++;
            } else if (eraseSpace(totalCode[nowLine]).split(" ")[0] == "}") {
                totalRepeatCount--;
            }
        }
        endLine = nowLine;
        nowLine = startLine;

        while (element.split(" ")[1] == "TRUE") {
            while (nowLine < endLine) {
                nowLine++;
                if (eraseSpace(totalCode[nowLine]) == "STOP;") {
                    nowLine = endLine;
                    return;
                }
                doProgramLine(eraseSpace(totalCode[nowLine]));
            }
            nowLine = startLine;
            element = changeValue(eraseSpace(totalCode[nowLine]));
        }
        nowLine = endLine;
        return;
    }

    // CLASS
    if (elementBySpace.length >= 3 && elementBySpace[0] == "CLASS" && elementBySpace[2] == "START{") {
        var startLine = nowLine;
        var endLine = startLine;
        nowBraclet["class"] = elementBySpace[1];
        if (nowBraclet["class"] in funcInClassDict) {
            ShowError(16);
            return;
        }
        var totalClassCount = 2;
        while (totalClassCount > 0 && nowLine < totalLine) {
            nowLine++;
            if (BRACLET_CODE.indexOf(eraseSpace(totalCode[nowLine]).split(" ")[0]) >= 0) {
                totalClassCount++;
            } else if (eraseSpace(totalCode[nowLine]).split(" ")[0] == "}") {
                totalClassCount--;
            }
        }
        endLine = nowLine;
        nowLine = startLine + 1;
       
        var funcsInClass = {};
        while (nowLine < endLine) {
            if (eraseSpace(totalCode[nowLine]).split(" ")[0].slice(0,8) == "DEFAULT(") {
                totalClassCount = 1;
                while (totalClassCount > 0 && nowLine < endLine) {
                    nowLine++;
                    if (BRACLET_CODE.indexOf(eraseSpace(totalCode[nowLine]).split(" ")[0]) >= 0) {
                        totalClassCount++;
                    } else if (eraseSpace(totalCode[nowLine]).split(" ")[0] == "}") {
                        totalClassCount--;
                    }
                }
                funcsInClass["default"] = [startLine + 1, nowLine];
                break;
            }
            nowLine++;
        }
        if (!("default" in funcsInClass)) {
            ShowError(17);
            return;
        }
        while (nowLine < endLine) {
            if (eraseSpace(totalCode[nowLine]).split(" ")[0] == "FUNCTION" && eraseSpace(totalCode[nowLine]).split(" ")[2].slice(0,6) == "START{") {
                totalClassCount = 1;
                while (totalClassCount > 0 && nowLine < endLine) {
                    nowLine++;
                    if (BRACLET_CODE.indexOf(eraseSpace(totalCode[nowLine]).split(" ")[0]) >= 0) {
                        totalClassCount++;
                    } else if (eraseSpace(totalCode[nowLine]).split(" ")[0] == "}") {
                        totalClassCount--;
                    }
                }
                var finishLine = nowLine;
                nowLine -= 2;
                if (eraseSpace(totalCode[nowLine]).split(" ")[1].indexOf("(") < 0 || eraseSpace(totalCode[nowLine]).split(" ")[1].indexOf(")") < 0) {
                    ShowError(7);
                    return;
                }
                if (eraseSpace(totalCode[nowLine]).split(" ")[1].split("(")[0] in funcsInClass) {
                    ShowError(4);
                    return;
                }
                funcsInClass[eraseSpace(totalCode[nowLine]).split(" ")[1].split("(")[0]] = [nowLine, finishLine];
                nowLine = endLine;
                break;
            }
            nowLine++;
        }
        funcInClassDict[nowBraclet["class"]] = funcsInClass;
    }

    // NEW
    if (elementBySpace.length == 4 && elementBySpace[0] == "NEW" && elementBySpace[2] == "IS") {
        var newClassName = elementBySpace[1];

        if (newClassName in classDict) {
            ShowError(18);
            return;
        }

        if (elementBySpace[3].indexOf("(") < 0 || elementBySpace[3].indexOf(")") < 0) {
            ShowError(19);
            return;
        }
        var newClassValue = elementBySpace[3].split("(")[0];
        if (!(newClassValue in funcInClassDict)) {
            ShowError(20);
            return;
        }
        nowBraclet["class"] = newClassValue;
        nowClassVars = {};
        var newClassVarsValue = elementBySpace[3].split("(")[1].slice(0, -2);
        var newVarsInClassFunc = eraseSpace(totalCode[funcInClassDict[newClassValue]["default"][0]]).slice(8,-8).split(",");
        if (newClassVarsValue != "") {
            if (newClassVarsValue.split(",").length != newVarsInClassFunc.length) {
                ShowError(6);
                return;
            }
            var nowVar = newClassVarsValue.split(",");
            for (var i = 0; i < nowVar.length; i++) {
                nowClassVars[newVarsInClassFunc[i]] = nowVar[i];
            }
        }
        classDict[newClassName] = {};
        classDict[newClassName]["function"] = funcInClassDict[nowBraclet["class"]];
        classDict[newClassName]["vars"] = nowClassVars;
        classDict[newClassName]["className"] = nowBraclet["class"];
        for (var i = funcInClassDict[newClassValue]["default"][0]; i < funcInClassDict[newClassValue]["default"][1]; i++) {
            doProgramLine(eraseSpace(totalCode[i]));
        }
        
        nowBraclet["class"] = "";
    }

    // FROM DO
    if (elementBySpace.length >= 4 && elementBySpace[0] == "FROM" && elementBySpace[2] == "DO") {
        var nowFuncObj = elementBySpace[1];
        if (!(nowFuncObj in classDict)) {
            ShowError(1);
            return;
        }

        var nowFuncName = elementBySpace[3].split("(")[0];
        if (!(nowFuncName in classDict[nowFuncObj]["function"])) {
            ShowError(5);
            return;
        }
        var funcNameInClass = classDict[nowFuncObj]["function"][nowFuncName];
        nowBraclet["class"] = classDict[nowFuncObj]["className"];
        nowBraclet["function"] = nowFuncName;
        var varsInNowClassFunc = eraseSpace(totalCode[funcNameInClass[0]]).split(" ")[1].split("(")[1].slice(0, -1).split(",")
        for (var i = 0; i < varsInNowClassFunc.length; i++) {
            varsInClassFunc[varsInNowClassFunc[i]] = elementBySpace[3].split("(")[1].slice(0, -2).split(",")[i];
        }
        
        var lastLine = nowLine;
        nowClassVar = nowFuncObj;
        nowLine = funcNameInClass[0] + 1;
        for (var i = funcNameInClass[0] + 1; i < funcNameInClass[1]; i++) {
            doProgramLine(totalCode[nowLine]);
            nowLine++;
        }
        nowLine = lastLine;
        nowBraclet["class"] = "";
        nowBraclet["function"] = "";
    }

    // CLASS_LIST
    if (elementBySpace.length >= 4 && elementBySpace[0] == "CLASS_LIST" && elementBySpace[2] == "IS") {
        var classListName = elementBySpace[1];

        if (lineCode[15 + classListName.length] != "[" || lineCode[lineCode.length - 2] != "]") {
            ShowError(9);
            return;
        }
        var classListText = lineCode.slice(16 + classListName.length, -2);
        var classListValues;
        if (classListText == "") {
            classListValues = [];
        } else {
            classListValues = classListText.split(",");
        }

        if (nowBraclet["function"] == "") {
            varsDict[classListName] = classListValues;
            varsType[classListName] = "CLASS_LIST";
        } else {
            varsInFunctionDict[classListName] = classListValues;
            varsInFunctionType[classListName] = "CLASS_LIST";
        }

        return;
    }

    // DELAY
    if (elementBySpace.length == 4 && elementBySpace[0] == "DELAY" && elementBySpace[2] == "DO") {
        var waitTime = elementBySpace[1];
        var delayFuncName = elementBySpace[3].slice(0, -1);
        if (isNaN(Number(waitTime))) {
            ShowError(3);
            return;
        }

        setTimeout(doProgramLine, waitTime * 1000, "DO " + delayFuncName + ";");
        return;
    }

    // GAME MODULE
    if (usingModules.indexOf("GAME") >= 0) {
        // GAME_SCREEN
        if (elementBySpace.length == 1 && elementBySpace[0] == "GAME_SCREEN;") {
            if (showCanvas == null) {
                showCanvas = document.createElement("canvas");
                output.append(showCanvas);
                showCanvas.addEventListener("mousemove", moveMouseHandler);
            }
            return;
        }

        // GAME_CLEAN
        if (elementBySpace.length == 1 && elementBySpace[0] == "GAME_CLEAN;") {
            if (showCanvas == null) {
                ShowError(13);
                return;
            }
            showCanvas.getContext("2d").clearRect(0, 0, showCanvas.width, showCanvas.height);
            return;
        }

        // GAME_START
        if (elementBySpace.length >= 1 && elementBySpace[0] == "GAME_START{") {
            var startLine = nowLine;
            var endLine = startLine;

            var gameCount = 1;
            while (gameCount > 0 && nowLine < totalLine) {
                nowLine++;
                if (BRACLET_CODE.indexOf(eraseSpace(totalCode[nowLine]).split(" ")[0]) >= 0) {
                    gameCount++;
                } else if (eraseSpace(totalCode[nowLine]).split(" ")[0] == "}") {
                    gameCount--;
                }
            }
            endLine = nowLine;
            gameCodes.push([startLine, endLine]);
            return;
        }
    }

    // INPUT MODULE
    if (usingModules.indexOf("INPUT") >= 0) {
        // INPUT_GETKEY
        if (elementBySpace.length >= 2 && elementBySpace[0] == "INPUT_GETKEY") {
            if (INPUT_KEY.indexOf(elementBySpace[1]) < 0) {
                ShowError(14);
                return;
            }
            var inputCount = 1;
            startCount = nowLine + 1;
            while (inputCount > 0 && nowLine < totalLine) {
                nowLine++;
                if (BRACLET_CODE.indexOf(eraseSpace(totalCode[nowLine]).split(" ")[0]) >= 0) {
                    inputCount++;
                } else if (eraseSpace(totalCode[nowLine]).split(" ")[0] == "}") {
                    inputCount--;
                }
            }
            inputFunc[elementBySpace[1]] = [startCount, nowLine];
            return;
        }

        // INPUT_KEYUP
        if (elementBySpace.length >= 2 && elementBySpace[0] == "INPUT_KEYUP") {
            if (INPUT_KEY.indexOf(elementBySpace[1]) < 0) {
                ShowError(14);
                return;
            }
            var inputCount = 1;
            startCount = nowLine + 1;
            while (inputCount > 0 && nowLine < totalLine) {
                nowLine++;
                if (BRACLET_CODE.indexOf(eraseSpace(totalCode[nowLine]).split(" ")[0]) >= 0) {
                    inputCount++;
                } else if (eraseSpace(totalCode[nowLine]).split(" ")[0] == "}") {
                    inputCount--;
                }
            }
            inputStopFunc[elementBySpace[1]] = [startCount, nowLine];
            return;
        }
    }

    // FILE 모듈
    if (usingModules.indexOf("FILE") >= 0) {
        // SET_IMAGE
        if (elementBySpace.length >= 4 && elementBySpace[0] == "SET_IMAGE" && elementBySpace[2] == "IS") {
            if (!(elementBySpace[3].slice(0, -1) in autoImgFiles)) {
                ShowError(23);
                return;
            }
            const newImg = new Image();
            newImg.src = window.URL.createObjectURL(autoImgFiles[elementBySpace[3].slice(0, -1)]);
            imgFiles[elementBySpace[1]] = newImg;
            imgFilesInfo[elementBySpace[1]] = autoImgFilesInfo[elementBySpace[3].slice(0, -1)]
        }

        // SET_BACKGROUND_MUSIC
        if (elementBySpace.length >= 2 && elementBySpace[0] == "SET_BACKGROUND_MUSIC") {
            if (!(elementBySpace[1].slice(0, -1) in autoMp3Files)) {
                ShowError(23);
                return;
            }
            const newAudio = new Audio();
            newAudio.src = window.URL.createObjectURL(autoMp3Files[elementBySpace[1].slice(0, -1)]);
            newAudio.loop = true;
            mp3Files[elementBySpace[1].slice(0, -1)] = newAudio;
            playingMp3.push(newAudio);
            newAudio.play();
        }

        // SET_AUDIO
        if (elementBySpace.length >= 4 && elementBySpace[0] == "SET_AUDIO" && elementBySpace[2] == "IS") {
            if (!(elementBySpace[3].slice(0, -1) in autoMp3Files)) {
                ShowError(23);
                return;
            }
            const newAudio = new Audio();
            newAudio.src = window.URL.createObjectURL(autoMp3Files[elementBySpace[3].slice(0, -1)]);
            mp3Files[elementBySpace[1]] = newAudio;
        }

        // PLAY_AUDIO
        if (elementBySpace.length >= 2 && elementBySpace[0] == "PLAY_AUDIO") {
            if (!elementBySpace[1].slice(0, -1) in mp3Files) {
                ShowError(1);
                return;
            }
            playingMp3.push(mp3Files[elementBySpace[1].slice(0, -1)]);
            mp3Files[elementBySpace[1].slice(0, -1)].play();
        }
    }

}

// 프로그램 실행 전체 부분
function startProgram(contents) {
    nowLine = 0;
    totalLine = contents.split("\n").length;
    totalCode = contents.split("\n");
    output.replaceChildren();
    varsDict = {};
    functionDict = {};
    varsInFunctionDict = {};
    varsType = {};
    varsInFunctionType = {};
    usingModules = [];
    inputFunc = {};
    inputStopFunc = {};
    gameCodes = [];
    waits = [];
    nowInputFunc = [];
    classDict = {};
    funcInClassDict = {};
    nowClassVars = {};
    varsInClassFunc = {};
    imgFiles = {};
    imgFilesInfo = {};
    mp3Files = {};
    playingMp3 = [];

    if (usingModules.indexOf("GAME") >= 0) {
        if (showCanvas != null) {
            showCanvas.removeEventListener("mousemove", moveMouseHandler);
        }
        //showCanvas = null;
    }

    usingModules = [];

    while (nowLine < totalLine) {
        doProgramLine(contents.split("\n")[nowLine])
        if (nowLine < 0) {
            return;
        }
        nowLine += 1;
    }
    if (usingModules.indexOf("INPUT") >= 0) {
        interval = setInterval(doEvent, 1000 / fps);
    }
    if (usingModules.indexOf("GAME") >= 0) {
        gameInterval = setInterval(doGame, 1000 / gameFps);
    }
}

function reverseText(t) {
    return t.split("").reverse().join("");
}

// 변수 등 불러오기
function changeValue(contents) {
    var resultText = contents;
    var isFinished = true;

    while (true) {
        isFinished = true;
        var startCount = 0;
        for (var i = 0; i < contents.length; i++) {
            if (resultText[i] == "<") {
                startCount = i;
            }
            if (resultText[i] == ">") {
                isFinished = false;
                var endCount = i;
                var endKeyword = startCount;
                while (startCount > 0) {
                    startCount -= 1;
                    if (DIVIDING_CHAR.indexOf(resultText[startCount - 1]) >= 0) {
                        break;
                    }
                }
                if (VALUE_CODE.indexOf(resultText.slice(startCount, endKeyword)) >= 0) {
                    var keyword = resultText.slice(startCount, endKeyword);
                    var lastValue = doChangeValue(resultText.slice(startCount, endCount + 1), keyword);
                    resultText = resultText.slice(0, startCount) + lastValue[1] + resultText.slice(endCount + 1);
                    if (!lastValue[0]) {
                        isFinished = true;
                    }
                    break;
                } else {
                    startCount = -1;
                    break;
                }
                // while (startCount > 0) {
                //     startCount -= 1;
                //     var valueCodeCount = 0;
                //     for (const valueCode of VALUE_CODE) {
                //         if (resultText.slice(startCount, endKeyword).endsWith(valueCode)) {
                //             valueCodeCount++;
                //         }
                //     }
                //     if (valueCodeCount == 1 && VALUE_CODE.indexOf(resultText.slice(startCount, endKeyword)) >= 0) {
                //         var keyword = resultText.slice(startCount, endKeyword);
                //         var lastValue = doChangeValue(resultText.slice(startCount, endCount + 1), keyword);
                //         resultText = resultText.slice(0, startCount) + lastValue[1] + resultText.slice(endCount + 1);
                //         if (!lastValue[0]) {
                //             isFinished = true;
                //         }
                //         break;
                //     }
                // }
            }
        }
        if (startCount < 0) {
            ShowError(8);
            break;
        }
        if (isFinished) {
            break;
        }
        
    }
    return resultText;
}

// 변수 등 불러오는 코드
function doChangeValue(contents, codeKeyword) {
    var resultText = contents;
    var isDoing = false;
    switch (codeKeyword) {
        case "GET":
            var varName = resultText.slice(4, -1);
            if (nowBraclet["class"] != "") {
                if (nowBraclet["function"] != "" && varName in varsInClassFunc) {
                    isDoing = true;
                    resultText = varsInClassFunc[varName];
                    break;
                }
                if (!(varName in classDict[nowClassVar]["vars"])) {
                    ShowError(1);
                    return [isDoing, ""];
                }
                isDoing = true;
                resultText = classDict[nowClassVar]["vars"][varName];
                break;
            }
            if (nowBraclet["function"] != "") {
                if (functionDict[nowBraclet["function"]].varsname.indexOf(varName) >= 0) {
                    isDoing = true;
                    var varIndex = functionDict[nowBraclet["function"]].varsname.indexOf(varName);
                    if (varIndex < 0) {
                        ShowError(1);
                        return [isDoing, ""];
                    }
                    resultText = functionDict[nowBraclet["function"]].varsValue[varIndex];
                    if (varsInFunctionType[varName] == "LIST") {
                        resultText = "[" + resultText + "]";
                    }
                    break;
                } else if (varName in varsInFunctionDict) {
                    isDoing = true;
                    resultText = varsInFunctionDict[varName];
                    if (varsInFunctionType[varName] == "LIST") {
                        resultText = "[" + resultText + "]";
                    }
                    break;
                }
            }
            if (!(varName in varsDict)) {
                ShowError(1);
                return [isDoing, ""];
            } else {
                isDoing = true;
            }
            resultText = varsDict[varName];
            if (varsType[varName] == "LIST") {
                resultText = "[" + resultText + "]";
            }
            break;
        case "ADD":
            var tIndex = resultText.indexOf(",");
            var firstNum = resultText.slice(4, tIndex);
            var secondNum = resultText.slice(tIndex + 1, -1);

            if (isNaN(Number(firstNum) + Number(secondNum))) {
                ShowError(2);
                return [isDoing, ""];
            } else {
                isDoing = true;
            }
            resultText = Number(firstNum) + Number(secondNum);
            break;
        case "SUB":
            var tIndex = resultText.indexOf(",");
            var firstNum = resultText.slice(4, tIndex);
            var secondNum = resultText.slice(tIndex + 1, -1);

            if (isNaN(Number(firstNum) + Number(secondNum))) {
                ShowError(2);
                return [isDoing, ""];
            } else {
                isDoing = true;
            }
            resultText = Number(firstNum) - Number(secondNum);
            break;
        case "MUL":
            var tIndex = resultText.indexOf(",");
            var firstNum = resultText.slice(4, tIndex);
            var secondNum = resultText.slice(tIndex + 1, -1);

            if (isNaN(Number(firstNum) + Number(secondNum))) {
                ShowError(2);
                return [isDoing, ""];
            } else {
                isDoing = true;
            }
            resultText = Number(firstNum) * Number(secondNum);
            break;
        case "DIV":
            var tIndex = resultText.indexOf(",");
            var firstNum = resultText.slice(4, tIndex);
            var secondNum = resultText.slice(tIndex + 1, -1);

            if (isNaN(Number(firstNum) + Number(secondNum))) {
                ShowError(2);
                return [isDoing, ""];
            } else {
                isDoing = true;
            }
            resultText = Number(firstNum) / Number(secondNum);
            break;
        case "JOIN":
            var tIndex = resultText.indexOf(",");
            var firstString = resultText.slice(5, tIndex);
            var secondString = resultText.slice(tIndex + 1, -1);
            isDoing = true;
            resultText = firstString + secondString;
            break;
        case "BIGGER":
            var tIndex = resultText.indexOf(",");
            var firstNum = resultText.slice(7, tIndex);
            var secondNum = resultText.slice(tIndex + 1, -1);

            if (isNaN(Number(firstNum)) || isNaN(Number(secondNum))) {
                ShowError(3);
                return [isDoing, ""];
            }
            isDoing = true;
            resultText = Math.max(Number(firstNum), Number(secondNum));
            break;
        case "SMALLER":
            var tIndex = resultText.indexOf(",");
            var firstNum = resultText.slice(8, tIndex);
            var secondNum = resultText.slice(tIndex + 1, -1);

            if (isNaN(Number(firstNum)) || isNaN(Number(secondNum))) {
                ShowError(3);
                return [isDoing, ""];
            }
            isDoing = true;
            resultText = Math.min(Number(firstNum), Number(secondNum));
            break;
        case "SAME":
            var tIndex = resultText.indexOf(",");
            var firstString = resultText.slice(5, tIndex);
            var secondString = resultText.slice(tIndex + 1, -1);

            isDoing = true;
            var toBool = firstString == secondString ? "TRUE" : "FALSE";
            resultText = toBool;
            break;
        case "NOT":
            var varBool = resultText.slice(4, -1);
            if (!(varBool == "TRUE" || varBool == "FALSE")) {
            
                ShowError(3);
                return [isDoing, ""];
            }
            isDoing = true;
            var resultBool = varBool == "TRUE" ? "FALSE" : "TRUE";
            resultText = resultBool;
            break;
        case "ALL":
            var boolsText = resultText.slice(4, -1);
            var bools = boolsText.split(",");
            if (bools.length == 0) {
                ShowError(7);
                return [isDoing, ""];
            }
            isDoing = true;
            for (var i = 0; i < bools.length; i++) {
                if (bools[i] != "TRUE") {
                    return [isDoing, "FALSE"];
                }
            }
            resultText = "TRUE";
            break;
        case "OR":
            var boolsText = resultText.slice(3, -1);
            var bools = boolsText.split(",");
            if (bools.length == 0) {
                ShowError(7);
                return [isDoing, ""];
            }
            isDoing = true;
            for (var i = 0; i < bools.length; i++) {
                if (bools[i] == "TRUE") {
                    return [isDoing, "TRUE"];
                }
            }
            resultText = "FALSE";
            break;
        case "INDEX":
            var tIndex = resultText.indexOf(",");
            var listName = resultText.slice(6, tIndex);
            var valueIndex = (Number)(resultText.slice(tIndex + 1, -1));
            if (nowBraclet["function"] != "") {
                if (functionDict[nowBraclet["function"]].varsname.indexOf(listName) >= 0) {
                    
                    var listIndex = functionDict[nowBraclet["function"]].varsname.indexOf(listName);
                    
                    if (varsInFunctionType[listName] != "LIST" && varsInFunctionType[listName] != "CLASS_LIST") {
                        ShowError(10);
                        return [isDoing, ""];
                    }
                    if (varsInFunctionDict[listName].length <= valueIndex || valueIndex < 0) {
                        ShowError(11);
                        return [isDoing, ""];
                    }
                    if (listIndex < 0) {
                        ShowError(1);
                        return [isDoing, ""];
                    }
                    isDoing = true;
                    resultText = varsInFunctionDict[listName][valueIndex];
                    break;
                } else if (listName in varsInFunctionDict) {
                    if (varsInFunctionType[listName] != "LIST" && varsInFunctionType[listName] != "CLASS_LIST") {
                        ShowError(10);
                        return [isDoing, ""];
                    }
                    if (varsInFunctionDict[listName].length <= valueIndex || valueIndex < 0) {
                        ShowError(11);
                        return [isDoing, ""];
                    }
                    isDoing = true;
                    resultText = varsInFunctionDict[listName][valueIndex];
                    break;
                }
            }
            if (!(listName in varsDict)) {
                ShowError(1);
                return [isDoing, ""];
            }
            if (varsType[listName] != "LIST" && varsType[listName] != "CLASS_LIST") {
                ShowError(10);
                return [isDoing, ""];
            }
            if (varsDict[listName].length <= valueIndex || valueIndex < 0) {
                ShowError(11);
                return [isDoing, ""];
            }
            isDoing = true;
            resultText = varsDict[listName][valueIndex];
            break;
        case "LENGTH":
            var listName = resultText.slice(7, -1);
            isDoing = true;
            if (nowBraclet["function"] != "") {
                
                if (functionDict[nowBraclet["function"]].varsname.indexOf(listName) >= 0) {
                    
                    var varIndex = functionDict[nowBraclet["function"]].varsname.indexOf(listName);
                    if (varIndex < 0) {
                        ShowError(1);
                        return [isDoing, ""];
                    }
                    if (varsInFunctionType[nowBraclet["function"]][varIndex] != "LIST" && varsInFunctionType[nowBraclet["function"]][varIndex] != "CLASS_LIST") {
                        ShowError(3);
                        return [isDoing, ""];
                    }
                    isDoing = true;
                    resultText = functionDict[nowBraclet["function"]].varsValue[varIndex].length;
                    break;
                } else if (listName in varsInFunctionDict) {
                    if (varsInFunctionType[nowBraclet["function"]][varsInFunctionType[nowBraclet["function"]].indexOf(listName)] != "LIST" && varsInFunctionType[nowBraclet["function"]][varsInFunctionType[nowBraclet["function"]].indexOf(listName)] != "CLASS_LIST") {
                        ShowError(3);
                        return [isDoing, ""];
                    }
                    isDoing = true;
                    resultText = varsInFunctionDict[listName].length;
                    break;
                }
            }
            if (!(listName in varsDict)) {
                ShowError(1);
                return [isDoing, ""];
            } else {
                isDoing = true;
            }
            resultText = varsDict[listName].length;

            break;
        case "CHANGE":
            var changeListInfo = resultText.slice(7, -1);
            if (changeListInfo.split(",").length < 3) {
                ShowError(6);
                return [isDoing, ""];
            }
            var listName = changeListInfo.split(",")[0];
            var changeListIndex = changeListInfo.split(",")[1];
            var newValue = changeListInfo.split(",")[2];
            if (!(listName in varsDict)) {
                ShowError(1);
                return [isDoing, ""];
            }
            if (isNaN(Number(changeListIndex))) {
                ShowError(3);
                return [isDoing, ""];
            }

            if (varsDict[listName].length <= Number(changeListIndex)) {
                ShowError(11);
                return [isDoing, ""];
            }
            isDoing = true;

            varsDict[listName][Number(changeListIndex)] = newValue;
            resultText = "";
            break;
        case "NEWLIST":
            var newListInfo = resultText.slice(8, -1);
            if (newListInfo.split(",").length < 2) {
                ShowError(6);
                return [isDoing, ""];
            }
            var listName = newListInfo.split(",")[0];
            var newValue = newListInfo.split(",")[1];
            if (!(listName in varsDict)) {
                ShowError(1);
                return [isDoing, ""];
            }
            isDoing = true;

            varsDict[listName].push(newValue);
            resultText = "";
            break;
        case "DELETE":
            var deleteListInfo = resultText.slice(7, -1);
            if (deleteListInfo.split(",").length < 2) {
                ShowError(6);
                return [isDoing, ""];
            }
            var listName = deleteListInfo.split(",")[0];
            var changeListIndex = deleteListInfo.split(",")[1];
            if (!(listName in varsDict)) {
                ShowError(1);
                return [isDoing, ""];
            }
            if (isNaN(Number(changeListIndex))) {
                ShowError(3);
                return [isDoing, ""];
            }

            if (varsDict[listName].length <= Number(changeListIndex)) {
                ShowError(11);
                return [isDoing, ""];
            }
            isDoing = true;

            varsDict[listName].splice(Number(changeListIndex), 1);
            resultText = "";
            break;
        case "CHANGE_CLASS_LIST":
            var changeListInfo = resultText.slice(18, -1);
            if (changeListInfo.split(",").length < 3) {
                ShowError(6);
                return [isDoing, ""];
            }
            var listName = changeListInfo.split(",")[0];
            var changeListIndex = changeListInfo.split(",")[1];
            var newValue = changeListInfo.split(",")[2];
            if (!(listName in varsDict)) {
                ShowError(3);
                return [isDoing, ""];
            }

            if (varsDict[listName].length <= Number(changeListIndex)) {
                ShowError(11);
                return [isDoing, ""];
            }
            isDoing = true;

            varsDict[listName][Number(changeListIndex)] = newValue;
            resultText = "";
            break;
        case "NEW_CLASS_LIST":
            var newListInfo = resultText.slice(15, -1);
            if (newListInfo.split(",").length < 2) {
                ShowError(6);
                return [isDoing, ""];
            }
            var listName = newListInfo.split(",")[0];
            var newValue = newListInfo.split(",")[1];
            if (!(listName in varsDict)) {
                ShowError(1);
                return [isDoing, ""];
            }
            isDoing = true;
            
            varsDict[listName].push(newValue);
            resultText = "";
            break;
        case "DELETE_CLASS":
            var deleteListInfo = resultText.slice(13, -1);
            if (deleteListInfo.split(",").length < 2) {
                ShowError(6);
                return [isDoing, ""];
            }
            var listName = deleteListInfo.split(",")[0];
            var changeListIndex = deleteListInfo.split(",")[1];
            if (!(listName in varsDict)) {
                ShowError(1);
                return [isDoing, ""];
            }
            if  (isNaN(Number(changeListIndex))) {
                ShowError(3);
                return [isDoing, ""];
            }

            if (varsDict[listName].length <= Number(changeListIndex)) {
                ShowError(11);
                return [isDoing, ""];
            }
            isDoing = true;

            varsDict[listName].splice(Number(changeListIndex), 1);
            resultText = "";
            break;
        case "GET_CLASS_VAR":
            var classVarInfo = resultText.slice(14, -1);
            if (classVarInfo.split(",").length != 2) {
                ShowError(6);
                return [isDoing, ""];
            }
            var gettingClassName = classVarInfo.split(",")[0];
            var gettingClassVarName = classVarInfo.split(",")[1];
            if (!(gettingClassName in classDict)) {
                ShowError(1);
                return [isDoing, ""];
            }
            if (!(gettingClassVarName in classDict[gettingClassName]["vars"])) {
                ShowError(21);
                return [isDoing, ""];
            }
            isDoing = true;
            resultText = classDict[gettingClassName]["vars"][gettingClassVarName];
            break;
        case "GAME_SIZE":
            var tIndex = resultText.indexOf(",");
            var xLength = resultText.slice(10, tIndex);
            var yLength = resultText.slice(tIndex + 1, -1);

            if (isNaN(Number(xLength)) || isNaN(Number(yLength))) {
                ShowError(3);
                return [isDoing, ""];
            }
            if (showCanvas == null) {
                ShowError(13);
                return [isDoing, ""];
            }
            isDoing = true;
            showCanvas.width = xLength;
            showCanvas.height = yLength;
            resultText = "";
            break;
        case "GAME_CREATE_RECT":
            var rectInfo = resultText.slice(17, -1).split(",");
            if (rectInfo.length < 8) {
                ShowError(6);
                return [isDoing, ""];
            }
            var posX = rectInfo[0];
            var posY = rectInfo[1];
            var sizeX = rectInfo[2];
            var sizeY = rectInfo[3];
            var r = rectInfo[4];
            var g = rectInfo[5];
            var b = rectInfo[6];
            var a = rectInfo[7];
            if (isNaN(Number(posX) + Number(posY) + Number(sizeX) + Number(sizeY) + Number(r) + Number(g) + Number(b) + Number(a))) {
                ShowError(3);
                return [isDoing, ""];
            }
            isDoing = true;
            showCanvas.getContext("2d").fillStyle = "rgba(" + Math.floor(r) + ", " + Math.floor(g) + ", " + Math.floor(b) + ", " + a + ")";
            showCanvas.getContext("2d").fillRect(posX - sizeX / 2, posY - sizeY / 2, sizeX, sizeY);
            resultText = "";
            break;
        case "GAME_CREATE_CIRCLE":
            var circleInfo = resultText.slice(19, -1).split(",");
            if (circleInfo.length < 7) {
                ShowError(6);
                return [isDoing, ""];
            }
            var posX = circleInfo[0];
            var posY = circleInfo[1];
            var radius = circleInfo[2];
            var r = circleInfo[3];
            var g = circleInfo[4];
            var b = circleInfo[5];
            var a = circleInfo[6];
            if (isNaN(Number(posX) + Number(posY) + Number(radius) + Number(r) + Number(g) + Number(b) + Number(a))) {
                ShowError(3);
                return [isDoing, ""];
            }
            isDoing = true;
            showCanvas.getContext("2d").fillStyle = "rgba(" + Math.floor(r) + ", " + Math.floor(g) + ", " + Math.floor(b) + ", " + a + ")";
            showCanvas.getContext("2d").strokeStyle = "rgba(" + Math.floor(r) + ", " + Math.floor(g) + ", " + Math.floor(b) + ", " + a + ")";
            showCanvas.getContext("2d").beginPath();
            showCanvas.getContext("2d").arc(posX, posY, radius, 0, 360 * Math.PI / 180, false);
            showCanvas.getContext("2d").fill();
            showCanvas.getContext("2d").stroke();
            resultText = "";
            break;
        case "GAME_DRAW_IMAGE":
            if (usingModules.indexOf("GAME") < 0 || usingModules.indexOf("FILE") < 0) {
                ShowError(22);
                return [isDoing, ""];
            }
            var drawImageInfo = resultText.slice(16, -1).split(",");
            if (drawImageInfo.length < 5) {
                ShowError(6);
                return [isDoing, ""];
            }
            var imgName = drawImageInfo[0];
            var posX = drawImageInfo[1];
            var posY = drawImageInfo[2];
            var sizeX = drawImageInfo[3];
            var sizeY = drawImageInfo[4];
            var rotation = 0;

            if (isNaN(Number(posX) + Number(posY) + Number(sizeX) + Number(sizeY))) {
                ShowError(3);
                return [isDoing, ""];
            }
            if (!imgName in imgFiles) {
                ShowError(1);
                return [isDoing, ""];
            }

            if (drawImageInfo.length == 6) {
                rotation = drawImageInfo[5];
                if (isNaN(Number(rotation))) {
                    ShowError(3);
                    return [isDoing, ""];
                }
            }
            isDoing = true;
            if (drawImageInfo.length < 6) {
                showCanvas.getContext("2d").drawImage(imgFiles[imgName], posX - sizeX / 2, posY - sizeY / 2, sizeX, sizeY);
            } else {
                showCanvas.getContext("2d").save();
                showCanvas.getContext("2d").translate(posX, posY);
                showCanvas.getContext("2d").rotate(rotation * Math.PI / 180);
                showCanvas.getContext("2d").drawImage(imgFiles[imgName], sizeX / -2, sizeY / -2, sizeX, sizeY)
                showCanvas.getContext("2d").restore();
            }
            
            resultText = "";
            break;
        case "GAME_WRITE":
            if (usingModules.indexOf("GAME") < 0) {
                ShowError(22);
                return [isDoing, ""];
            }
            var writeInfo = resultText.slice(11, -1).split(",");
            if (writeInfo.length < 8) {
                ShowError(6);
                return [isDoing, ""];
            }
            var writeText = writeInfo[0];
            var posX = writeInfo[1];
            var posY = writeInfo[2];
            var fontSize = writeInfo[3];
            var r = writeInfo[4];
            var g = writeInfo[5];
            var b = writeInfo[6];
            var a = writeInfo[7];
            if (isNaN(Number(posX) + Number(posY) + Number(fontSize) + Number(r) + Number(g) + Number(b) + Number(a))) {
                ShowError(3);
                return [isDoing, ""];
            }
            isDoing = true;
            showCanvas.getContext("2d").fillStyle = "rgba(" + Math.floor(r) + ", " + Math.floor(g) + ", " + Math.floor(b) + ", " + a + ")";
            showCanvas.getContext("2d").font = "normal normal " + fontSize + "px sans-serif";
            showCanvas.getContext("2d").textAlign = "center";
            showCanvas.getContext("2d").textBaseline = "middle";
            showCanvas.getContext("2d").fillText(writeText, posX, posY);
            resultText = "";
            break;
        case "GAME_MOUSE_X":
            if (usingModules.indexOf("GAME") < 0) {
                ShowError(22);
                return [isDoing, ""];
            }
            isDoing = true;
            resultText = mouseX;
            break;
        case "GAME_MOUSE_Y":
            if (usingModules.indexOf("GAME") < 0) {
                ShowError(22);
                return [isDoing, ""];
            }
            isDoing = true;
            resultText = mouseY;
            break;
        case "SET_FPS":
            var newFps = resultText.slice(8, -1);
            if (isNaN(Number(newFps))) {
                ShowError(3);
                return [isDoing, ""];
            }
            isDoing = true;
            fps = newFps;
            resultText = "";
            break;
        case "GAME_FPS":
            var newFps = resultText.slice(9, -1);
            if (isNaN(Number(newFps))) {
                ShowError(3);
                return [isDoing, ""];
            }
            isDoing = true;
            gameFps = newFps;
            resultText = "";
            break;
        case "MATH_RANDOM":
            var tIndex = resultText.indexOf(",");
            var minX = resultText.slice(12, tIndex);
            var maxX = resultText.slice(tIndex + 1, -1);

            if (isNaN(Number(minX) + Number(maxX))) {
                ShowError(3);
                return [isDoing, ""];
            }
            if (Number(minX) > Number(maxX)) {
                ShowError(15);
                return [isDoing, ""];
            }
            isDoing = true;
            resultText = Math.floor(Math.random() * (maxX - minX + 1)) + Number(minX);
            break;
        case "MATH_ABS":
            var num = resultText.slice(9, -1);
            if (isNaN(Number(num))) {
                ShowError(3);
                return [isDoing, ""];
            }

            isDoing = true;
            resultText = Math.abs(num);
            break;
        case "IMAGE_WIDTH":
            if (usingModules.indexOf("FILE") < 0) {
                ShowError(22);
                return [isDoing, ""];
            }
            var nowImageInfo = resultText.slice(12, -1);
            if (!(nowImageInfo in imgFilesInfo)) {
                ShowError(1);
                return [isDoing, ""];
            }
            isDoing = true;
            resultText = imgFilesInfo[nowImageInfo][0];
            break;
        case "IMAGE_HEIGHT":
            if (usingModules.indexOf("FILE") < 0) {
                ShowError(22);
                return [isDoing, ""];
            }
            var nowImageInfo = resultText.slice(13, -1);
            if (!(nowImageInfo in imgFilesInfo)) {
                ShowError(1);
                return [isDoing, ""];
            }
            isDoing = true;
            resultText = imgFilesInfo[nowImageInfo][1];
            break;
        default:
            return [false, ""];
    }

    return [isDoing, resultText];
}

// 에러 출력
function ShowError(errorNum) {
    output.replaceChildren();
    stopHandler();
    switch (errorNum) {
        case 1:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 존재하지 않거나 선언되지 않은 변수가 있습니다.");
            break;
        case 2:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 계산할 수 없습니다.");
            break;
        case 3:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 잘못된 자료형이 들어가 있습니다.");
            break;
        case 4:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 이미 장의된 함수가 다시 정의될 수 없습니다.");
            break;
        case 5:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 없는 함수 이름입니다.");
            break;
        case 6:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 함수 매개변수의 개수가 잘못되었습니다.");
            break;
        case 7:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 필요한 값이 입력되지 않았습니다.");
            break;
        case 8:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 없는 명령어입니다.");
            break;
        case 9:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 리스트의 값은 대괄호로 감싸져 있어야 합니다.");
            break;
        case 10:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 리스트가 아닙니다.");
            break;
        case 11:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 리스트의 해당 인덱스에는 값이 존재하지 않습니다.");
            break;
        case 12:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 존재하지 않는 모듈입니다.");
            break;
        case 13:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 스크린이 존재하지 않습니다.");
            break;
        case 14:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 해당 키보드 버튼에 해당하는 문자가 존재하지 않습니다.");
            break;
        case 15:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 함수 매개변수의 값이 올바르지 않습니다.");
            break;
        case 16:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 이미 있는 클래스 이름입니다.");
            break;
        case 17:
            alert((nowLine + 1) + "번쨰 줄에서 오류 발생 : 클래스 내부에는 우선적으로 DEFAULT 함수가 필요합니다.");
            break;
        case 18:
            alert((nowLine + 1) + "번째 줄에서 오류 발생 : 클래스 변수 이름은 이미 있는 변수 이름이 될 수 없습니다.");
            break;
        case 19:
            alert((nowLine + 1) + "번째 줄에서 오류 발생 : 클래스를 불러올 때에는 소괄호가 필요합니다.");
            break;
        case 20:
            alert((nowLine + 1) + "번째 줄에서 오류 발생 : 없는 클래스 이름입니다.");
            break;
        case 21:
            alert((nowLine + 1) + "번째 줄에서 오류 발생 : 해당 클래스 변수에 해당하는 값이 없습니다.");
            break;
        case 22:
            alert((nowLine + 1) + "번째 줄에서 오류 발생 : 필요한 모듈이 불러와지지 않았습니다.");
            break;
        case 23:
            alert((nowLine + 1) + "번째 줄에서 오류 발생 : 해당 이름의 파일이 존재하지 않습니다.");
            break;
    }
    
}
