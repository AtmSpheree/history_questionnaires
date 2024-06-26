import "./NotFound.css"
import Header from "../Header/Header";

function NotFound(props) {
  return (
    <div className={"wrapper"}>
      <Header BGColor={"#491D0B"}/>
      <p className={"not_found_text"}>Страница не найдена (404)</p>
    </div>
  )
}

export default NotFound;