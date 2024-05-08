import { useState} from 'react';
import Header from './Header.jsx';

function HomePage({props}){
    const[input, setInput] = useState('');
    
    function addParamsToUrl(newParams, hash="") {
        const url = new URL(window.location);
        Object.keys(newParams).forEach(key => url.searchParams.set(key, newParams[key]));
        url.hash = hash;
        window.history.pushState(null, '', url);
    }

    const newEvent = (e) =>{
        e.preventDefault();
        window.history.pushState(null, '', "#new_event_page");
        props.setPage("#new_event_page");
    };
    const joinEvent = (e) =>{
        e.preventDefault();
        props.setEventId(input);
        addParamsToUrl({eventId: input}, "#join_event_page");
        props.setPage("#join_event_page");
    };
    function onChange(e){
        setInput(e.target.value);
    }

    return (
        <div className="home_page">
            <Header props={props}/>
            <h2>Join an Existing Event</h2>
            <form className="create_event_form" action="#/join_event_page" onSubmit={joinEvent}>
                    <label>
                    <span>EventID: </span>
                        <input className="join_in_link" value={input} onChange={onChange}/>
                        <button className="join_in_button" type="submit"> Join in</button>
                    </label>
            </form>
            <div className='split_line'></div>
            <form className="create_event_form" action="#/new_event_page" onSubmit={newEvent}>
                <label>
                    <button className="create_event_button" type="submit"> Create a New Event</button>    
                </label>
            </form>
        </div>
    );
};

export default HomePage;