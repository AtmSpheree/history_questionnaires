import {useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom'
import DefaultButton from "../Buttons/DefaultButton/DefaultButton";
import './Header.css';
import {useDispatch, useSelector} from "react-redux";
import {set as setApiKey, selectApiKey} from "../../features/ApiKey/ApiKey";
import {set as setUsername, selectUsername} from "../../features/Username/Username";
import Loader from "../Loader/Loader";

function Header(props) {
  const apiKey = useSelector(selectApiKey);
  const username = useSelector(selectUsername);
  const [isBurger, setIsBurger] = useState(false);
  const [styleBurger, setStyleBurger] = useState({});
  const [styleBurgerLine1, setStyleBurgerLine1] = useState({});
  const [styleBurgerLine2, setStyleBurgerLine2] = useState({});
  const [styleBurgerLine3, setStyleBurgerLine3] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const onClickLogout = (e) => {
    console.log(apiKey)
    setIsLoading(true);
    fetch(
      `${process.env.REACT_APP_HOST}/logout`,
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
      }
    ).then(response => {
      localStorage.removeItem("apiKey")
      localStorage.removeItem("username")
      dispatch(setApiKey(""));
      dispatch(setUsername(""));
      setIsLoading(false);
      navigate(`/`);
      if (!response.ok) {
        throw Error(response.statusMessage)
      }
    }).catch(error => {
      setIsLoading(false);
      console.log(error.message);
    })
  }

  const onBurgerClick = (e) => {
    window.scrollTo(0, 0);
    if (isBurger) {
      window.onscroll = function() {};
      setStyleBurger({})
      setStyleBurgerLine1({top: "4px"})
      setStyleBurgerLine3({top: "-4px"})
      setStyleBurgerLine2({opacity: "1"})
      setTimeout(() => {
        setStyleBurgerLine1({})
        setStyleBurgerLine3({})
      }, 100)
    } else {
      window.onscroll = function() { window.scrollTo(0, 0); }
      setStyleBurger({opacity: "1", pointerEvents: "all"})
      setStyleBurgerLine1({top: "4px"})
      setStyleBurgerLine3({top: "-4px"})
      setStyleBurgerLine2({opacity: "0"})
      setTimeout(() => {
        setStyleBurgerLine1({top: "4px", transform: "rotate(45deg)"})
        setStyleBurgerLine3({top: "-4px", transform: "rotate(-45deg)"})
      }, 100)
    }
    setIsBurger(!isBurger);
  }

  return (
    <div className={"header_background"} style={{backgroundColor: props.BGColor}}>
      <div className={"burger_menu"} style={styleBurger}>
        <p className={"header_username header_username__small"} onClick={(e) => {navigate("/adminpanel")}}>{username}</p>
        <div className={"header_button_panel"}>
          {isLoading ?
            <Loader loaderContainerStyle={{display: "block", marginRight: "10px"}}/>
            :
            <Loader loaderContainerStyle={{display: "none", marginRight: "10px"}}/>}
          {apiKey === "" ?
            <DefaultButton onClickFunction={(e) => {navigate("/login"); window.onscroll = function() {};}} text={"Вход"} classNameButton={"header_main_button"}/>
            :
            <DefaultButton onClickFunction={(e) => {onClickLogout(e); window.onscroll = function() {};}} text={"Выход"} classNameButton={"header_main_button"}/>
          }
        </div>
      </div>
      <div className="header_container">
        <img src={`${process.env.PUBLIC_URL}/logo512.png`} alt={"Logo"} className="logo_img"
             onClick={(e) => {navigate("/")}}/>
        <div className={"header_button_panel"}>
          <p className={"header_username header_username__large"} onClick={(e) => {navigate("/adminpanel")}}>{username}</p>
          {isLoading ?
            <Loader loaderContainerStyle={{display: "block", marginRight: "10px"}}/>
            :
            <Loader loaderContainerStyle={{display: "none", marginRight: "10px"}}/>}
          {apiKey === "" ?
            <DefaultButton onClickFunction={(e) => {navigate("/login")}} text={"Вход"} classNameButton={"header_main_button header_main_button__large"}/>
            :
            <DefaultButton onClickFunction={(e) => {onClickLogout(e)}} text={"Выход"} classNameButton={"header_main_button header_main_button__large"}/>
          }
          <div className={"burger_item"} onClick={onBurgerClick}>
            <div className={"burger_item_line_1"} style={styleBurgerLine1}></div>
            <div className={"burger_item_line_2"} style={styleBurgerLine2}></div>
            <div className={"burger_item_line_3"} style={styleBurgerLine3}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

Header.defaultProps = {
  BGColor: "rgba(255, 255, 255, 0)"
}

export default Header;
