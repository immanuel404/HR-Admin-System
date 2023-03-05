import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Employee from './pages/Employee/Index';
import EmployeeCreate from './pages/Employee/Create';
import EmployeeEdit from './pages/Employee/Edit';
import Department from './pages/Department/Index';
import DepartmentCreate from './pages/Department/Create';
import DepartmentEdit from './pages/Department/Edit';
import NotFound from './pages/NotFound';


function App() {
  return (
      <Router>
        <div className="App">
          <Navbar/>
          
          <Routes>          
              <Route path="/login" element={ <Login /> } />
              <Route path="/" element={ <Employee /> } />
              <Route path="/employee/create" element={ <EmployeeCreate /> } />
              <Route path="/employee/edit/:id" element={ <EmployeeEdit /> } />
              <Route path="/department" element={ <Department /> } />
              <Route path="/department/create" element={ <DepartmentCreate /> } />
              <Route path="/department/edit/:id" element={ <DepartmentEdit /> } />
              <Route path="*" element={ <NotFound /> } />
          </Routes>
        </div>
      </Router>
  );
}

export default App;