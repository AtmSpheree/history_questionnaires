import './AnswersContainer.css'
import {useState, useEffect} from "react";
import AnswerContainer from "../AnswerContainer/AnswerContainer";

function shuffle(array) {
  let result = array;
  for (let i = result.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result
}

function AnswersContainer(props) {
  const [answerData, setAnswerData] = useState({});
  const [questions, setQuestions] = useState(null);

  const onAnswerChangeFunction = (data) => {
    let question = data.question;
    let answer = data.answer;
    let newAnswerData = answerData;
    if (Object.hasOwn(newAnswerData, question) && answer === null) {
      delete newAnswerData[question];
    } else {
      newAnswerData[question] = answer;
    }
    setAnswerData(newAnswerData)
    if (localStorage.getItem("sendAnswers") !== null) {
      localStorage.setItem("sendAnswers", JSON.stringify({...JSON.parse(localStorage.getItem("sendAnswers")), answers: answerData, id: props.questionnaire.id}))
    } else {
      localStorage.setItem("sendAnswers", JSON.stringify({answers: answerData, id: props.questionnaire.id}))
    }
    props.onSetAnswersCallback(newAnswerData);
  }

  useEffect(() => {
    let tempQuestions = null;
    if (props.questionnaire !== null) {
      tempQuestions = props.questionnaire.questions.map((question) => {return {question: question.question,
                                                                                    variants: shuffle(question.variants)}})
      setQuestions(tempQuestions);
    }
  }, [props.questionnaire])

  return (<>
    {questions !== null &&
      <div className={"answers_container"}>
        {questions.map((question, index) => <AnswerContainer key={index}
                                                             question={question.question}
                                                             variants={question.variants}
                                                             previousVariant={props.sendAnswers !== null &&
                                                                              Object.hasOwn(props.sendAnswers, question.question) ? props.sendAnswers[question.question] : null}
                                                             onAnswerChangeFunction={onAnswerChangeFunction}/>)}
      </div>
    }
  </>)
}

AnswersContainer.defaultProps = {
  questionnaire: null,
  id: null,
  sendAnswers: null,
  onSetAnswersCallback: (answers) => {}
}

export default AnswersContainer;