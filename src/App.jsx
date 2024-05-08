import { useState, useEffect} from 'react'
import './App.css'
import HomePage from './HomePage';
import EventView from './EventView';
import CreateEvent from './CreateEvent';
import PageNotFound from './PageNotFound';
import Footer from './Footer';

function App() {
  const [page, setPage] = useState("#home_page");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [eventId, setEventId] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const messages = {
    'network-error': "Server unavailable, please try again later!",
    'required-username': "Username is not alphanumeric or it is empty!",
    'auth-insufficient': "Invalid username!",
    'auth-missing': "Please login!", 
    'invalid-time': "Please select a valid time range.",
    'invalid-eventTitle': "Event title is not alphanumeric or it is empty!",
    'Date_not_selected':"Please select dates to continue.",
    default: "Something went wrong, please try again",
    };

  const handle_error = (err) => {
      const error = messages[err.error] || messages.default;
      setError(error);
      if (err.error === "auth-missing") {
          setPage("#home_page");
      }
  }

  const props ={
    page, setPage,
    isLoading,setIsLoading, 
    error, setError, 
    eventId,setEventId,
    eventTitle, setEventTitle,
    handle_error,
  }

  useEffect(
    () => {
        //check if there is an eventID parameter in the url 
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const eventId = urlParams.get('eventId'); 
        console.log("init eventId", eventId);
        if (eventId) {
          setEventId(eventId);
          setPage("#join_event_page");
        }
        return () => {};
        },
    [],
);

useEffect( () => {
    function handlePageLoad() {
      setPage(document.location.hash || '#home_page'); 
    }
    handlePageLoad(); 
    window.addEventListener('popstate', handlePageLoad);
    setPage(document.location.hash || '#home_page');

  return () => {
    window.removeEventListener('popstate', handlePageLoad);
  }
  }, []);

  return (
    <div className='app'>
      <main>
        {page =="#home_page" &&  <HomePage props={props}/>}
        {page =="#new_event_page" && <CreateEvent props={props}/>}  
        {page =="#join_event_page" && <EventView props={props}/>}  
        {page =="#page_not_found" && <PageNotFound props={props}/>}  
      </main>
      <Footer/>
    </div>
  )
}

export default App;
