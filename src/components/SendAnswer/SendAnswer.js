import './SendAnswer.css'
import {useState, useEffect, useRef} from "react";
import {useParams, useLocation, useNavigate} from "react-router-dom";
import Header from "../Header/Header";
import Loader from "../Loader/Loader";
import AnswersContainer from "./AnswersContainer/AnswersContainer";
import DefaultInput from "../Inputs/DefaultInput/DefaultInputText";
import DefaultButton from "../Buttons/DefaultButton/DefaultButton";
import DefaultError from "../Errors/DefaultError/DefaultError";

function getObjectLength(obj) {
  return Object.keys(obj).length;
}

function SendAnswer(props) {
  document.body.style.backgroundColor = "white"

  const cyrillicPattern = /^[A-Z0-9]*$/;
  const userDataPattern = /^[а-яё ]*$/;
  const params = useParams();
  const location = useLocation();
  let quest = null;
  if (location.state !== null && Object.hasOwn(location.state, "questionnaire")) {
    if (location.state.questionnaire.id === params.id) {
      quest = location.state.questionnaire
    }
  }
  const [questionnaire, setQuestionnaire] = useState(quest);
  let tempIsError = null;
  if (params.id.split('').some((elem) => {return !cyrillicPattern.test(elem)}) || params.id.length !== 6) {
    tempIsError = "Опроса с таким ID не существует.";
  }
  const [isError, setIsError] = useState(tempIsError);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingLoading, setIsSendingLoading] = useState(false);

  let tempSendAnswers = localStorage.getItem("sendAnswers");
  let tempUserData = "";
  if (tempSendAnswers !== null) {
    tempSendAnswers = JSON.parse(tempSendAnswers);
    if (tempSendAnswers.id === params.id) {
      if (Object.hasOwn(tempSendAnswers, "userData")) {
        tempUserData = tempSendAnswers.userData;
      }
      tempSendAnswers = tempSendAnswers.answers;
    } else {
      tempSendAnswers = null;
    }
  }
  const [userData, setUserData] = useState(tempUserData);
  const [sendAnswers, setSendAnswers] = useState(tempSendAnswers);
  const [answersData, setAnswersData] = useState(tempSendAnswers === null ? {} : tempSendAnswers);
  const [isSent, setIsSent] = useState(null);
  const [sentContainerStyle, setSentContainerStyle] = useState({});
  const errorRef = useRef(null);
  const navigate = useNavigate();

  const onSetAnswersCallback = (answers) => {
    setAnswersData(answers);
  }

  const onInputChange = (event) => {
    let value = "";
    if (event.target.value.toLowerCase().split('').some((elem) => {return !userDataPattern.test(elem)})) {
      value = event.target.value.slice(0, -1);
    } else {
      value = event.target.value;
    }
    setUserData(value);
    if (localStorage.getItem("sendAnswers") === null) {
      localStorage.setItem("sendAnswers", JSON.stringify({userData: value}))
    } else {
      localStorage.setItem("sendAnswers", JSON.stringify({...JSON.parse(localStorage.getItem("sendAnswers")), userData: value}))
    }
  }

  const onSubmitFunction = () => {
    if (isSent !== null) {
      return
    }
    if (userData.split(" ").length !== 3 || userData.split(" ").some((el) => el.length < 2)) {
      errorRef.current.setErrorText("! Некорректный ввод")
      errorRef.current.changeErrorStatus(true);
    } else if (getObjectLength(answersData) !== questionnaire.questions.length) {
      errorRef.current.setErrorText("! Ответьте на все вопросы")
      errorRef.current.changeErrorStatus(true);
    } else {
      setIsSendingLoading(true)
      let answers = [];
      for (let i = 0; i < getObjectLength(answersData); i++) {
        answers.push({question: Object.keys(answersData)[i], answer: answersData[Object.keys(answersData)[i]]})
      }
      fetch(
        `${process.env.REACT_APP_HOST}/questionnaire/${params.id}/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          },
          body: JSON.stringify({
            user_data: userData,
            answers: answers
          })
        }
      ).then(response => {
        if (response.ok) {
          return response.json()
        } else {
          return response.json()
        }
      }).then((response) => {
        if (Object.hasOwn(response, "message")) {
          if (response.message === "This questionnaire is closed now.") {
            errorRef.current.setErrorText("! Этот опрос на данный момент закрыт");
            errorRef.current.changeErrorStatus(true);
            setIsSendingLoading(false)
          } else if (response.message === "The deadline for this questionnaire has already passed.") {
            errorRef.current.setErrorText("! Дедлайн этого опроса уже прошёл");
            errorRef.current.changeErrorStatus(true);
            setIsSendingLoading(false)
          } else {
            throw Error(`status ${response.error}`)
          }
        } else {
          errorRef.current.changeErrorStatus(false);
          localStorage.removeItem("sendAnswers");
          setIsSent(response);
          setSentContainerStyle({display: "flex"})
          setTimeout(() => setSentContainerStyle({display: "flex", opacity: "1"}), 200)
          setIsSendingLoading(false)
        }
      }).catch(error => {
        setIsSendingLoading(false)
        console.log(error.message);
      })
    }
  }

  useEffect(() => {
    if (isError === null) {
      if (questionnaire === null) {
        fetch(
          `${process.env.REACT_APP_HOST}/questionnaire/${params.id}`,
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
              setIsError("Опроса с таким ID не существует.");
              setIsLoading(false)
            } else if (response.message === "This questionnaire is closed now.") {
              setIsError("Этот опрос на данный момент закрыт.");
              setIsLoading(false)
            } else if (response.message === "The deadline for this questionnaire has already passed.") {
              setIsError("Дедлайн этого опроса уже прошёл.");
              setIsLoading(false)
            } else {
              throw Error(`status ${response.error}`)
            }
          } else {
            setQuestionnaire(response.questionnaire)
            setIsLoading(false)
          }
        }).catch(error => {
          console.log(error.message);
        })
      }
    }
    setIsLoading(false);
  }, [])

  return (<>{isLoading ?
    <div className={"loader_wrapper"}>
      <Loader/>
    </div>
    :
    <div className={"wrapper"}>
      <Header BGColor={"#491D0B"}/>
      {isError !== null ?
        <p className={"send_answer_main_title"}>
          Ошибка:
          <br/>
          {isError}
        </p>
        :
        <>
          <p className={"send_answer_main_title"}>
            Тест по теме:
            <br/>
            {questionnaire === null ?
              ""
            :
              questionnaire.title
            }
          </p>
          <AnswersContainer questionnaire={questionnaire} id={params.id} sendAnswers={sendAnswers}
                            onSetAnswersCallback={onSetAnswersCallback}/>
          <div className={"enter_user_data_field"}>
            <DefaultInput InputProps={{maxLength: 100, placeholder: "Введите ФИО"}} classNameContainer={"enter_user_data_field_container"}
                          styleInput={{fontSize: "30px"}} styleContainer={{width: "100%", maxWidth: "690px"}}
                          onChangeFunction={onInputChange} value={userData}
                          src={`${process.env.PUBLIC_URL}/img/icons/username_icon.png`}/>
            <DefaultInput InputProps={{maxLength: 100, placeholder: "ФИО"}} classNameContainer={"enter_user_data_field_container_short"}
                          styleInput={{fontSize: "30px"}} styleContainer={{width: "100%", maxWidth: "690px"}}
                          onChangeFunction={onInputChange} value={userData}
                          src={`${process.env.PUBLIC_URL}/img/icons/username_icon.png`}/>
            {isSendingLoading ?
              <Loader loaderContainerStyle={{display: "block", marginRight: "10px"}}/>
              :
              <Loader loaderContainerStyle={{display: "none", marginRight: "10px"}}/>}
            <DefaultButton color={"black"} onClickFunction={onSubmitFunction} text={"Отправить"}
                           classNameButton={"enter_user_data_field_send_button"}/>
          </div>
          <DefaultError ref={errorRef} statusError={false} color={"black"}/>
          <div className={"if_sent_container"} style={sentContainerStyle}>
            <img src={`${process.env.PUBLIC_URL}/img/cup.png`} className={"cup_img noselect"} alt={"cup"}/>
            {isSent !== null &&
              <p className={"is_sent_container_text"}>
                Вы ответили правильно на <span>{isSent.result}</span> из <span>{isSent.all}</span> вопросов
              </p>
            }
            <DefaultButton color={"black"} onClickFunction={(e) => {navigate("/")}} text={"На главную"}/>
          </div>
        </>
      }
    </div>
  }</>)
}

export default SendAnswer;