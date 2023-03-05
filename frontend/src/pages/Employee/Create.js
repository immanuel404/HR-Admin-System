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
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [empManager, setEmpManager] = useState('');
  // USER-INFO
  const userRole = useRef("");
  const userToken = useRef("");
  // MANAGERS DROPDOWN LIST
  const [empManagerList, setEmpManagerList] = useState([]);
  // ERROR MESSAGE
  const [errorMsg, setErrorMsg] = useState('');
  // NAVIGATION
  const navigate = useNavigate();


  useEffect(()=> {
    // AUTHORIZE USER
    const Authorize = async () => {
      const userStorageInfo = localStorage.getItem("userData");
      if(userStorageInfo){
        let splitInfo = userStorageInfo.split("+");
        userRole.current = splitInfo[2];
        userToken.current = splitInfo[3];
        // permit only HR/Admin
        if(userRole.current!=="HR/Admin") {
          console.log("unauthorized");
          navigate('/');
        }
      } else {
        console.log("unauthorized");
        navigate('/login');
      }
    }

    // GET DEPARTMENT_MANAGERS
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
    getEmpManagers();
  }, [navigate])


  // SAVE->ADD NEW EMPLOYEE
  const handleSave = async () => {
    if(name && surname && tel && email) {
      const data = {
        "name": name,
        "surname": surname,
        "tel": tel,
        "email": email,
        "empManager": empManager
      }
      const headers = { 'Authorization': 'bearer '+userToken.current };
      await axios.post(`https://localhost:7069/api/Employee/add_employee`,data,{ headers })
      .then((resp)=>{
        console.log("employee added!");
        var id = resp.data.id;
        SaveUser(id);// CALL->SAVE_USER
      }).catch((error)=> {
        console.log(error.response);
        setErrorMsg(error.response.data);
      })
    } else {
      setErrorMsg("Enter required data fields");
    }
  }

  // SAVE->CREATE NEW USER
  const SaveUser = async (id) => {
    if(id) {
      const data = {
        "id": id,
        "fullname": name+" "+surname,
        "email": email,
        "password": "Password123#",
        "role": "Employee"
      }
      const headers = { 'Authorization': 'bearer '+userToken.current };
      await axios.post(`https://localhost:7069/api/User/add_user`,data,{ headers })
      .then(()=>{
        console.log("user added!");
        toast.fire({
          title:'Employee Created!'
        })
        navigate('/');
      }).catch((error)=>{
        console.log(error.response);
        setErrorMsg(error.response.data);
      })
    }
  }

  
  return (
    <div className="container">
      <div className="create_edit">
      <h1>Create Employee</h1>
      
      <Box component="form" sx={{ '& > :not(style)': { m:1, width: '40ch' },}} noValidate autoComplete="off">
        <TextField id="standard-basic" label="*Enter Name" variant="standard" value={name} onChange={(e)=>setName(e.target.value)}/>
        <TextField id="standard-basic" label="*Enter Surname" variant="standard" value={surname} onChange={(e)=>setSurname(e.target.value)}/>
        <TextField id="standard-basic" label="*Enter Telephone Number" variant="standard" value={tel} onChange={(e)=>e.target.value.match(/[^0-9]/gi)===null?setTel(e.target.value):null}/>
        <TextField id="standard-basic" label="*Enter Email Address" variant="standard" type="email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
        <div className="create_dropdown">
          <div>
            <label htmlFor="manager">*Manager</label>
            <select name="manager" onChange={(e)=>setEmpManager(e.target.value)}>
              <option value="None">-- Select --</option>
              {
                empManagerList && empManagerList.length>0?
                empManagerList.map((row, index) => (
                <option key={index} value={row}>{row}</option>
              )) : null }
            </select>
          </div>
        </div>
        {
          errorMsg? <div><Alert severity="error">{errorMsg}</Alert></div> : null
        }
        <Button variant="contained" size="large" onClick={()=>handleSave()}>Save</Button>
        <Link to="/"><Button variant="outlined" size="small" className="cancel_btn">Cancel</Button></Link>
      </Box>
    </div>
    </div>
  );
}

export default Create;