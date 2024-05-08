import React, { useState, useEffect } from 'react';
import Selecto from "react-selecto";
import './App.css';
import moment from "moment-timezone";

function generateDates(timezone) {

  function convertLocalIsoToUTC(isoString, timezone) {
    // Parse the ISO string as local time in the specified timezone
    const localTime = moment.tz(isoString, timezone);
    // Convert to UTC
    const utcTime = localTime.utc().format();
    return utcTime;
  }

  const now = new Date().toLocaleString("en-US", { timeZone: timezone });
  const currentDate = new Date(now);
  const lastSunday = new Date(currentDate);
  lastSunday.setDate(currentDate.getDate() - currentDate.getDay()); 
  lastSunday.setHours(0, 0, 0, 0); 
  // Generate dates for the next 35 days starting from last Sunday
  let dates = [];
  let years = [];
  let months = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weeks = ["   ","Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat", "   ",];

  for (let i = 0; i < 35; i++) {

    const nextDate = new Date(lastSunday);
    nextDate.setDate(lastSunday.getDate() + i);
    const date_string = nextDate.toISOString().split('T')[0]; 
    const utcDate = convertLocalIsoToUTC(date_string, timezone);
    dates.push({utcDate, date: nextDate.getDate().toString()}); 

    if (i % 7 == 0) {
      years.push(nextDate.getFullYear().toString());
      months.push(monthNames[nextDate.getMonth()]);
    }
  }
  return {dates, years, months, weeks};
}

function DatePickerTable({props}) {
  const [tableData, setTableData] = useState([]);
  const [timeData, setTimeData] = useState({
    dates: [],
    years: [],
    months: [],
    weeks: [],
  });
  useEffect(
    () => {
          const {dates, years, months, weeks} = timeData;
          if (dates.length != 35) return;
          const all_elements = [];
          for (let i = 0; i < 9; ++i){
            all_elements.push(<span className='week' key={i}> {weeks[i]} </span>);
          }
          for (let i = 0; i < 35; ++i){
            if (i % 7 == 0) {
              all_elements.push(<span className='month' key={i+9}>
              {months[Math.floor(i/7)]}
              </span>);
            }
            all_elements.push(<button
              className={props.selectedDates.has(dates[i].utcDate) ?("selecto-button style1") :("selecto-button style2")}
              key={dates[i].utcDate}
              data-date={dates[i].utcDate}
              >
              {dates[i].date}
            </button>);
            if (i % 7 == 6) {
              all_elements.push(<span className='year' key={i+9}>
              {years[Math.floor(i/7)]}
              </span> 
              );
              // console.log("years[i/7]", years[Math.floor(i/7)]);
            }
          }
          setTableData(all_elements);
        return () => {};
        },
    [props.selectedDates],
  );

  useEffect(
    () => {
          console.log("initial calendar");
          const {dates, years, months, weeks} = generateDates(props.timeZone);
          props.setAllDates(dates);
          props.setSelectedDates(new Set());
          setTimeData({dates, years, months, weeks});
        return () => {};
        },
    [props.timeZone],
  );


  return (
    <div className='selecto_wraps'>
      <Selecto
        selectableTargets={[".selecto-button"]}
        hitRate={0}
        container={".date-picker-container"}
        selectByClick={true}
        selectFromInside={true}
        continueSelect={true}
        toggleContinueSelect={"shift"}
        keyContainer={window}
        onDragStart={({ inputEvent }) => {
          inputEvent.stopPropagation();
        }}
        onSelect={(e) => {
          e.added.forEach(el => {
            const dateStr = el.getAttribute("data-date");
            console.log("add dateStr", dateStr);
            props.setSelectedDates(prev => new Set(prev.add(dateStr)));
            console.log("selected dates", props.selectedDates);
          });
          e.removed.forEach(el => {
            const dateStr = el.getAttribute("data-date");
            console.log("remove dateStr", dateStr);
            props.setSelectedDates(prev => {
              const newSet = new Set(prev);
              newSet.delete(dateStr);
              return newSet;
            });
            console.log("selected dates", props.selectedDates);
          });
        }}
      />

      <div className="date-picker-container_inside" >
         {tableData}
      </div>      
    </div>
  );
}


export default DatePickerTable;