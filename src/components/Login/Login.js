import {useState, useEffect, useRef} from "react"
import {useNavigate} from "react-router-dom";
import './Login.css';
import Header from "../Header/Header";
import DefaultInput from "../Inputs/DefaultInput/DefaultInputText";
import DefaultButton from "../Buttons/DefaultButton/DefaultButton";
import Loader from "../Loader/Loader";
import DefaultError from "../Errors/DefaultError/DefaultError";
import { useSelector, useDispatch } from 'react-redux';
import {set as setApiKey, selectApiKey} from "../../features/ApiKey/ApiKey";
import {set as setUsernameRedux} from "../../features/Username/Username";

function Login() {
  document.body.style.backgroundColor = "#481c0a"

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const submitRef = useRef(null);
  const errorRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiKey = useSelector(selectApiKey);

  useEffect(() => {
    if (apiKey !== "") {
      navigate("/adminpanel")
    }
  }, [])

  const onSubmitFunction = (e) => {
    e.preventDefault();
    if (password.length === 0 || username.length === 0) {
      errorRef.current.setErrorText("! Заполните все поля")
      errorRef.current.changeErrorStatus(true);
    } else {
      setIsLoading(true)
      fetch(
        `${process.env.REACT_APP_HOST}/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          },
          body: JSON.stringify({
            username: username,
            password: password
          })
        }
      ).then(response => {
        if (response.status === 400) {
          errorRef.current.setErrorText("! Пользователя с таким именем не существует")
          errorRef.current.changeErrorStatus(true);
          throw Error("status 400")
        } else if (response.status === 403) {
          errorRef.current.setErrorText("! Неверное имя пользователя или пароль")
          errorRef.current.changeErrorStatus(true);
          throw Error("status 403")
        }
        return response.json()
      }).then(({token}) => {
        localStorage.setItem("apiKey", token)
        localStorage.setItem("username", username)
        dispatch(setUsernameRedux(username))
        dispatch(setApiKey(token))
        errorRef.current.changeErrorStatus(false);
        setTimeout(() => {
          navigate(`/adminpanel`)
        }, 500)
        setIsLoading(false)
      }).catch(error => {
        setIsLoading(false)
        console.log(error.message);
      })
    }
  }

  return (<div className={"wrapper"}>
    <img src={`${process.env.PUBLIC_URL}/img/continents_background_dark.png`} alt={"continents_bg"}
         className={"background_image"}/>
    <Header/>
    <p className={"login_title noselect"}>Авторизация</p>
    <form className={"login_container"} onSubmit={onSubmitFunction}>
      <DefaultInput InputProps={{placeholder: "Имя пользователя", type: "text", maxLength: 50}}
                    styleInput={{fontSize: "30px"}} styleContainer={{width: "100%"}}
                    onChangeFunction={(e) => {setUsername(e.target.value)}} value={username}
                    src={`${process.env.PUBLIC_URL}/img/icons/username_icon.png`}/>
      <DefaultInput InputProps={{placeholder: "Пароль", type: "password", maxLength: 50}}
                    styleInput={{fontSize: "30px"}} styleContainer={{width: "100%"}}
                    onChangeFunction={(e) => {setPassword(e.target.value)}} value={password}
                    src={`${process.env.PUBLIC_URL}/img/icons/password_icon.png`}/>
      <div className={"login_info_panel"}>
        {isLoading ?
          <Loader loaderContainerStyle={{display: "block", marginRight: "10px"}}/>
          :
          <Loader loaderContainerStyle={{display: "none", marginRight: "10px"}}/>}
        <DefaultButton color={"black"} onClickFunction={(e) => {submitRef.current.click()}} text={"Войти"}/>
      </div>
      <input type={"submit"} className={"invisible_submit"} ref={submitRef}/>
    </form>
    <div className={"login_error"}>
      <DefaultError ref={errorRef} statusError={false}/>
    </div>
  </div>)
}

export default Login;
