
function Header({props}){
    const returnHome = (e) =>{
        e.preventDefault();
        window.history.pushState(null, '', "#home_page");
        props.setPage("#home_page");
    }
    return(
    <header className="header">
        <div className='logo_panel'>
                    <a id="logo_link" href="#/" className='header__logo' onClick={returnHome}>
                        <img src="quokka.jpg" alt="a Quokka logo" className='header__logo__img'/>
                    </a> 
        </div>
        <h1 className='web_name'>When2Meet</h1>
    </header>
    )
}
export default Header;