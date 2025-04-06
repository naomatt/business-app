import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './components/Home';
import Com from './components/com/Com';
import ComEdit from './components/com/ComEdit';
import NewCom from './components/com/NewCom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />}/>
          <Route path="/Com" element={<Com />}/>
          <Route path="/ComEdit" element={<ComEdit />}/>
          <Route path="/ComEdit/:id" element={<ComEdit />}/>
          <Route path="/NewCom" element={<NewCom />}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;