import './DefaultButton.css';

function DefaultButton(props) {
  const buttonStyle = {color: props.color, fontSize: props.fontSize}
  const lineStyle = {backgroundColor: props.color}

  return (<div className={props.classNameButton}>
    <a type="button" className={`default_button noselect ${props.classNameA}`}
       style={props.classNameA === "" ? buttonStyle : {}} onClick={props.onClickFunction}>{props.text}</a>
    <div className="default_button_line" style={lineStyle}></div>
  </div>)
}

DefaultButton.defaultProps = {
  color: "white",
  text: "Перейти",
  fontSize: "30px",
  onClickFunction: () => {return null},
  classNameButton: "",
  classNameA: ""
}

export default DefaultButton;
