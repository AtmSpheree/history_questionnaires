import './App.css';
import Home from '../Home/Home'
import Login from "../Login/Login";
import {Route, Routes} from "react-router";
import AdminPanel from "../AdminPanel/AdminPanel";
import SendAnswer from "../SendAnswer/SendAnswer";
import QuestionnaireScreen from "../QuestionnaireScreen/QuestionnaireScreen";
import NotFound from "../NotFound/NotFound";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/adminpanel" element={<AdminPanel/>}/>
        <Route path="/adminpanel/:id" element={<QuestionnaireScreen/>}/>
        <Route path="/questionnaire/:id" element={<SendAnswer/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </div>
  )
}

export default App;
