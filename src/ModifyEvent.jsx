import { myFetch } from './services';

function ModifyEvent({props}){

    const onLogout = (e) =>{
        e.preventDefault();
        console.log("page", props.page);
        myFetch('/api/session',"delete")
        .then(data => {
            props.setUsername('');
            props.setIsLogin(false);
        })
        .catch(err =>{
            console.error('fetchLogout err:', err);
            props.handle_error(err);
        });
    }
    
    return(
        <div>
            <form className="logout_form" action="#/" onSubmit={onLogout} >
                <label>
                    <span className='modify_event_username'>Username: {props.username}</span>
                </label>
                <button className="logout_button" type="submit"> Logout</button>    
            </form>
        </div>
    );
}
export default ModifyEvent;