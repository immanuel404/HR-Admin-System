import React, { useState } from "react";
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// MUI->INPUT & BUTTON
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
// MUI->LOADING
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
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


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const navigate = useNavigate();

  const handleLogin = async () => {
    if(email && password) {
      setIsLoading(true);
      const data = {
        "id": 0,
        "email": email,
        "password": password,
      }
      await axios.post(`https://localhost:7069/api/User/login_user`,data)
      .then((resp)=>{
        // SET->LOCAL_STORAGE
        localStorage.setItem("userData", resp.data);
        setIsLoading(false);
        toast.fire({
          title:'Login Successful!'
        })
        // navigate('/');
        window.location.replace('/');
      }).catch((error)=>{
        console.log(error.response);
        setErrorMsg(error.response.data);
        setIsLoading(false);
      })
    } else {
      setErrorMsg("Enter login details!");
    }
  }

  return (
    <div className="container">
      <div className="login">
        <h1>Login</h1>
        <Box component="form" sx={{ '& > :not(style)': { m:1, width: '30ch' },}} noValidate autoComplete="off">
          <TextField id="standard-basic" label="Enter Username" variant="standard" value={email} onChange={(e)=>e.target.value.match(/^.{19,20}$/gi)===null?setEmail(e.target.value):null}/>
          <TextField type="password" id="standard-basic" label="Enter Password" variant="standard" value={password} onChange={(e)=>e.target.value.match(/^.{19,20}$/gi)===null?setPassword(e.target.value):null}/>
          <Button variant="contained" size="large" onClick={(e)=>handleLogin(e)}>Login</Button>
        </Box>
        {
          isLoading?
          <Stack sx={{ width: '70%', color: 'grey.500' }} spacing={2}>
          <LinearProgress color="inherit" />
        </Stack> : null
        }
        {
          errorMsg? <div><Alert severity="error">{errorMsg}</Alert></div> : null
        }
      </div>
    </div>
  );
}

export default Login;