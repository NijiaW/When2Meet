import { useState, useEffect, useRef} from 'react';
import {myFetch} from "./services.js"
import Login from './Login';
import ModifyEvent from './ModifyEvent';
import './App.css';
import moment from "moment-timezone";
import Selecto from "react-selecto";
import SelectTimeZone from './SelectTimeZone';

const dayHours = [
    [0, '12:00 am'],
    [1, '01:00 am'],
    [2, '02:00 am'],
    [3, '03:00 am'],
    [4, '04:00 am'],
    [5, '05:00 am'],
    [6, '06:00 am'],
    [7, '07:00 am'],
    [8, '08:00 am'],
    [9, '09:00 am'],
    [10, '10:00 am'],
    [11, '11:00 am'],
    [12, '12:00 pm'],
    [13, '01:00 pm'],
    [14, '02:00 pm'],
    [15, '03:00 pm'],
    [16, '04:00 pm'],
    [17, '05:00 pm'],
    [18, '06:00 pm'],
    [19, '07:00 pm'],
    [20, '08:00 pm'],
    [21, '09:00 pm'],
    [22, '10:00 pm'],
    [23, '11:00 pm'],
  ];

function EventView({props}){
   
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [eventTable, setEventTable] = useState([]);
    const [selectedDates, setSelectedDates] = useState(new Set());
    const [availableDates, setAvailableDates] = useState([]);
    const [groupTable, setGroupTable] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);

    const localtime_n_days = 37; 
    const n_time_slots_per_day = 48;
    const time_slot_length = 1800000;

    const [event, setEvent] = useState({
        eventID: "",
        eventTitle: "",
        eventTime: {},
        participant: {},
    });

    function pullEventData(){
        console.log("pull event data");
        const payload = {
            eventId: props.eventId,
        };
        props.setIsLoading(true);
        myFetch('/api/event_pull', "POST", payload)
        .then( res => {
        console.log("GET res ok: ", res);
        setEvent(res.event);
        props.setError('');
        props.setIsLoading(false);
        })
        .catch( err => {
            console.log("/api/event_pull POST ERROR ", err);
            window.history.pushState(null, '', "#page_not_found");
            props.setPage("#page_not_found");
            props.setIsLoading(false);
            props.handle_error(err);
            props.setError('');
            
        });
    }
    useEffect(
        () => {
            pullEventData();
            const intervalId = setInterval(pullEventData, 10000);
            return () => clearInterval(intervalId);
            },
        [],
    );

    useEffect(
        () => {
            if (!isLogin) return;
            pullEventData();
            return () => {};
            },
        [isLogin],
    );

    function generate_available_dates(event){
        const startDateStr = event.eventTime.allDates[0].utcDate;
        const baseDate = new Date(startDateStr);
        console.log("baseDate", baseDate);
    
        const startDate = new Date(startDateStr);
        startDate.setDate(startDate.getDate() - 1);
    
        const available_dates = [];
    
        for (let i = 0; i < localtime_n_days; ++i) {
            const dateString = startDate.toISOString().split('T')[0];
    
            const newDate = moment.tz(dateString, timeZone).startOf('day').toDate();
    
            const diff = Math.round((newDate.getTime() - baseDate.getTime()) / (time_slot_length));
            
            const day_data = {}
            day_data['date'] = dateString;
            day_data['start_index'] = diff;
            let sum = 0;
            for (let j = 0; j < n_time_slots_per_day; ++j) {
                const idx = diff + j;
                let flag = 0;
                if (idx >= 0 && idx < event.eventTime.availability.length) {
                    flag = event.eventTime.availability[idx];
                }
                day_data[j] = flag;
                sum += flag;
            }
            if (sum > 0){
                available_dates.push(day_data);
            }
            startDate.setDate(startDate.getDate() + 1);
        }
        
        //remove impossible time slots 
        for (let j = 0; j < n_time_slots_per_day; ++j) {
            let sum = 0;
            for (let i = 0; i < available_dates.length; ++i) {
                sum += available_dates[i][j];
            }
            if (sum === 0) {
                for (let i = 0; i < available_dates.length; ++i) {
                    delete available_dates[i][j];
                } 
            }
        }
        console.log("available_dates", available_dates);
        return available_dates;
    }

    function generateTable(available_dates){
        //compute date gap
        const gap_left_dict = {};
        for (let j = 0; j < available_dates.length; ++ j){
            let gap_left = "";
            if (j > 0){
                // check if the previous date is next to this one.
                // if not put some gap there.
                const prevDate = new Date(available_dates[j - 1].date);
                const curDate = new Date(available_dates[j].date);
                prevDate.setDate(prevDate.getDate() + 1);
                if (prevDate.getTime() != curDate.getTime()){
                    gap_left = "gap_left";
                }
            }
            gap_left_dict[j] = gap_left;
        }
        //compute time gap
        const gap_top_dict = {};
        let prev_time_slot = -1;
        for (let i = 0; i < n_time_slots_per_day; ++i){
            if (i in available_dates[0]){
                // check if the previous time slot is next to this one.
                let gap_top = "";
                if (prev_time_slot != -1 && prev_time_slot + 1 != i){
                    gap_top = "gap_top";
                }
                prev_time_slot = i;
                gap_top_dict[i] = gap_top;
            }
        }
    
        
    
        const all_elements = [];
        let key_idx = 0;
        
        const header_row1 = [];
        header_row1.push(<th key={key_idx++}> <span className='event_padding' ></span></th>);
        for (let i = 0; i < available_dates.length; ++ i){
            header_row1.push(
            <th  key={key_idx++}>
                <span className={`event_date ${gap_left_dict[i]}`}>
                {
                    new Date(available_dates[i].date).toLocaleDateString('en-US', {
                        month: 'short', 
                        day: 'numeric' 
                    })
                }
                </span>
            </th>);
        }
        
        const header_row2 = [];
        header_row2.push(<th key={key_idx++}><span className='event_padding'> </span></th>);
    
        for (let i = 0; i < available_dates.length; ++ i){
            header_row2.push(
            <th key={key_idx++}>
                <span className={`event_day ${gap_left_dict[i]}`}>
                {
                    new Date(available_dates[i].date).toLocaleDateString('en-US', {
                        weekday: 'short'
                    })
                }
                </span>
            </th>);
        }

        all_elements.push(<thead key={key_idx++}>
            <tr key={key_idx++}>{header_row1}</tr>
            <tr key={key_idx++}>{header_row2}</tr>
        </thead>);
        
        const body_elements = [];
        for (let i = 0; i < n_time_slots_per_day; ++i){
            if (i in available_dates[0]){
                // check if the previous time slot is next to this one.
                let gap_top = gap_top_dict[i];
                let slot_type = 'first_half_hour';
                let time_slot_name = dayHours[Math.floor(i / 2)][1];
                if (i % 2 == 1){
                    slot_type = 'second_half_hour'
                    time_slot_name = "";
                }
                const row_jsx = [];
                
                row_jsx.push(<td key={key_idx++}><span className={`event_padding ${gap_top}`}>{time_slot_name}</span></td>);
                for (let j = 0; j < available_dates.length; ++ j){
                    let gap_left = gap_left_dict[j];
                    const data_key = ([j, i]).toString();
                    if (available_dates[j][i] == 1){
                        if (selectedDates.has(data_key)) {
                            row_jsx.push(
                            <td key={key_idx++}>
                                 <span className={`event_time_slot selected_slot ${slot_type} ${gap_left} ${gap_top}`} data-key={data_key}></span>
                                 </td>);
                        }
                        else{
                            row_jsx.push(
                                <td key={key_idx++}>
                                     <span className={`event_time_slot available_slot ${slot_type} ${gap_left} ${gap_top}`} data-key={data_key}></span>
                                     </td>);
                        }
                    }
                    else {
                        row_jsx.push(
                            <td key={key_idx++}>
                                 <span className={`event_time_slot non_available_slot ${slot_type} ${gap_left} ${gap_top}`} data-key={data_key}></span>
                                 </td>);
                    }
                }
                body_elements.push(<tr key={key_idx++}>{row_jsx}</tr>);
            }
        }

        all_elements.push(<tbody key={key_idx++}>
            {body_elements}
        </tbody>);
        return all_elements;
    }
    function handleClickGroupTimeSlot(data_key) {
        if (availableDates.length === 0|| event.eventTitle === "") return;
        let indices = data_key.split(",");
        let x = parseInt(indices[0]);
        let y = parseInt(indices[1]);
        const idx = availableDates[x].start_index + y;
        const available_users = [];
        
        for (const user in event.participant){
            const array = event.participant[user];
            if (idx >= 0 && idx < array.length && array[idx] === 1) {
                available_users.push(user);
            }
        }
        console.log("available_users", available_users);
        setAvailableUsers(available_users);
    }

    function generateGroupTable(available_dates, participant){
        //compute date gap
        const gap_left_dict = {};
        for (let j = 0; j < available_dates.length; ++ j){
            let gap_left = "";
            if (j > 0){
                // check if the previous date is next to this one.
                // if not put some gap there.
                const prevDate = new Date(available_dates[j - 1].date);
                const curDate = new Date(available_dates[j].date);
                prevDate.setDate(prevDate.getDate() + 1);
                if (prevDate.getTime() != curDate.getTime()){
                    gap_left = "gap_left";
                }
            }
            gap_left_dict[j] = gap_left;
        }
        //compute time gap
        const gap_top_dict = {};
        let prev_time_slot = -1;
        for (let i = 0; i < n_time_slots_per_day; ++i){
            if (i in available_dates[0]){
                // check if the previous time slot is next to this one.
                let gap_top = "";
                if (prev_time_slot != -1 && prev_time_slot + 1 != i){
                    gap_top = "gap_top";
                }
                prev_time_slot = i;
                gap_top_dict[i] = gap_top;
            }
        }
     
        const all_elements = [];
        let key_idx = 0;
        
        const header_row1 = [];
        header_row1.push(<th key={key_idx++}> <span className='event_padding' ></span></th>);
        for (let i = 0; i < available_dates.length; ++ i){
            header_row1.push(
            <th  key={key_idx++}>
                <span className={`event_date ${gap_left_dict[i]}`}>
                {
                    new Date(available_dates[i].date).toLocaleDateString('en-US', {
                        month: 'short', 
                        day: 'numeric' 
                    })
                }
                </span>
            </th>);
        }
        
        const header_row2 = [];
        header_row2.push(<th key={key_idx++}><span className='event_padding'> </span></th>);
    
        for (let i = 0; i < available_dates.length; ++ i){
            header_row2.push(
            <th key={key_idx++}>
                <span className={`event_day ${gap_left_dict[i]}`}>
                {
                    new Date(available_dates[i].date).toLocaleDateString('en-US', {
                        weekday: 'short'
                    })
                }
                </span>
            </th>);
        }

        all_elements.push(<thead key={key_idx++}>
            <tr key={key_idx++}>{header_row1}</tr>
            <tr key={key_idx++}>{header_row2}</tr>
        </thead>);
        
        const body_elements = [];
        const n_people = Object.entries(participant).length;

        for (let i = 0; i < n_time_slots_per_day; ++i){
            if (i in available_dates[0]){
                // check if the previous time slot is next to this one.
                let gap_top = gap_top_dict[i];
                let slot_type = 'first_half_hour';
                let time_slot_name = dayHours[Math.floor(i / 2)][1];
                if (i % 2 == 1){
                    slot_type = 'second_half_hour'
                    time_slot_name = "";
                }
                const row_jsx = [];
                
                row_jsx.push(<td key={key_idx++}><span className={`event_padding ${gap_top}`}>{time_slot_name}</span></td>);
                for (let j = 0; j < available_dates.length; ++ j){
                    let gap_left = gap_left_dict[j];
                    const data_key = ([j, i]).toString();

                    if (available_dates[j][i] == 1){
                        const idx = available_dates[j].start_index + i;
                        let count = 0;
                        if (n_people > 0) {
                            for (const user in participant){
                                const array = participant[user];
                                if (idx >= 0 && idx < array.length) {
                                    count += array[idx];
                                }
                            }
                        }

                        if (count > 0) {
                            const color_lvl = Math.round(count * 10 / n_people);
                            row_jsx.push(
                            <td key={key_idx++}>
                                 <span 
                                 onMouseEnter={ () => {
                                    handleClickGroupTimeSlot(data_key);
                                }} 
                                 onMouseLeave={() => {
                                    setAvailableUsers([]);
                                 }} 
                                 className={`event_time_slot selected_slot color-${color_lvl}  ${slot_type} ${gap_left} ${gap_top}`} data-key={data_key} onClick={
                                    () => {
                                        handleClickGroupTimeSlot(data_key);
                                    }
                                    }
                                    
                                    >
                                    {count}
                                 </span>
                                 </td>);
                        }
                        else{
                            row_jsx.push(
                                <td key={key_idx++}>
                                     <span className={`event_time_slot available_slot ${slot_type} ${gap_left} ${gap_top}`} data-key={data_key} >
                                     </span>
                                     </td>);
                        }
                    }
                    else {
                        row_jsx.push(
                            <td key={key_idx++}>
                                 <span className={`event_time_slot non_available_slot ${slot_type} ${gap_left} ${gap_top}`} data-key={data_key}>
                                
                                 </span>
                                 </td>);
                    }
                }
                body_elements.push(<tr key={key_idx++}>{row_jsx}</tr>);
            }
        }

        all_elements.push(<tbody key={key_idx++}>
            {body_elements}
        </tbody>);
        return all_elements;
    }

    function update_event_availability(){
        
        const array = [];
        for (let i = 0; i < event.eventTime.availability.length; ++i){
            array.push(0);
        }
        for (const data_key of selectedDates) {
            let indices = data_key.split(",");
            let x = parseInt(indices[0]);
            let y = parseInt(indices[1]);
            console.log("x, y", x , y);
            const idx = availableDates[x].start_index + y;
            if (idx >= 0 && idx < array.length) {
                array[idx] = 1;
            }
        }
        
        const payload = {
            eventId: event.eventId, 
            username: username,
            time: array,
        };
        myFetch('/api/event_modify',"PUT", payload)
        .then(res => {
            console.log("addDate res: ", res);
            setEvent(res.event);
        })
        .catch(err =>{
            console.error('addDate PUT err:', err);
            props.handle_error(err);
        });
    }
    
    useEffect(
        () => {
            if (event.eventTitle === "") return;
            const available_dates = generate_available_dates(event);
           
            const newSet = new Set();
            //process previous selected dates;
            if (isLogin && username in event.participant){
                const array = event.participant[username];

                for (let i = 0; i < available_dates.length; ++i) {
                    for (let j = 0; j < 48; ++ j) {
                        if (j in available_dates[i]){
                            const idx = available_dates[i].start_index + j;
                            if (idx >= 0 && idx < array.length && array[idx] === 1) {
                                newSet.add(([i, j]).toString());
                            }
                        }
                    }
                }
            }

            setAvailableDates(available_dates);
            setSelectedDates(newSet);
            
            return () => {};
        },
        [event, timeZone],
    );
    
    useEffect(
        () => {
            if (event.eventTitle === "" || availableDates.length === 0) return;
            
            console.log("generateGroupTable availableDates", availableDates);
            const all_elements = generateGroupTable(availableDates, event.participant);
            console.log("set new group elements");
            setGroupTable(<table>{all_elements}</table>);

            return () => {};
        },
        [availableDates],
    );

    useEffect(
        () => {
            if (event.eventTitle === "" || availableDates.length === 0 ) return;
            
            console.log("generateTable availableDates", availableDates);
            const all_elements = generateTable(availableDates);
            console.log("set new table elements");
            setEventTable(<table>{all_elements}</table>);

            console.log("selectedDates change");
            return () => {};
        },
        [availableDates, selectedDates],
    );
    
    const onSubmit = (e) =>{
        e.preventDefault();
        update_event_availability();
    }
    const returnHome = (e) =>{
        e.preventDefault();
        window.history.pushState(null, '', "#home_page");
        props.setPage("#home_page");
    }

    const eventIdRef = useRef(null);

    const copyToClipboard = () => {
        const eventId = eventIdRef.current.textContent; 
        navigator.clipboard.writeText(eventId)
          .then(() => {
            alert('Event ID copied to clipboard!'); 
          })
          .catch(err => {
            console.error('Failed to copy Event ID: ', err); 
            props.handle_error(err);
          });
      };

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
            <div>
                <div className='title_panel'>
                    <h2>Event: {event.eventTitle}</h2>
                </div>
                <div className='buttons_panel'>
                    <span className> Share My EventID: </span>
                    <span className='share_eventID' ref={eventIdRef} id="share_url">{event.eventId}</span>
                    <button className="copy_button" type="button" onClick={copyToClipboard}> Copy </button>  
                </div>
                {!isLogin && (<Login props={
                    {
                        setUsername, 
                        setIsLogin,
                        username,
                        handle_error: props.handle_error,
                    
                    }
                } />)}
                {isLogin && (<ModifyEvent props={
                    {
                        username,
                        setUsername,
                        setIsLogin,
                        event,
                        setEvent,
                        timeZone,
                        setTimeZone,
                        
                    }
                }/>)}
                
                <SelectTimeZone props={{
                    timeZone,
                    setTimeZone,
                }}
                />
                {props.error && <p className="error">{props.error}</p>}
                <div className="entirePage">
                    <div className="leftPart"> 
                        {availableUsers.length == 0 ? (
                        <div>
                        {isLogin && (
                        <div className='selecto_wraps'>
                            <h2>Select My Availability:</h2>
                            <div className='color_example'>
                                <span className='example_block'>Unavailable </span>
                                <span className="unavailable_block"></span>
                                <span className='example_block'>Available </span>
                                <span className="available_block"></span>
                                <span className='example_block'>Selected </span>
                                <span className="selected_block"></span>
                            </div>
                            <Selecto
                                selectableTargets={[".event_time_slot"]}
                                hitRate={0}
                                container={".time-picker-container"}
                                selectByClick={true}
                                selectFromInside={true}
                                continueSelect={true}
                                toggleContinueSelect={"shift"}
                                keyContainer={window}
                                onDragStart={({ inputEvent }) => {
                                inputEvent.stopPropagation();
                                }}
                                onDragEnd={({ inputEvent }) => {
                                    inputEvent.stopPropagation();
                                    update_event_availability();
                                }}
                                onSelect={(e) => {
                                e.added.forEach(el => {
                                    const dateStr = el.getAttribute("data-key");
                                    console.log("add dateStr", dateStr);
                                    setSelectedDates(prev => new Set(prev.add(dateStr)));
                                    console.log("selected dates", selectedDates);
                                });
                                e.removed.forEach(el => {
                                    const dateStr = el.getAttribute("data-key");
                                    console.log("remove dateStr", dateStr);
                                    setSelectedDates(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(dateStr);
                                    return newSet;
                                    });
                                    console.log("selected dates", selectedDates);
                                });
                                }}
                            />
                            <div className="scrollable">
                            {eventTable}
                            </div>

                            <form className="submit_my_time_slot_form" action="#/submit_my_time_slot" onSubmit={onSubmit} >
                                <button className="submit_time_button" type="submit"> Save </button>                     
                            </form>
                        </div> )
                        }
                        </div>) :
                        (
                            <div>
                                <h2> Available Users:</h2>
                                <ul className='available_users'>
                                {availableUsers.map((item, index) => (
                                    <li key={index} className='available_user_names'>{item}</li>
                                ))}
                                </ul>
                            </div> 
                        )
                        }
                    </div>

                    <div className="rightPart">
                        {event.participant && (
                        <div className='event_view_group'>
                            <h2>Group Availability:</h2>
                            <div className='color_example'>
                            <span className='example_block'> Mouseover the calendar to see who is available. </span>
                            </div>
                            <div className="scrollable">
                                {groupTable}
                            </div>
                            <div className='padding_block'>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        
    );
};

export default EventView;