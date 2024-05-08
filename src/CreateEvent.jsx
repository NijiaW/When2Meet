import { useState, useEffect} from 'react';
import {myFetch} from "./services.js"
import DatePickerTable from './DatePickerTable';
import './App.css';
import InitialTime from './InitialTime.jsx';
import FinishTime from './FinishTime.jsx';
import SelectTimeZone from './SelectTimeZone.jsx';
function CreateEvent({props}){
   
    const [initialTime, setInitialTime] = useState(9);
    const [finishTime, setFinishTime] = useState(17);
    const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [selectedDates, setSelectedDates] = useState(new Set());
    const [allDates, setAllDates] = useState('');


    const eventTime = {
        initialTime, setInitialTime,
        finishTime, setFinishTime,
        timeZone, setTimeZone,
        selectedDates, setSelectedDates,
        setAllDates,
    };

    function addParamsToUrl(newParams, hash="") {
        const url = new URL(window.location);
        console.log("url", url.toString());
        Object.keys(newParams).forEach(key => url.searchParams.set(key, newParams[key]));
        url.hash = hash;
        window.history.pushState(null, '', url);
    }

    function compute_available_time(initialTime, finishTime, allDates, selectedDates){
        console.log("initialTime", initialTime);
        console.log("finishTime", finishTime);
        console.log("allDates", allDates);
        console.log("selectedDates", selectedDates);

        const timeData = {};
        timeData["allDates"] = allDates;
        timeData["availability"] = [];
        timeData["availability_count"] = 0;
        for (let i = 0; i < allDates.length; ++i) {
            const cur_date = allDates[i].utcDate;
            if (selectedDates.has(cur_date)){
                for (let j = 0; j < 48; ++j){
                    if (j < initialTime * 2 || j >= finishTime * 2){
                        timeData["availability"].push(0);
                    }
                    else {
                        timeData["availability"].push(1);
                        timeData["availability_count"] += 1;
                    }
                    
                }
            }
            else{
                for (let j = 0; j < 48; ++j){
                    timeData["availability"].push(0);
                }
            }
        }
        console.log("timeData", timeData);
        return timeData;
    }

    const onSubmit = (e) =>{
        e.preventDefault();

        const timeData = compute_available_time(initialTime, finishTime, allDates, selectedDates);

        const payload = {
            eventTitle: props.eventTitle, 
            time: timeData
        };
        console.log("POST onSubmit payload", payload);
        myFetch('/api/create_event', "POST", payload)
        .then( res => {
            console.log("post event res", res);
            props.setEventId(res.event.eventId);
            addParamsToUrl({eventId: res.event.eventId}, "#join_event_page");
            props.setPage("#join_event_page");
        })
        .catch( err => {
            console.log("autologin err", err);
            props.handle_error(err);
        });

    }
    const onEventTitle = (e) =>{
        e.preventDefault();
        
        props.setEventTitle(e.target.value);
    }

    const returnHome = (e) =>{
        e.preventDefault();
        window.history.pushState(null, '', "#home_page");
        props.setPage("#home_page");
    }

    useEffect(
        () => {
            props.setEventTitle("");
            return () => {};
        },
        [],
    );

    return(
        <div className='app_wrapper'>
            <header className="header">
                <div className='logo_panel'>
                    <a id="logo_link" href="#/" className='header__logo' onClick={returnHome}>
                    <img src="quokka.jpg" alt="a Quokka logo" className='header__logo__img'/>
                    </a> 
                    <button className="return_home_button" type="button" onClick={returnHome}> Home Page</button>
                </div>
                <h1 className='web_name'>When2Meet</h1>
            </header>

            <div className="create_event-page">
                
                <h2>Create a New Event</h2>
                <form className="create_event_form" action="#/join_event_page" onSubmit={onSubmit}>
                    <div>
                        <label>
                            <span>Event Title:</span>
                            <input className="event_title" value={props.eventTitle} onChange={onEventTitle}/>
                        </label>
                    </div>
                    <div className='pick_time_range'>
                        <InitialTime props={eventTime}/>
                        <FinishTime props={eventTime}/>                    
                    </div>
                    <div>
                        <SelectTimeZone props={eventTime}/>
                    </div>
                    {props.error && <p className="error">{props.error}</p>}
                    <button className="create_event_button" type="submit"> Create Event</button>
                </form>
                <div className="date-picker-container">

                <DatePickerTable props={eventTime}/>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;