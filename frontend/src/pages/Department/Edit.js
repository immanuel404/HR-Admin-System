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
  const [manager, setManager] = useState('');
  const [status, setStatus] = useState('');
  // USER-INFO
  const userRole = useRef("");
  const userToken = useRef("");
  // MANAGERS DROPDOWN LIST
  const [empManagerList, setEmpManagerList] = useState([]);
  // ERROR MESSAGE
  const [errorMsg, setErrorMsg] = useState('');
  // NAVIGATION
  const [param, setParam] = useState('');
  const navigate = useNavigate();


  useEffect(()=> {
    // GET URL-PARAMETER
    let urlSplit = window.location.href.split("/");
    let getParam = urlSplit.length-1; const id = urlSplit[getParam];
    setParam(id);

    // AUTHORIZE USER
    const Authorize = async () => {
      const userStorageInfo = localStorage.getItem("userData");
      if(userStorageInfo){
        let splitInfo = userStorageInfo.split("+");
        userRole.current = splitInfo[2];
        userToken.current = splitInfo[3];
        // permit only HR/Admin
        if(userRole.current!=="HR/Admin"){
          console.log("unauthorized");
          navigate('/login');
        }
      } else {
        console.log("unauthorized");
        navigate('/login');
      }
    }

    // GET DEPARTMENT
    const getDepartment = async () => {
      const headers = { 'Authorization': 'bearer '+userToken.current };
      await axios.get(`https://localhost:7069/api/Department/get_department/${id}`,{ headers })
      .then((resp)=>{
        setName(resp.data.name);
        setManager(resp.data.manager);
        setStatus(resp.data.status);
      })
      .catch((error)=>{
        console.log(error.response);
      })
    }

    // GET EMP-MANAGERS->FOR DROPDOWN-OPTIONS
    const getEmpManagers = async () => {
      const headers = { 'Authorization': 'bearer '+userToken.current };
      await axios.get("https://localhost:7069/api/User/get_managers",{ headers })
      .then((resp)=>{
        setEmpManagerList(resp.data);
      })
      .catch((error)=>{
        console.log(error.response);
      })
    }

    Authorize();
    getDepartment();
    getEmpManagers();
  }, [navigate])

  
  // SUBMIT UPDATE
  const handleUpdate = async () => {
    if(name && manager && status){
      const data = {
        "id": param,
        "name": name,
        "manager": manager,
        "status": status
      }
      const headers = { 'Authorization': 'bearer '+userToken.current };
      await axios.put(`https://localhost:7069/api/Department/${param}`,data,{ headers })
      .then(()=>{
        console.log("department updated");
        toast.fire({
          title:'Department Updated!'
        })
        navigate('/department');
      }).catch((error)=>{
        console.log(error.response);
        setErrorMsg(error.response.data);
      })
    } else {
      setErrorMsg("Enter required data fields");
    }
  }


  return (
    <div className="container">
      <div className="create_edit">
      <h1>Edit Department</h1>
      
      <Box component="form" sx={{ '& > :not(style)': { m:1, width: '40ch' },}} noValidate autoComplete="off">
        <TextField id="standard-basic" label="*Enter Name" variant="standard" value={name} onChange={(e)=>setName(e.target.value)}/>
        <div className="create_dropdown">
          <div>
            <label htmlFor="manager">*Manager</label>
            <select name="manager" onChange={(e)=>setManager(e.target.value)}>
              <option value={manager}>{manager}</option>
              {
                empManagerList && empManagerList.length>0?
                empManagerList.map((row, index) => (
                <option key={index} value={row.fullname}>{row.fullname}</option>
              )) : null }
            </select>
          </div>
          <div>
            <label htmlFor="status">*Status</label>
            <select name="status" onChange={(e)=>setStatus(e.target.value)}>
            <option value={status}>{status}</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        {
          errorMsg? <div><Alert severity="error">{errorMsg}</Alert></div> : null
        }
        <Button variant="contained" size="large" onClick={()=>handleUpdate()}>Update</Button>
        <Link to="/department"><Button variant="outlined" size="small" className="cancel_btn">Cancel</Button></Link>
      </Box>
    </div>
    </div>
  );
}

export default Edit;