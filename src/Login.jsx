import { useState, useEffect} from 'react';
import {myFetch} from "./services.js"

function Login({props}){
    const [inputName, setInputName] = useState('');

    useEffect(
        () => {
            myFetch('/api/session', "GET")
            .then( res => {
                props.setUsername(res.username);
                props.setIsLogin(true);
            })
            .catch( err => {
                console.log(err);
            });
            return () => {};
        },
        [],
      );

    const onSubmit = (e) =>{
        e.preventDefault();
        myFetch('/api/session', "POST", {username: inputName})
        .then( res => {
            props.setUsername(res.username);
            props.setIsLogin(true);
        })
        .catch( err => {
            console.log("session POST err", err);
            props.handle_error(err);
        });
    }
    return(
        <form className="login__form" action="#/login" onSubmit={onSubmit}>
                <label>
                    <span>Your Name: </span>
                    <input className="username_login" value={inputName} onChange={
                        (e) => {
                        e.preventDefault();
                        setInputName(e.target.value);
                    }}/>    
                </label>
                <button className="login_button" type="submit"> Login </button>
        </form>
        
    );
}
export default Login;