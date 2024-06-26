import './SwitchContainer.css'
import {forwardRef, useEffect, useImperativeHandle, useState} from "react";

function SwitchButton(props) {
  return (
    <div className={`switch_button noselect ${props.className}`} onClick={e => props.onButtonClick(props.text)}
         style={props.isClicked ? {backgroundColor: "#903814", color: "white"} : {}}>
      {props.text}
    </div>
  )
}

const SwitchContainer = forwardRef((props, ref) => {
  const [buttons, setButtons] = useState(props.buttons.map(button => {return {text: button,
                                                                              isClicked: button === props.clicked}}));

  const onButtonClick = (text) => {
    setButtons(buttons.map(button => {return {text: button.text, isClicked: button.text === text}}))
    props.onSwitchChange(text)
  }

  useImperativeHandle(ref, () => ({
    setClickedButton(text) {
      setButtons(buttons.map(button => {return {text: button.text, isClicked: button.text === text}}))
    }
  }))

  return (<div className={"switch_container"} style={props.styleContainer}>
    {buttons.map((button, index) => <SwitchButton key={button.text} text={button.text} isClicked={button.isClicked}
                                                  className={props.classNameButton} onButtonClick={onButtonClick}/>)}
  </div>)
})

export default SwitchContainer;