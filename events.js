const uuid = require('uuid').v4;
const eventData = {};
function isValidEvent(eventTitle) {
    let isValid = true;
    isValid = isValid && eventTitle.trim();
    isValid = isValid && eventTitle.trim().match(/^[A-Za-z0-9_]+$/);
    return isValid;
}
function isValidUsername(username) {
    let isValid = true;
    isValid = isValid && username.trim();
    isValid = isValid && username.trim().match(/^[A-Za-z0-9_]+$/);
    return isValid;
}
function isValidTime(start, end){
    let isValid = true;
    const startTime = parseFloat(start);
    const endTime = parseFloat(end);
    if (isNaN(startTime) || isNaN(endTime)) {
        return false; 
    }
    isValid = isValid && (startTime < endTime);
    return isValid;
}
function isValidDate(selectDates){
    return selectDates.size > 0;
}

function generateShortId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 5);
    return timestamp + random;
}

function addEvent(eventTitle, time){
    let id = generateShortId();
    while (id in eventData) {
        id = generateShortId();
    }
    eventData[id] = {
        eventId: id, 
        eventTitle: eventTitle,
        eventTime: time, 
        participant: {}, 
    }
    return eventData[id];
}
function findEventId(eventId){
    if(eventId in eventData){
        return eventData[eventId];
    }
    else {
        return undefined;
    }
}
function addParticipant(eventId, username, time){
    if (!eventId) return undefined;
    if(eventId in eventData){
        eventData[eventId].participant[username] = time;
        return eventData[eventId];
    }else{
        return undefined;
    }
}

module.exports = {
    isValidUsername,
    isValidEvent,
    isValidTime,
    eventData,
    addEvent,
    findEventId,
    addParticipant,
    isValidDate,
};


