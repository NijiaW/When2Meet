import Header from "./Header";

function PageNotFound({props}){
    const returnHome = (e) =>{
        e.preventDefault();
        window.history.pushState(null, '', "#home_page");
        props.setPage("#home_page");
    };

    return(
        <div className="page_not_found">
            <Header props={props}/>
            <h2>404 Page Not found</h2>
            <form className="return_to_home_page_form" action="#/home" onSubmit={returnHome}>
                <button className="return__button" type="submit"> Home Page</button>
            </form>
        </div>
    );
};
export default PageNotFound;