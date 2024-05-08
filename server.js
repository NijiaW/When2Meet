const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

const events = require('./events');
const sessions = require('./sessions');

app.use(cookieParser());
app.use(express.static('./dist'));
app.use(express.json());

app.post('/api/create_event', (req, res) => {
  const {eventTitle, time} = req.body;

  // console.log("Receive", time);
  if(!events.isValidEvent(eventTitle)) {
    // console.log("eventTitle", eventTitle);
    res.status(400).json({ error: 'invalid-eventTitle' });
    return;
  }
  if(!time.availability_count) {
    res.status(400).json({ error: 'Date_not_selected' });
    return;
  }

  const event = events.addEvent(eventTitle, time);
  res.json({event});
});

app.post('/api/event_pull', (req, res) => {
  const {eventId} = req.body;
  // console.log("{'/api/event_pull eventId}", {eventId});
    if(eventId) {
      const event = events.findEventId(eventId);
      if (!event) {
          res.status(401).json({ error: 'eventID-invalid' });
          return;
      }
      res.json({event});
    }
    else {
      res.status(400).json({ error: 'eventID-missing' });
      return;
    }
  });


app.put('/api/event_modify', (req, res) => {
    const sid = req.cookies.sid;
    const username = sid ? sessions.getSessionUser(sid) : '';
    if(!sid || !username) {
      res.status(401).json({ error: 'auth-missing' });
      return;
    }
    const event = req.body;
    // console.log("{'/api/event_modify event} ", event);
    const findEvent = events.addParticipant(event.eventId, event.username, event.time);
    // console.log("findEvent:" , findEvent);

    if(!findEvent) {
      res.status(400).json({ error: 'invalid-eventID' });
      return;
    }  
    res.json({event: findEvent});
  });

app.post('/api/session', (req, res) => {
  let {username} = req.body;
  username = username.trim();
  // console.log("{username}", {username});
  if(!events.isValidUsername(username)) {
    // console.log(username);
    res.status(400).json({ error: 'required-username' });
    return;
  }
  if(username === 'dog') {
    res.status(403).json({ error: 'auth-insufficient' });
    return;
  }
  const sid = sessions.addSession(username);
  res.cookie('sid', sid);
  res.json({username});
});

app.delete('/api/session', (req, res) => {
  const sid = req.cookies.sid;
  const username = sid ? sessions.getSessionUser(sid) : '';
  if(sid) {
    res.clearCookie('sid');
  }
  if(username) {
    sessions.deleteSession(sid);
  }
  res.json({ wasLoggedIn: !!username }); 
});

app.get('/api/session', (req, res) => {
  const sid = req.cookies.sid;
  const username = sid ? sessions.getSessionUser(sid) : '';

  if(!sid || !username) {
    res.status(401).json({ error: 'auth-missing' });
    return;
  }
  res.json({ username});
});



app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
