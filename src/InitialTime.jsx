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
  ];

function InitialTime({props}) {

  const handleChange = (event) => {
    const x = parseInt(event.target.value);
    props.setInitialTime(x);
    props.setFinishTime((prev) => {
      return Math.max(prev, x + 1); 
    });
  };

  return (
    <div>
      <label htmlFor="initialTime">No earlier than: </label>
        <select
          id="initialTime"
          name="initialTime"
          value={props.initialTime}
          onChange={handleChange}
        >
          {dayHours.map((hour, index) => (
            <option key={`${index}`} value={hour[0]}>
              {hour[1]}
            </option>
          ))}
        </select> 
    </div>
  );
}

export default InitialTime;
