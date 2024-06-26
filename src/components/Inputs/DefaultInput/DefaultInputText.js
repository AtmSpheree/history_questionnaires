import {useEffect, useState} from "react";
import './DefaultInputText.css';

function DefaultInputText(props) {
  const [imgStyle, setImgStyle] = useState({})
  const [lineStyle, setLineStyle] = useState({backgroundColor: props.underlineColor})

  useEffect(() => {
    if (props.value !== "") {
      setImgStyle({filter: "none"})
      setLineStyle({...lineStyle, width: "100%"})
    } else {
      setImgStyle({})
      setLineStyle({...lineStyle, width: "0"})
    }
  }, [props.value])

  return (
    <div className={`default_input_text_container ${props.classNameContainer}`} style={props.styleContainer}>
      {props.src !== null &&
        <img src={props.src} alt={"input_icon"} className={"default_input_text_image noselect"} style={imgStyle}/>
      }
      <div className={"default_input_text_container__second"}>
        <input type={"text"} className={`default_input_text ${props.classNameInput}`} {...props.InputProps}
               value={props.value} onChange={(e) => {props.onChangeFunction(e)}} style={props.styleInput}/>
        {props.isLine &&
          <div className={"default_input_text_line"} style={lineStyle}></div>
        }
      </div>
    </div>)
}

DefaultInputText.defaultProps = {
  InputProps: {
    color: "black",
    placeholder: "Введите текст"
  },
  styleInput: {

  },
  classNameInput: "",
  classNameContainer: "",
  styleContainer: {

  },
  src: null,
  underlineColor: "#C14D1D",
  isLine: true
}

export default DefaultInputText;
