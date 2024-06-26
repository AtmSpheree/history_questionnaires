import {forwardRef, useImperativeHandle, useEffect, useRef, useState} from "react";
import './DefaultError.css';

const DefaultError = forwardRef((props,
                                 ref) => {
  const [textStyle, setTextStyle] = useState({color: props.color, fontSize: props.fontSize});
  const [status, setStatus] = useState(props.statusError)
  let tempLineStyle = {backgroundColor: props.color};
  let tempTextContainerStyle = {};
  if (!status) {
    tempLineStyle = {...tempLineStyle, width: "0", top: "0"};
    tempTextContainerStyle = {...tempTextContainerStyle, opacity: "0"};
  }
  const [lineStyle, setLineStyle] = useState(tempLineStyle);
  const [textContainerStyle, setTextContainerStyle] = useState(tempTextContainerStyle)
  const [textHeight, setTextHeight] = useState(0);
  const [text, setText] = useState(props.text)
  const [tempStatus, setTempStatus] = useState(props.statusError);
  const lineRef = useRef(null);
  const textContainerRef = useRef(null);

  useEffect(() => {
    setTextHeight(textContainerRef.current.offsetHeight)
    setStatus(tempStatus)
  }, [text])

  useEffect(() => {
    if (status) {
      setLineStyle({...lineStyle, width: "100%"});
      setTimeout(() => {
        setLineStyle({...lineStyle, width: "100%", top: `${textHeight + 10}px`});
        setTextContainerStyle({...textContainerStyle, height: `${textHeight + 7}px`})
      }, 300)
    } else {
      setLineStyle({...lineStyle, top: `0px`});
      setTextContainerStyle({...textContainerStyle, height: `0px`})
      setTimeout(() => {
        setLineStyle({...lineStyle, width: "0%", top: `0px`});
      }, 300)
    }
  }, [status])

  useEffect(() => {
    if (status) {
      setLineStyle({...lineStyle, width: "100%", top: `${textHeight + 5}px`});

      setTextContainerStyle({...textContainerStyle, height: "100%"})
    } else {
      setLineStyle({...lineStyle, width: "0%", top: "0px"});

      setTextContainerStyle({...textContainerStyle, opacity: "1", height: "0"})
    }
  }, [])

  useImperativeHandle(ref, () => ({
    changeErrorStatus(stat) {
      setTempStatus(stat)
    },
    getErrorStatus() {
      return status
    },
    setErrorText(tex) {
      setText(tex);
    }
  }));

  return (
    <div className={"default_error_container"}>
    <div className={"default_error_text_container"} style={textContainerStyle}>
      <p className={"default_error_text"} style={textStyle} ref={textContainerRef}>{text}</p>
    </div>
    <div className="default_error_line" style={lineStyle} ref={lineRef}></div>
  </div>)
})

DefaultError.defaultProps = {
  color: "white",
  text: "Ошибка",
  fontSize: "30px",
  statusError: true
}

export default DefaultError;
