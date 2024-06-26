import {useEffect, useState, useRef} from "react";
import './EnterCodeField.css';
import DefaultInput from "../Inputs/DefaultInput/DefaultInputText";
import DefaultButton from "../Buttons/DefaultButton/DefaultButton";
import Loader from "../Loader/Loader";
import DefaultError from "../Errors/DefaultError/DefaultError";
import {useNavigate} from 'react-router-dom'

function EnterCodeField() {
  const cyrillicPattern = /^[A-Za-z0-9]*$/;
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const errorRef = useRef(null);
  const navigate = useNavigate();

  const onInputChange = (event) => {
    if (event.target.value.split('').some((elem) => {return !cyrillicPattern.test(elem)})) {
      setCode(event.target.value.slice(0, -1).toUpperCase())
    } else {
      setCode(event.target.value.toUpperCase())
    }
  }

  const onSubmitFunction = () => {
    if (code.length < 6) {
      errorRef.current.setErrorText("! Код должен состоять из 6 символов")
      errorRef.current.changeErrorStatus(true);
    } else {
      setIsLoading(true)
      fetch(
        `${process.env.REACT_APP_HOST}/questionnaire/${code}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          }
        }
      ).then(response => {
        return response.json()
      }).then((response) => {
        if (Object.hasOwn(response, "message")) {
          if (response.message === "There is no questionnaire with this id.") {
            errorRef.current.setErrorText("! Опроса с таким кодом не существует")
            errorRef.current.changeErrorStatus(true);
            setIsLoading(false)
          } else if (response.message === "This questionnaire is closed now.") {
            errorRef.current.setErrorText("! Этот опрос на данный момент закрыт")
            errorRef.current.changeErrorStatus(true);
            setIsLoading(false)
          } else if (response.message === "The deadline for this questionnaire has already passed.") {
            errorRef.current.setErrorText("! Дедлайн этого опроса уже прошёл")
            errorRef.current.changeErrorStatus(true);
            setIsLoading(false)
          } else {
            throw Error(`status ${response.error}`)
          }
        } else {
          errorRef.current.changeErrorStatus(false);
          setTimeout(() => {
            navigate(`/questionnaire/${code}`, {state: {questionnaire: response.questionnaire}})
          }, 500)
          setIsLoading(false)
        }
      }).catch(error => {
        setIsLoading(false)
        console.log(error.message);
      })
    }
  }

  return (<>
    <div className={"enter_code_field"}>
      <DefaultInput InputProps={{maxLength: 6, placeholder: "Код"}} classNameContainer={"enter_code_field_container_short"}
                    classNameInput={"enter_code_field_input"} styleContainer={{width: "100%", maxWidth: "520px"}}
                    onChangeFunction={onInputChange} value={code} styleInput={{}}
                    src={`${process.env.PUBLIC_URL}/img/icons/code_icon.png`}/>
      <DefaultInput InputProps={{maxLength: 6, placeholder: "Введите код"}} classNameContainer={"enter_code_field_container"}
                    classNameInput={"enter_code_field_input"} styleContainer={{width: "100%", maxWidth: "520px"}}
                    onChangeFunction={onInputChange} value={code} styleInput={{}}
                    src={`${process.env.PUBLIC_URL}/img/icons/code_icon.png`}/>
      {isLoading ?
        <Loader loaderContainerStyle={{display: "block", marginRight: "10px"}}/>
      :
        <Loader loaderContainerStyle={{display: "none", marginRight: "10px"}}/>}
      <DefaultButton color={"black"} onClickFunction={onSubmitFunction}/>
    </div>
    <DefaultError ref={errorRef} statusError={false}/>
  </>)
}

export default EnterCodeField;
