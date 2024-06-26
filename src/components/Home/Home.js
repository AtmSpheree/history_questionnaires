import {useEffect, useState} from "react";
import Header from "../Header/Header";
import './Home.css';
import EnterCodeField from "../EnterCodeField/EnterCodeField";

function Home() {
  document.body.style.backgroundColor = "#481c0a"

  return (<div className={"wrapper"}>
    <img src={`${process.env.PUBLIC_URL}/img/continents_background_dark.png`} alt={"continents_bg"}
         className={"background_image"}/>
    <Header/>
    <div className={"enter_code_container"}>
      <p className={"enter_code_container__title noselect"}>Тесты по истории</p>
      <p className={"enter_code_container__description noselect"}>Для контроля знаний школьников МОУ СОШ №17</p>
      <EnterCodeField/>
    </div>
  </div>)
}

export default Home;
