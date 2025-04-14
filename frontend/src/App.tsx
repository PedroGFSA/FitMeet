import { Routes, Route, Outlet } from 'react-router'
import './App.css'
import AuthContainer from './components/AuthContainer'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'

function App() {

  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/' element={<><AuthContainer><Outlet/></AuthContainer></>}>
        <Route path='home' element={<Home />} />
        <Route path="activities">
          <Route index element={<h1>Activities</h1>} />
          <Route path=":id" element={<h1 className="text-3xl text-blue-500">Activity</h1>} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
