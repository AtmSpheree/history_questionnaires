import './VariantsButtonGroup.css'
import {useState, useEffect, forwardRef, useImperativeHandle} from "react";
import VariantButton from "../VariantButton/VariantButton";

function VariantsButtonGroup(props) {
  const [buttons, setButtons] = useState(props.variants.map(variant => {return {text: variant, isClicked: variant === props.clicked}}));

  const onClickFunction = (text, isButtonClicked) => {
    if (isButtonClicked) {
      props.onClickFunctionCallback(null)
      setButtons(buttons.map(button => {return {text: button.text, isClicked: false}}))
    } else {
      props.onClickFunctionCallback(text)
      setButtons(buttons.map(button => {return {text: button.text, isClicked: button.text === text}}))
    }
  }

  return (
    <div className={"variants_container"}>
      {buttons.map((button) => <VariantButton key={button.text} text={button.text}
                                              isClicked={button.isClicked}
                                              onClickFunction={onClickFunction}/>)}
    </div>
  )
}

export default VariantsButtonGroup;