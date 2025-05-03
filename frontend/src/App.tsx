import logo from './logo.svg';
import './App.css';
import { Router, Route, Routes } from 'react-router-dom';
import RegistrationForm from './pages/Registration';
import { ToastContainer } from "react-toastify";
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const home = <h1>Home</h1>;
  return (
    <>
    <Routes>
      <Route path="/" Component={RegistrationForm} />
      <Route path="/login" Component={Login} />
      <Route path="/dashboard" Component={Dashboard} />
    
    </Routes>
    <ToastContainer position='top-left' />
    </>
  );
}

export default App;
