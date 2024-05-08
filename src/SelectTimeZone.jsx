import { useState, useEffect} from 'react'
import { timeZones } from "./timeZones.js";
import CreateEvent from "./CreateEvent";

function SelectTimeZone({props}) {

    const handleChange = (event) => {
        props.setTimeZone(event.target.value);
    };

    useEffect(() => {
        if (!timeZones.includes(props.timeZone)) {
            props.setTimeZone('America/Los_Angeles'); 
        }
    }, [props.timeZone]);

    return (
        <div>
            <label htmlFor="timeZone">Time Zone </label>
            <select
                id="timeZone"
                name="timeZone"
                value={props.timeZone}
                onChange={handleChange}
            >
                {timeZones.map((zone, index) => (
                    <option key={`timeZone-${index}`} value={zone}>
                        {zone}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default SelectTimeZone;
