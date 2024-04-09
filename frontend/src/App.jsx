import Home from './pages/Home';
import Chat from './pages/Chat';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import './App.css'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom'


function App() {

  return (
    <div className='App'>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
