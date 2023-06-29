import React from 'react';
import {Routes,Route} from "react-router-dom";
import Login from './pages/Login';
import Home from './pages/Home';
import Testing from './pages/Testing';

function App(){
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/home' element={<Home />} />
      <Route path='/test' element={<Testing />} />
    </Routes>
  )
}

export default App;

