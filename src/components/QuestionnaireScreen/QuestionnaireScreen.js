import './QuestionnaireScreen.css'
import Header from "../Header/Header";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {selectApiKey, set as setApiKey} from "../../features/ApiKey/ApiKey";
import {set as setUsername} from "../../features/Username/Username";
import {useDispatch, useSelector} from "react-redux";
import Loader from "../Loader/Loader";
import DefaultError from "../Errors/DefaultError/DefaultError";
import {selectQuestionnaires, set as setQuestionnairesState} from "../../features/Questionnaires/Questionnaires";
import DefaultInput from "../Inputs/DefaultInput/DefaultInputText";
import FilterContainer from "../FilterContainer/FilterContainer";

function compare(a, b) {
  if (a > b) return 1;
  if (a === b) return 0;
  if (a < b) return -1;
}

function StatusSwitch(props) {
  return (<div className={"status_switch_container"} onClick={props.onStatusChange}>
    <div className={"questionnaire_screen_info_status noselect"}
         style={(props.selected) ? {backgroundColor: "#903814", color: "white", borderRadius: "15px 0 0 15px"} : {borderRadius: "15px 0 0 15px"}}>
      <img src={`${process.env.PUBLIC_URL}/img/icons/ellipse_correct.svg`} className={"status_svg_img"} alt={"true"}/>
      <p>Открыт</p>
    </div>
    <div className={"questionnaire_screen_info_status noselect"}
         style={(!props.selected) ? {backgroundColor: "#903814", color: "white", borderRadius: "0 15px 15px 0"} : {borderRadius: "0 15px 15px 0"}}>
      <img src={`${process.env.PUBLIC_URL}/img/icons/ellipse_wrong.svg`} className={"status_svg_img"} alt={"false"}/>
      <p>Закрыт</p>
    </div>
  </div>)
}

