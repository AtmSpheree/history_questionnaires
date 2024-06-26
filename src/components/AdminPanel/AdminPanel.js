import {useState, useEffect, useRef} from "react"
import './AdminPanel.css';
import Loader from "../Loader/Loader";
import Header from "../Header/Header";
import DefaultInput from "../Inputs/DefaultInput/DefaultInputText";
import DefaultButton from "../Buttons/DefaultButton/DefaultButton";
import DefaultError from "../Errors/DefaultError/DefaultError";
import {useDispatch, useSelector} from "react-redux";
import {selectApiKey, set as setApiKey} from "../../features/ApiKey/ApiKey";
import {selectQuestionnaires, set as setQuestionnairesState} from "../../features/Questionnaires/Questionnaires";
import {useNavigate} from "react-router-dom";
import {set as setUsername} from "../../features/Username/Username";
import questionnairesSelectedFilterVariant, {selectQuestionnairesSelectedFilterVariant, set as setQuestionnairesSelectedFilterVariant} from "../../features/QuestionnairesSelectedFilterVariant/QuestionnairesSelectedFilterVariant";
import questionnairesSelectedFilterOrder, {selectQuestionnairesSelectedFilterOrder, set as setQuestionnairesSelectedFilterOrder} from "../../features/QuestionnairesSelectedFilterOrder/QuestionnairesSelectedFilterOrder";
import SwitchContainer from "../SwitchContainer/SwitchContainer";
import FilterContainer from "../FilterContainer/FilterContainer";

function parseYMDHM(s) {
  let b = s.split(/\D+/);
  return new Date(b[0], --b[1], b[2], b[3], b[4], b[5]||0, b[6]||0);
}

function compare(a, b) {
  if (a > b) return 1;
  if (a === b) return 0;
  if (a < b) return -1;
}

function Question(props) {
  document.body.style.backgroundColor = "white"

  return (
    <div className={"question_container"}>
      <div className={"question_block"}>
        <p className={"question_container_text"}>Вопрос: "{props.title}"</p>
        <div className={"question_container_category"}>
          <p className={"question_container_text question_container_header"}>Варианты<br/>ответа:</p>
          <div className={"question_container_category_item"}>
            <p className={"question_container_text"}>1. {props.variant1}</p>
            <p className={"question_container_text"}>2. {props.variant2}</p>
            <p className={"question_container_text"}>3. {props.variant3}</p>
          </div>
        </div>
        <div className={"question_container_category"}>
          <p className={"question_container_text question_container_header"}>Правильный<br/>ответ:</p>
          <p className={"question_container_text"}>4. {props.correct}</p>
        </div>
      </div>
      <img className={"add_question_container_close_button"} src={`${process.env.PUBLIC_URL}/img/close_button_dark.png`}
           alt={"close"} onClick={(e) => {props.onDeleteQuestion(props.ident)}}/>
    </div>
  )
}

function QuestionnaireItem(props) {
  const navigate = useNavigate();

  return (<div className={"questionnaire_container_item"}
               onClick={(e) => navigate(`/adminpanel/${props.item.id}`)}>
    <div className={"questionnaire_container_item__title questionnaire_container_item_wrapper"}>
      <p className={"questionnaire_container_item_header"}>Название</p>
      <p className={"questionnaire_container_item__text"}>{props.item.title}</p>
    </div>
    <div className={"questionnaire_container_item__datetime questionnaire_container_item_wrapper"}>
      <p className={"questionnaire_container_item_header"}>Дата</p>
      <p className={"questionnaire_container_item__text"}>{props.item.datetime}</p>
    </div>
    <div className={"questionnaire_container_item__deadline questionnaire_container_item_wrapper"}>
      <p className={"questionnaire_container_item_header"}>Дедлайн</p>
      <p className={"questionnaire_container_item__text"}>{props.item.deadline ? props.item.deadline : "*"}</p>
    </div>
    <div className={"questionnaire_container_item__code questionnaire_container_item_wrapper"}>
      <p className={"questionnaire_container_item_header"}>Код</p>
      <p className={"questionnaire_container_item__text"}>{props.item.id}</p>
    </div>
    <div className={"questionnaire_container_item__count questionnaire_container_item_wrapper"}>
      <p className={"questionnaire_container_item_header"}>Прошло</p>
      <p className={"questionnaire_container_item__text"}>{props.item.answers.length}</p>
    </div>
    <div className={"questionnaire_container_item__status questionnaire_container_item_wrapper"}>
      <p className={"questionnaire_container_item_header"}>Статус</p>
      <p className={"questionnaire_container_item__text"}>
        <p className={"questionnaire_container_item__text_status"}>
          {props.item.is_show ?
            "Открыт"
          :
            "Закрыт"
          }
        </p>
        {props.item.is_show ?
          <img src={`${process.env.PUBLIC_URL}/img/icons/ellipse_correct.svg`} className={"status_svg_img"} alt={"true"}/>
        :
          <img src={`${process.env.PUBLIC_URL}/img/icons/ellipse_wrong.svg`} className={"status_svg_img"} alt={"false"}/>
        }
      </p>
    </div>
  </div>)
}

