import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Com from './components/Com';
import ComEdit from './components/ComEdit';
import NewCom from './components/NewCom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/Com" element={<Com />}/>
        <Route path="/ComEdit" element={<ComEdit />}/>
        <Route path="/NewCom" element={<NewCom />}/>
      </Routes>
    </Router>
  );
}

export default App;