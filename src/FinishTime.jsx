const dayHours = [
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

function FinishTime({props}) {
  const handleChange = (event) => {
    const x = parseInt(event.target.value);
    props.setFinishTime(x);
    props.setInitialTime((prev) => {
      return Math.min(prev, x - 1);
    });
  };

  return (
    <div>
      <label htmlFor="finishTime">No later than: </label>
      <select
        id="finishTime"
        name="finishTime"
        value={props.finishTime}
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

export default FinishTime;