function AdminPanel() {
  document.body.style.backgroundColor = "white"

  const [isLoading, setIsLoading] = useState(true);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [clickedButton, setClickedButton] = useState(localStorage.getItem("adminPanelTab") ?? "Добавить тест");
  const questionnaires = useSelector(selectQuestionnaires)
  const apiKey = useSelector(selectApiKey);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const switchRef = useRef();

  const [questionnaireTitle, setQuestionnaireTitle] = useState("");
  const [questionnaireDateTime, setQuestionnaireDateTime] = useState("");
  const [questionnaireIsHide, setQuestionnaireIsHide] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionVariant1, setQuestionVariant1] = useState("");
  const [questionVariant2, setQuestionVariant2] = useState("");
  const [questionVariant3, setQuestionVariant3] = useState("");
  const [questionCorrect, setQuestionCorrect] = useState("");
  const questionErrorRef = useRef(null);
  const questionnaireErrorRef = useRef(null);
  const titleErrorRef = useRef(null);
  const dateTimeErrorRef = useRef(null);
  const [isDateTimeValid, setIsDateTimeValid] = useState(false);
  const selectedFilterVariant = useSelector(selectQuestionnairesSelectedFilterVariant)
  const selectedFilterOrder = useSelector(selectQuestionnairesSelectedFilterOrder)

  const onSwitchChange = (button) => {
    setClickedButton(button);
    localStorage.setItem("adminPanelTab", button)
  }

  const onQuestionnaireDateTimeChange = (e) => {
    if (e.target.validity.valid && !e.target.validity.valueMissing && !e.target.validity.badInput) {
      setIsDateTimeValid(true);
    } else {
      setIsDateTimeValid(false);
    }
    setQuestionnaireDateTime(e.target.value);
  }

  const onDeleteQuestion = (ident) => {
    setQuestions(questions.filter((value, index) => index !== ident))
  }

  const onAddQuestion = () => {
    let tempSet = new Set([questionVariant1, questionVariant2, questionVariant3, questionCorrect])
    if (tempSet.size !== 4) {
      questionErrorRef.current.changeErrorStatus(true);
      questionErrorRef.current.setErrorText("! Варианты ответов должны различаться")
      return
    } else if (questions.map(quest => quest.title).indexOf(questionTitle) !== -1) {
      questionErrorRef.current.changeErrorStatus(true);
      questionErrorRef.current.setErrorText("! Вы уже добавили такой вопрос")
      return
    } else {
      questionErrorRef.current.changeErrorStatus(false);
    }
    setTimeout(() => {
      let elem = {title: questionTitle, variant1: questionVariant1, variant2: questionVariant2,
        variant3: questionVariant3, correct: questionCorrect}
      let tempQuestions = questions;
      tempQuestions.push(elem);
      setQuestions(tempQuestions)
      setQuestionTitle("");
      setQuestionVariant1("");
      setQuestionVariant2("");
      setQuestionVariant3("");
      setQuestionCorrect("");
      setIsAddingQuestion(false);
    }, 500)
  }

  const getQuestionnaires = () => {
    if (apiKey !== "") {
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
        dispatch(setQuestionnairesState(response.questionnaires))
        onChangeQuestionnairesContainer(response.questionnaires, selectedFilterVariant, selectedFilterOrder)
        setIsLoading(false)
      }).catch(error => {
        console.log(error.message);
      })
    } else {
      navigate("/")
    }
  }

  const onAddQuestionnaire = (e) => {
    let isError = false;
    if (questionnaireTitle === "") {
      titleErrorRef.current.changeErrorStatus(true);
      titleErrorRef.current.setErrorText("! Заполните поле")
      isError = true;
    } else {
      titleErrorRef.current.changeErrorStatus(false);
    }
    let now = new Date();
    if (questionnaireDateTime !== "" && (!isDateTimeValid || (parseYMDHM(questionnaireDateTime) <= now))) {
      dateTimeErrorRef.current.changeErrorStatus(true);
      dateTimeErrorRef.current.setErrorText("! Некорректная дата и время")
      isError = true;
    } else {
      dateTimeErrorRef.current.changeErrorStatus(false);
    }
    if (questions.length === 0) {
      questionnaireErrorRef.current.changeErrorStatus(true);
      questionnaireErrorRef.current.setErrorText("! Нельзя создать тест без вопросов")
      isError = true;
    } else {
      questionnaireErrorRef.current.changeErrorStatus(false);
    }
    if (isError) {
      return
    }
    let deadline = "";
    if (questionnaireDateTime !== "") {
      deadline = parseYMDHM(questionnaireDateTime);
      deadline = `${deadline.getFullYear()}-${("0" + (deadline.getMonth() + 1)).slice(-2)}-${("0" + deadline.getDate()).slice(-2)} ${("0" + deadline.getHours()).slice(-2)}:${("0" + deadline.getMinutes()).slice(-2)}:${("0" + deadline.getSeconds()).slice(-2)}`
    }
    setIsAddLoading(true);
    fetch(
      `${process.env.REACT_APP_HOST}/questionnaire`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'X-Api-Key': apiKey
        },
        body: JSON.stringify({
          title: questionnaireTitle,
          deadline: deadline,
          is_show: +(!questionnaireIsHide),
          questions: questions.map(value => {return {question: value.title,
            variants: [value.variant1, value.variant2, value.variant3, value.correct],
            correct_answer: value.correct}})
        })
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
      if (Object.hasOwn(response, "errors")) {
        console.log(response.errors)
        throw Error(`status 400, errors: ${response.errors}`)
      }
      setIsAddLoading(false);
      setQuestionnaireTitle("");
      setQuestionnaireDateTime("");
      setIsDateTimeValid(false);
      setQuestionnaireIsHide(true);
      setQuestions([]);
      getQuestionnaires();
      setClickedButton("Тесты")
      switchRef.current.setClickedButton("Тесты");
    }).catch(error => {
      setIsAddLoading(false);
      console.log(error.message);
    })
  }

  const onChangeQuestionnairesContainer = (tempQuests, variant, order) => {
    if (tempQuests) {
      let quests = [...tempQuests];
      if (variant === "Названию") {
        quests.sort((a, b) => compare(a.title.toLowerCase(), b.title.toLowerCase()))
      } else if (variant === "Дате") {
        quests.sort((a, b) => compare(a.datetime, b.datetime))
      } else if (variant === "Дедлайну") {
        quests.sort((a, b) => compare(a.deadline, b.deadline))
      } else if (variant === "Количеству") {
        quests.sort((a, b) => compare(a.answers.length, b.answers.length))
      } else if (variant === "Статусу") {
        quests.sort((a, b) => compare(+a.is_show, +b.is_show))
      }
      if (order === "Убыванию") {
        quests = quests.reverse();
      }
        dispatch(setQuestionnairesState(quests))
    }
  }

  const onFilterVariantsChange = (variant) => {
    dispatch(setQuestionnairesSelectedFilterVariant(variant))
    onChangeQuestionnairesContainer(questionnaires, variant, selectedFilterOrder);
  }

  const onFilterOrderChange = (order) => {
    dispatch(setQuestionnairesSelectedFilterOrder(order))
    onChangeQuestionnairesContainer(questionnaires, selectedFilterVariant, order);
  }

  useEffect(() => {
    if (questionnaires === null) {
      getQuestionnaires();
    }
  }, [])

  return (<>{(isLoading && questionnaires === null) ?
    <div className={"loader_wrapper"}>
      <Loader/>
    </div>
    :
    <div className={"wrapper"}>
      {isAddingQuestion &&
        <div className={"darked_background"}>
          <div className={"add_question_container"}>
            <div className={"add_question_container_block"}>
              <p className={"add_questionnaire_container_text"}>Добавить вопрос</p>
              <div className={"add_questionnaire_field_container"}>
                <p className={"add_questionnaire_field_text"}>Название</p>
                <div className={"add_question_input_container"}>
                  <DefaultInput InputProps={{maxLength: 50, placeholder: "Первым канцлером Германии был:..."}}
                                classNameInput={"add_questionnaire_input_custom"} classNameContainer={"add_questionnaire_input_container_custom"}
                                value={questionTitle} onChangeFunction={(e) => setQuestionTitle(e.target.value)}/>
                </div>
              </div>
              <div className={"add_questionnaire_field_container"}>
                <p className={"add_questionnaire_field_text"}>Варианты ответа</p>
                <div className={"add_question_input_container"}>
                  <DefaultInput InputProps={{maxLength: 50, placeholder: "Ответ..."}}
                                classNameInput={"add_questionnaire_input_custom"} classNameContainer={"add_questionnaire_input_container_custom"}
                                value={questionVariant1} onChangeFunction={(e) => setQuestionVariant1(e.target.value)}/>
                </div>
                <div className={"add_question_input_container"}>
                  <DefaultInput InputProps={{maxLength: 50, placeholder: "Ответ..."}}
                                classNameInput={"add_questionnaire_input_custom"} classNameContainer={"add_questionnaire_input_container_custom"}
                                value={questionVariant2} onChangeFunction={(e) => setQuestionVariant2(e.target.value)}/>
                </div>
                <div className={"add_question_input_container"}>
                  <DefaultInput InputProps={{maxLength: 50, placeholder: "Ответ..."}}
                                classNameInput={"add_questionnaire_input_custom"} classNameContainer={"add_questionnaire_input_container_custom"}
                                value={questionVariant3} onChangeFunction={(e) => setQuestionVariant3(e.target.value)}/>
                </div>
              </div>
              <div className={"add_questionnaire_field_container"}>
                <p className={"add_questionnaire_field_text"}>Правильный ответ</p>
                <div className={"add_question_input_container"}>
                  <DefaultInput InputProps={{maxLength: 50, placeholder: "Ответ..."}}
                                classNameInput={"add_questionnaire_input_custom"} classNameContainer={"add_questionnaire_input_container_custom"}
                                value={questionCorrect} onChangeFunction={(e) => setQuestionCorrect(e.target.value)}/>
                </div>
              </div>
              <div className={"add_question_button_container"}>
                <DefaultButton color={"black"} classNameA={"add_question_button_custom"} text={"Добавить вопрос"}
                               onClickFunction={(e) => {onAddQuestion()}}/>
              </div>
              <div className={"add_question_button_container"}>
                <DefaultError ref={questionErrorRef} statusError={false} color={"black"} fontSize={"25px"}/>
              </div>
            </div>
            <img className={"close_button"} src={`${process.env.PUBLIC_URL}/img/close_button.png`}
                 alt={"close"} onClick={(e) => setIsAddingQuestion(false)}/>
          </div>
        </div>
      }
      <Header BGColor={"#491D0B"}/>
      <SwitchContainer buttons={["Добавить тест", "Тесты"]} clicked={clickedButton} ref={switchRef}
                       styleContainer={{marginTop: "20px"}} classNameButton={"switch_container_custom_button"}
                       onSwitchChange={onSwitchChange}/>
      {clickedButton === "Добавить тест" &&
        <div className={"add_questionnaire_container"}>
          <p className={"add_questionnaire_container_text"}>Добавить тест</p>
          <div className={"add_questionnaire_field_container"}>
            <p className={"add_questionnaire_field_text"}>Название</p>
            <div className={"add_questionnaire_input_container"}>
              <DefaultInput InputProps={{maxLength: 50, placeholder: "Тест №8..."}}
                            classNameInput={"add_questionnaire_input_custom"} classNameContainer={"add_questionnaire_input_container_custom"}
                            value={questionnaireTitle} onChangeFunction={(e) => setQuestionnaireTitle(e.target.value)}/>
            </div>
            <div className={"add_question_button_container"}>
              <DefaultError ref={titleErrorRef} statusError={false} color={"black"} fontSize={"25px"}/>
            </div>
          </div>
          <div className={"add_questionnaire_field_container"}>
            <p className={"add_questionnaire_field_text"}>Дата окончания теста (необязательно)</p>
            <div className={"add_questionnaire_input_container"}>
              <DefaultInput InputProps={{type: "datetime-local", max: "3000-01-01T12:00"}}
                            classNameInput={"add_questionnaire_input_custom"} classNameContainer={"add_questionnaire_input_container_custom"}
                            value={questionnaireDateTime} onChangeFunction={onQuestionnaireDateTimeChange}/>
            </div>
            <div className={"add_question_button_container"}>
              <DefaultError ref={dateTimeErrorRef} statusError={false} color={"black"} fontSize={"25px"}/>
            </div>
          </div>
          <div className={"add_questionnaire_checkbox_container"}>
            <input type={"checkbox"} id={"is_hide_checkbox"}
                   defaultChecked={questionnaireIsHide} onChange={(e) => {setQuestionnaireIsHide(e.target.checked)}}/>
            <label htmlFor={"is_hide_checkbox"}></label>
            <label className={"add_questionnaire_field_text"} htmlFor={"is_hide_checkbox"}>Скрыть тест?</label>
          </div>
          <p className={"add_questionnaire_container_text"}>Вопросы:</p>
          {questions.map((elem, index) =>
            <Question title={elem.title} variant1={elem.variant1} variant2={elem.variant2}
                      variant3={elem.variant3} correct={elem.correct} key={index}
                      ident={index} onDeleteQuestion={onDeleteQuestion}/>)
          }
          <div className={"add_question_button"} onClick={(e) => setIsAddingQuestion(true)}>Добавить вопрос (+)</div>
          <div className={"add_question_button_container"}>
            {isAddLoading ?
              <Loader loaderContainerStyle={{display: "block", marginRight: "10px"}}/>
              :
              <Loader loaderContainerStyle={{display: "none", marginRight: "10px"}}/>}
            <DefaultButton color={"black"} onClickFunction={(e) => {onAddQuestionnaire(e)}} text={"Добавить тест"}
                           classNameA={"add_questionnaire_button"}/>
          </div>
          <div className={"add_question_button_container"}>
            <DefaultError ref={questionnaireErrorRef} statusError={false} color={"black"} fontSize={"25px"}/>
          </div>
        </div>
      }
      {(clickedButton === "Тесты" && questionnaires.length > 0) &&
        <>
          <FilterContainer className={"questionnaires_variants_filter"} selected={selectedFilterVariant}
                           variants={["Названию", "Дате", "Дедлайну", "Количеству", "Статусу"]}
                           onChangeFunction={onFilterVariantsChange}/>
          <FilterContainer className={"questionnaires_order_filter"} selected={selectedFilterOrder}
                           variants={["Возрастанию", "Убыванию"]}
                           onChangeFunction={onFilterOrderChange}/>
          <div className={"questionnaires_container"}>
            <div className={"questionnaire_container_header"}>
              <div className={"questionnaire_container_item__title"}>Название</div>
              <div className={"questionnaire_container_item__datetime"}>Дата</div>
              <div className={"questionnaire_container_item__deadline"}>Дедлайн</div>
              <div className={"questionnaire_container_item__code"}>Код</div>
              <div className={"questionnaire_container_item__count"}>Прошло</div>
              <div className={"questionnaire_container_item__status"}>Статус</div>
            </div>
            {questionnaires.map(item => <QuestionnaireItem item={item}/>)}
          </div>
        </>
      }
    </div>
  }</>)
}

export default AdminPanel;
