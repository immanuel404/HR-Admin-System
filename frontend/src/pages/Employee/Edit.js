import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// MUI->INPUT&BUTTON
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
// MUI->ALERT
import Alert from '@mui/material/Alert';
// TOAST-NOTIFICATION-UI
import 'material-react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
window.Swal = Swal;
const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
})
window.toast = toast;


const Edit = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [empManager, setEmpManager] = useState('');
  const [status, setStatus] = useState('');
  // USER-INFO
  const userName = useRef("");
  const userRole = useRef("");
  const userToken = useRef("");
  const [disableBtn, setDisableBtn] = useState(false);
  // MANAGERS DROPDOWN LIST
  const [empManagerList, setEmpManagerList] = useState([]);
  // EMPLOYEE ROLE
  const [role, setRole] = useState('');
  // ERROR MESSAGE
  const [errorMsg, setErrorMsg] = useState('');
  // URL-PARAMETER & NAVIGATION
  const [param, setParam] = useState('');
  const navigate = useNavigate();


  useEffect(()=> {
    // GET URL-PARAMETER
    let urlSplit = window.location.href.split("/");
    let getParam = urlSplit.length-1; const id = urlSplit[getParam];
    setParam(id);
    // GET AUTHORIZED USER-DATA
    const userStorageInfo = localStorage.getItem("userData");
    let splitInfo = userStorageInfo.split("+");
    const user_id = splitInfo[0];
    userName.current = splitInfo[1];
    userRole.current = splitInfo[2];
    userToken.current = splitInfo[3];

    // AUTHORIZE USER
    const Authorize = async () => {
      if(userStorageInfo){
        // disable change status-btn->unauthorized
        if(userRole.current==="Employee" || userRole.current==="Manager"){
          setDisableBtn(true);
        }
        // employee can only edit own info
        if(userRole.current==="Employee" && id!==user_id){
          console.log("unauthorized");
          navigate('/login');
        }
      } else {
        console.log("unauthorized");
        navigate('/login');
      }
    }

    // GET EMPLOYEE
    const getEmployee = async () => {
      const headers = { 'Authorization': 'bearer '+userToken.current };
      await axios.get(`https://localhost:7069/api/Employee/get_employee/${id}`,{ headers })
      .then((resp)=>{
        setName(resp.data.name);
        setSurname(resp.data.surname);
        setTel(resp.data.tel);
        setEmail(resp.data.email);
        setEmpManager(resp.data.empManager);
        setStatus(resp.data.status);
        // check that current user is emp_manager
        if(userRole.current==="Manager" && resp.data.empManager!==userName.current){
          console.log("unauthorized");
          navigate('/login');
        }
      })
      .catch((error)=>{
        console.log(error.response);
      })
    }

    // GET EMPLOYEE-ROLE
    const getEmpRole = async () => {
      const headers = { 'Authorization': 'bearer '+userToken.current };
      await axios.get(`https://localhost:7069/api/User/get_user/${id}`,{ headers })
      .then((resp)=>{
        setRole(resp.data.role);
      })
      .catch((error)=>{
        console.log(error.response);
      })
    }

    // GET EMP-MANAGERS->FOR DROPDOWN-OPTIONS
    const getEmpManagers = async () => {
      const headers = { 'Authorization': 'bearer '+userToken.current };
      await axios.get('https://localhost:7069/api/Department/all_departments',{ headers })
      .then((resp)=>{
        // return unique managers
        const unique = [...new Set(resp.data.map((item) => item.manager))];
        setEmpManagerList(unique);
      })
      .catch((error)=>{
        console.log(error.response);
      })
    }

    Authorize();
    getEmployee();
    getEmpRole();
    getEmpManagers();
  }, [navigate])


  // SUBMIT UPDATE
  const handleUpdate = async () => {
    if(param && name && surname && tel && email) {
      const data = {
        "id": param,
        "name": name,
        "surname": surname,
        "tel": tel,
        "email": email,
        "empManager": empManager,
        "status": status
      }
      const headers = { 'Authorization': 'bearer '+userToken.current };
      await axios.put(`https://localhost:7069/api/Employee/update_employee/${param}`,data,{ headers })
      .then(()=>{
        console.log("employee updated");
        updateUser();// <-UPDATE_USER
      }).catch((error)=>{
        console.log(error.response);
        setErrorMsg(error.response.data);
      })
    } else {
      setErrorMsg("Enter required data fields");
    }
  }

  // SAVE->UPDATE USER
  const updateUser = async () => {
    const data = {
      "id": param,
      "fullname": name+" "+surname,
      "email": email,
      "password": "Password123#",
      "role": role,
    }
    const headers = { 'Authorization': 'bearer '+userToken.current };
    await axios.put(`https://localhost:7069/api/User/update_user/${param}`,data,{ headers })
    .then(()=>{
      console.log("user updated");
      toast.fire({
        title:'Employee Updated!'
      })
      navigate('/');
    }).catch((error)=>{
      console.log(error.response);
      setErrorMsg(error.response.data);
    })
  }


  return (
    <div className="container">
      <div className="create_edit">
      <h1>Edit Employee</h1>
      
      <Box component="form" sx={{ '& > :not(style)': { m:1, width: '40ch' },}} noValidate autoComplete="off">
        <TextField id="standard-basic" label="*Enter Name" variant="standard" value={name} onChange={(e)=>setName(e.target.value)}/>
        <TextField id="standard-basic" label="*Enter Surname" variant="standard" value={surname} onChange={(e)=>setSurname(e.target.value)}/>
        <TextField id="standard-basic" label="*Enter Telephone Number" variant="standard" value={tel} onChange={(e)=>e.target.value.match(/[^0-9]/gi)===null?setTel(e.target.value):null}/>
        <TextField id="standard-basic" label="*Enter Email Address" variant="standard" type="email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
        <div className="create_dropdown">
          <div>
            <label htmlFor="manager">*Manager</label>
            <select disabled={disableBtn} name="manager" onChange={(e)=>setEmpManager(e.target.value)}>
              <option value={empManager}>{empManager}</option>
              {
                empManagerList && empManagerList.length>0?
                empManagerList.map((row, index) => (
                <option key={index} value={row}>{row}</option>
              )) : null }
            </select>
          </div>
          <div>
            <label htmlFor="status">*Status</label>
            <select disabled={disableBtn} name="status" onChange={(e)=>setStatus(e.target.value)}>
              <option value={status}>{status}</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label htmlFor="role">*Role</label>
            <select disabled={disableBtn} name="role" onChange={(e)=>setRole(e.target.value)}>
              <option value={role}>{role}</option>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="HR/Admin">HR/Admin</option>
            </select>
          </div>
        </div>
        {
          errorMsg? <div><Alert severity="error">{errorMsg}</Alert></div> : null
        }
        <Button variant="contained" size="large" onClick={()=>handleUpdate()}>Update</Button>
        <Link to="/"><Button variant="outlined" size="small" className="cancel_btn">Cancel</Button></Link>
      </Box>
    </div>
    </div>
  );
}

export default Edit;