import './VariantButton.css'
import {useState, forwardRef, useImperativeHandle, useEffect} from "react";

function VariantButton(props){
  return (<>
    {!props.isClicked ?
        <div className={"variant_button"}
             onClick={(e) => {props.onClickFunction(e.target.textContent, props.isClicked)}}
             style={{fontSize: props.fontSize}}>{props.text}</div>
    :
        <div className={"variant_button"}
             onClick={(e) => {props.onClickFunction(e.target.textContent, props.isClicked)}}
             style={{fontSize: props.fontSize, backgroundColor: "#C14D1D", color: "white"}}>{props.text}</div>
    }
  </>)
}

VariantButton.defaultProps = {
  text: "",
  fontSize: "30px",
  isClicked: false,
  onClickFunction: (e, isButtonClicked, setIsButtonClicked) => {}
}

export default VariantButton;