function CorrectQuestions(props) {
  const [isShow, setIsShow] = useState(false)
  const [mainStyle, setMainStyle] = useState({opacity: "0", display: "none"})

  const onClickFunction = (e) => {
    if (isShow) {
      setMainStyle({opacity: "0"})
      setTimeout(() => {setMainStyle({opacity: "0", display: "none"})}, 100)
    } else {
      setMainStyle({})
      setTimeout(() => {setMainStyle({opacity: "1"})}, 100)
    }
    setIsShow(!isShow);
  }

  return (
    <div className={"correct_questions_container"}>
      <div className={"correct_questions_button noselect"} onClick={onClickFunction}>Вопросы {isShow ? "(скрыть)" : "(показать)"}</div>
      <div className={"correct_questions_main"} style={mainStyle}>
        {props.questions.map((item, index) =>
          <div className={"correct_questions_question_container"} key={index}>
            <p className={"correct_questions_question_title"}>{item.question}</p>
            <div className={"correct_questions_question_variants_container"}>
              <div className={"correct_questions_question_variants"}>
                {item.variants.map((variant, index2) =>
                  <div key={index2} className={variant === item.correct_answer ?
                       "correct_questions_question_variant_correct" : "correct_questions_question_variant"}>{variant}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AnswersVariants(props) {
  const [isShow, setIsShow] = useState(false)
  const [mainStyle, setMainStyle] = useState({opacity: "0", display: "none"})

  const onClickFunction = (e) => {
    if (isShow) {
      setMainStyle({opacity: "0"})
      setTimeout(() => {setMainStyle({opacity: "0", display: "none"})}, 100)
    } else {
      setMainStyle({})
      setTimeout(() => {setMainStyle({opacity: "1"})}, 100)
    }
    setIsShow(!isShow);
  }

  return (
    <div className={"correct_answers_answer_container"}>
      <div className={"correct_answers_answer_info_container"}>
        <div className={"correct_answers_answer_button noselect"}
             onClick={onClickFunction}>
          {props.item.user_data} {isShow ? "(скрыть)" : "(показать)"}
          <br/>( {props.item.datetime} )
        </div>
        <p className={"correct_questions_answer_result"}>{props.item.result} / {Object.keys(props.item.answers).length}</p>
      </div>
      <div className={"correct_answers_answer_variants_container"} style={mainStyle}>
        <div className={"correct_answers_answer_variants"}>
          {Object.keys(props.item.answers).map((prop, index) =>
            <div className={"correct_questions_question_container"} key={index}>
              <p className={"correct_questions_question_title"}>{prop}</p>
              <div className={"correct_questions_question_variants_container"}>
                <div className={"correct_questions_question_variants"}>
                  {props.questions.filter(item => {return (item.question === prop)})[0].variants.map((variant, index2) =>
                    <div key={index2} className={variant === props.questions.filter(item => {return (item.question === prop)})[0].correct_answer ?
                      "correct_questions_question_variant_correct" :
                      (variant === props.item.answers[prop] ? "correct_questions_question_variant_incorrect" : "correct_questions_question_variant")}>{variant}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CorrectAnswers(props) {
  const [isShow, setIsShow] = useState(false)
  const [mainStyle, setMainStyle] = useState({opacity: "0", display: "none"})
  const [selectedFilterVariant, setSelectedFilterVariant] = useState("ФИО");
  const [selectedFilterOrder, setSelectedFilterOrder] = useState("Возрастанию");
  const [answers, setAnswers] = useState(props.answers)

  const onClickFunction = (e) => {
    if (isShow) {
      setMainStyle({opacity: "0"})
      setTimeout(() => {setMainStyle({opacity: "0", display: "none"})}, 100)
    } else {
      setMainStyle({})
      setTimeout(() => {setMainStyle({opacity: "1"})}, 100)
    }
    setIsShow(!isShow);
  }

  const onChangeAnswersContainer = (tempAnswers, variant, order) => {
    if (tempAnswers) {
      let tempAnswers2 = [...tempAnswers];
      if (variant === "ФИО") {
        tempAnswers2.sort((a, b) => compare(a.user_data.toLowerCase(), b.user_data.toLowerCase()))
      } else if (variant === "Ответам") {
        tempAnswers2.sort((a, b) => compare(a.result, b.result))
      } else if (variant === "Дате") {
        tempAnswers2.sort((a, b) => compare(a.datetime, b.datetime))
      }
      if (order === "Убыванию") {
        tempAnswers2 = tempAnswers2.reverse();
      }
      setAnswers(tempAnswers2)
    }
  }

  const onFilterVariantsChange = (variant) => {
    setSelectedFilterVariant(variant)
    onChangeAnswersContainer(answers, variant, selectedFilterOrder);
  }

  const onFilterOrderChange = (order) => {
    setSelectedFilterOrder(order);
    onChangeAnswersContainer(answers, selectedFilterVariant, order);
  }

  useEffect(() => {
    setAnswers(props.answers);
    onChangeAnswersContainer(props.answers, selectedFilterVariant, selectedFilterOrder);
  }, [props.answers])

  return (
    <div className={"correct_answers_container"}>
      <div className={"correct_answers_button noselect"} onClick={onClickFunction}>Ответы {isShow ? "(скрыть)" : "(показать)"}</div>
      <div className={"correct_answers_main"} style={mainStyle}>
        <FilterContainer className={"questionnaire_screen_variants_filter"} selected={selectedFilterVariant}
                         variants={["ФИО", "Ответам", "Дате"]}
                         onChangeFunction={onFilterVariantsChange}/>
        <FilterContainer className={"questionnaire_screen_order_filter"} selected={selectedFilterOrder}
                         variants={["Возрастанию", "Убыванию"]}
                         onChangeFunction={onFilterOrderChange}/>
        {answers.map((item, index) => <AnswersVariants item={item} questions={props.questions}/>)}
      </div>
    </div>
  )
}

function QuestionnaireScreen(props) {
  document.body.style.backgroundColor = "white"

  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const apiKey = useSelector(selectApiKey);
  const questionnaires = useSelector(selectQuestionnaires)
  const errorRef = useRef(null);
  const [isError, setIsError] = useState(false);
  const [isDeletingQuestionnaireScreen, setIsDeletingQuestionnaireScreen] = useState(false);
  let quest = null;
  if (questionnaires !== null) {
    quest = questionnaires.filter(item => {return item.id === params.id})
    if (quest.length !== 0) {
      quest = quest[0];
    }
  }
  const [questionnaire, setQuestionnaire] = useState(quest);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [isPuttingLoading, setIsPuttingLoading] = useState(false);
  let deadline = "";
  if (questionnaire !== null) {
    if (questionnaire.deadline !== "") {
      deadline = questionnaire.datetime.replace(" ", "T");
    }
  }
  const [questionnaireDeadline, setQuestionnaireDeadline] = useState(deadline)
  const [isDateTimeValid, setIsDateTimeValid] = useState(false);
  let isShow = null;
  if (questionnaire !== null) {
    isShow = questionnaire.is_show;
  }
  const [questionnaireIsShow, setQuestionnaireIsShow] = useState(isShow)

  const onQuestionnaireDateTimeChange = (e) => {
    console.log(e.target.value)
    if (e.target.validity.valid && !e.target.validity.valueMissing && !e.target.validity.badInput) {
      setIsDateTimeValid(true);
    } else {
      setIsDateTimeValid(false);
    }
    setQuestionnaireDeadline(e.target.value);
  }

  const onStatusChange = () => {
    setQuestionnaireIsShow(!questionnaireIsShow)
  }

  const onPutQuestionnaire = (e) => {
    if (apiKey !== "") {
      let body = {};
      if (questionnaire.is_show !== +questionnaireIsShow) {
        body.is_show = +questionnaireIsShow;
      }
      if (questionnaire.deadline !== questionnaireDeadline) {
        body.deadline = questionnaireDeadline;
      }
      if (Object.keys(body).length !== 0) {
        setIsPuttingLoading(true);
        fetch(
          `${process.env.REACT_APP_HOST}/questionnaire/${params.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
              'X-Api-Key': apiKey
            },
            body: JSON.stringify(body)
          }
        ).then(response => {
          if (response.status === 403) {
            dispatch(setApiKey(""));
            dispatch(setUsername(""));
            navigate('/login')
            throw Error('status 403')
          }
          return response.json()
        }).then((response) => {
          if (!Object.hasOwn(response, "questionnaire")) {
            localStorage.setItem("adminPanelTab", "Тесты");
            navigate('/adminpanel')
          } else {
            dispatch(setQuestionnairesState(questionnaires.map(
              (item) => {return (item.id === response.questionnaire.id ? response.questionnaire : item)}
            )));
            setIsPuttingLoading(false);
          }
        }).catch(error => {
          console.log(error.message);
        })
      }
    } else {
      navigate("/")
    }
  }

  const onDeleteQuestionnaire = (e) => {
    if (apiKey !== "") {
      setIsDeletingLoading(true);
      fetch(
        `${process.env.REACT_APP_HOST}/questionnaire/${params.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'X-Api-Key': apiKey
          }
        }
      ).then(response => {
        if (response.status === 403) {
          dispatch(setApiKey(""));
          dispatch(setUsername(""));
          navigate('/login')
          throw Error('status 403')
        }
      }).then(() => {
        dispatch(setQuestionnairesState(questionnaires.filter(item => {return item.id !== questionnaire.id})));
        localStorage.setItem("adminPanelTab", "Тесты");
        setIsDeletingLoading(false);
        navigate('/adminpanel')
      }).catch(error => {
        console.log(error.message);
      })
    } else {
      navigate("/")
    }
  }

  useEffect(() => {
    if (apiKey !== "") {
      if (questionnaire === null) {
        fetch(
          `${process.env.REACT_APP_HOST}/questionnaires`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
              'X-Api-Key': apiKey
            }
          }
        ).then(response => {
          if (response.status === 403) {
            dispatch(setApiKey(""));
            dispatch(setUsername(""));
            navigate('/login')
            throw Error('status 403')
          }
          return response.json()
        }).then((response) => {
          setIsLoading(false)
          if (response.questionnaires.filter(item => {return item.id === params.id}).length === 0) {
            setIsError(true);
            errorRef.current.setErrorText("! Опроса с таким кодом не существует");
            errorRef.current.changeErrorStatus(true);
          } else {
            let quest = response.questionnaires.filter(item => {return item.id === params.id})[0];
            setQuestionnaire(quest)
            dispatch(setQuestionnairesState(response.questionnaires));
            setQuestionnaireDeadline(quest.deadline)
            setQuestionnaireIsShow(quest.is_show)
          }
        }).catch(error => {
          console.log(error.message);
        })
      } else {
        setIsLoading(false);
      }
    } else {
      navigate("/")
    }
  }, [])

  return (<>{(isLoading && questionnaire === null) ?
      <div className={"loader_wrapper"}>
        <Loader/>
      </div>
      :
      <div className={"wrapper"}>
        {isDeletingQuestionnaireScreen &&
          <div className={"darked_background"}>
            <div className={"delete_questionnaire_container"}>
              <div className={"delete_questionnaire_container_block"}>
                <p className={"delete_questionnaire_container_block_text"}>Вы увeрены, что хотите удалить опрос?</p>
                <div className={"questionnaire_screen_delete_button_container"}>
                  {isDeletingLoading ?
                    <Loader loaderContainerStyle={{display: "block"}}/>
                    :
                    <Loader loaderContainerStyle={{display: "none"}}/>}
                  <div className={"questionnaire_screen_delete_button noselect"}
                       onClick={(e) => onDeleteQuestionnaire(e)}>Удалить опрос</div>
                </div>
              </div>
              <img className={"close_button"} src={`${process.env.PUBLIC_URL}/img/close_button.png`}
                   alt={"close"} onClick={(e) => setIsDeletingQuestionnaireScreen(false)}/>
            </div>
          </div>
        }
        <Header BGColor={"#491D0B"}/>
        <div className={"questionnaire_screen_container"}>
          <div className={"questionnaire_screen_button_container"}>
            <p className={"questionnaire_screen_button"}
               onClick={(e) => navigate("/adminpanel")}>В панель управления</p>
          </div>
          {isError ?
            <div className={"questionnaire_screen_error_container"}>
              <DefaultError ref={errorRef} statusError={false} color={"black"}/>
            </div>
            :
            <div className={"questionnaire_screen_block"}>
              <div className={"questionnaire_screen_info_container"}>
                <p className={"questionnaire_screen_info_header"}>Название</p>
                <p className={"questionnaire_screen_info_text"}>{questionnaire.title}</p>
              </div>
              <div className={"questionnaire_screen_info_container"}>
                <p className={"questionnaire_screen_info_header"}>Создан</p>
                <p className={"questionnaire_screen_info_text"}>{questionnaire.datetime}</p>
              </div>
              <div className={"questionnaire_screen_info_container"}>
                <p className={"questionnaire_screen_info_header"}>Код</p>
                <p className={"questionnaire_screen_info_text"}>{questionnaire.id}</p>
              </div>
              <div className={"questionnaire_screen_info_container"}>
                <p className={"questionnaire_screen_info_header"}>Прошло</p>
                <p className={"questionnaire_screen_info_text"}>{questionnaire.answers.length}</p>
              </div>
              <div className={"questionnaire_screen_info_container"}>
                <p className={"questionnaire_screen_info_header"}>Статус</p>
                {questionnaireIsShow !== null &&
                  <div className={"status_switch_container_wrapper"}>
                    <StatusSwitch selected={questionnaireIsShow}
                                     onStatusChange={onStatusChange}/>
                  </div>
                }
              </div>
              <div className={"questionnaire_screen_info_container"}>
                <p className={"questionnaire_screen_info_header"}>Дедлайн</p>
                <p className={"questionnaire_screen_info_text"}>{questionnaire.deadline !== null ?
                  <DefaultInput InputProps={{type: "datetime-local", max: "3000-01-01T12:00"}}
                                styleInput={{fontSize: "25px"}} isLine={false}
                                value={questionnaireDeadline} onChangeFunction={onQuestionnaireDateTimeChange}/>
                  : "*"}</p>
              </div>
              <div className={"questionnaire_screen_send_buttons_container"}>
                <div className={"questionnaire_screen_delete_button_container"}>
                  <div className={"questionnaire_screen_delete_button noselect"}
                       onClick={(e) => setIsDeletingQuestionnaireScreen(true)}>Удалить опрос</div>
                </div>
                <div className={"questionnaire_screen_delete_button_container"}>
                  {isPuttingLoading ?
                    <Loader loaderContainerStyle={{display: "block"}}/>
                    :
                    <Loader loaderContainerStyle={{display: "none"}}/>}
                  <div className={"questionnaire_screen_send_button noselect"} onClick={onPutQuestionnaire}>Изменить</div>
                </div>
              </div>
              <div className={"qr_code_container"}>
                <p className={"qr_code_text"}>QR-Код</p>
                <div className={"qr_code_img"}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${process.env.REACT_APP_HOST_OWN}/questionnaire/${questionnaire.id}`}
                       alt={"qr_code"}/>
                </div>
              </div>
              <CorrectQuestions questions={questionnaire.questions}/>
              <CorrectAnswers answers={questionnaire.answers} questions={questionnaire.questions}/>
            </div>
          }
        </div>
      </div>
  }</>)
}

export default QuestionnaireScreen;