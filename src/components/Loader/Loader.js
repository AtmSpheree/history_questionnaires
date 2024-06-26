import {useEffect, useState} from "react";
import './Loader.css';

function Loader(props) {

  return (
    <div className={"loader_container"} style={props.loaderContainerStyle}>
      <div className={"loader"} style={props.loaderStyle}></div>
    </div>)
}

Loader.defaultProps = {
  loaderStyle: {
    width: "28px",
    height: "28px"
  },
  loaderContainerStyle: {

  }
}

export default Loader;
