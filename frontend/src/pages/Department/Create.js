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


const Create = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [manager, setManager] = useState('');
  // USER-INFORMATION
  const userRole = useRef("");
  const userToken = useRef("");
  // MANAGERS DROPDOWN LIST
  const [empManagerList, setEmpManagerList] = useState([]);
  // ERROR MESSAGE
  const [errorMsg, setErrorMsg] = useState('');


  useEffect(()=> {
    // AUTHORIZE USER
    const Authorize = async () => {
      const userStorageInfo = localStorage.getItem("userData");
      if(userStorageInfo) {
        let splitInfo = userStorageInfo.split("+");
        userRole.current = splitInfo[2];
        userToken.current = splitInfo[3];
        // permit only HR/Admin
        if(userRole.current!=="HR/Admin"){
          console.log("unauthorized");
          navigate('/');
        }
      } else {
        console.log("unauthorized");
        navigate('/login');
      }
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
    getEmpManagers();
  }, [navigate])


  // SAVE->ADD NEW DEPARTMENT
  const handleSave = async () => {
    if(name && manager) {
      const data = {
        "name": name,
        "manager": manager
      }
      const headers = { 'Authorization': 'bearer '+userToken.current };
      await axios.post(`https://localhost:7069/api/Department/add_department`,data,{ headers })
      .then(()=>{
        console.log("department created");
        toast.fire({
          title:'Department Created!'
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
      <h1>Create Department</h1>
      <Box component="form" sx={{ '& > :not(style)': { m:1, width: '40ch' },}} noValidate autoComplete="off">
        <TextField id="standard-basic" label="*Enter Name" variant="standard" value={name} onChange={(e)=>setName(e.target.value)}/>
        <div className="create_dropdown">
          <div>
            <label htmlFor="manager">*Manager</label>
            <select name="manager" onChange={(e)=>setManager(e.target.value)}>
              <option value="">-- Select --</option>
              {
                empManagerList && empManagerList.length>0?
                empManagerList.map((row, index) => (
                <option key={index} value={row.fullname}>{row.fullname}</option>
              )) : null }
            </select>
          </div>
        </div>
        {
          errorMsg? <div><Alert severity="error">{errorMsg}</Alert></div> : null
        }
        <Button variant="contained" size="large" onClick={()=>handleSave()}>Save</Button>
        <Link to="/department"><Button variant="outlined" size="small" className="cancel_btn">Cancel</Button></Link>
      </Box>
    </div>
    </div>
  );
}

export default Create;