import './AnswerContainer.css'
import {useState, useEffect} from "react";
import VariantsButtonGroup from "../../Buttons/VariantsButtonGroup/VariantsButtonGroup";

function AnswerContainer(props) {
  const [answerData, setAnswerData] = useState({question: props.question, answer: null});

  const onClickFunctionCallback = (answer) => {
    setAnswerData({...answerData, answer: answer})
    props.onAnswerChangeFunction({...answerData, answer: answer})
  }

  return (
    <div className={"answer_container"}>
      <p className={"answer_title"}>{props.question}</p>
      <div className={"answer_variants_container"}>
        <VariantsButtonGroup onClickFunctionCallback={onClickFunctionCallback} variants={props.variants}
                             clicked={props.previousVariant}/>
      </div>
    </div>
  )
}

AnswerContainer.defaultProps = {
  question: "",
  variants: [],
  onAnswerChangeFunction: (answerData) => {},
  previousVariant: null
}

export default AnswerContainer;