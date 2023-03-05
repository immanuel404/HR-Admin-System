import React, { useState, useEffect } from "react";
import { Link, useParams } from 'react-router-dom';
// MUI->NAVBAR
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';


const Navbar = () => {
    const [userRole, setUserRole] = useState('');
    const { url } = useParams();

    useEffect(()=>{
    const Authorize = async () => {
        const userStorageInfo = localStorage.getItem("userData");
        // VERIFY->USER AUTH
        if(userStorageInfo){
            let splitInfo = userStorageInfo.split("+");
            const user_role = splitInfo[2];
            setUserRole(user_role);
        }
    }
    Authorize();
    },[url])

    
    // ON USER LOGOUT
    const handleLogout= async () => {
        localStorage.removeItem("userData");
        window.location.replace('/login');
    }


    // TOGGLE-NAVBAR
    function toggleNav() {
        var toggle = document.getElementById('toggle');
        toggle.classList.toggle('active');
    }


    return (
      <div className="navbar">
        <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
            <Toolbar>
            <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={()=>{toggleNav()}}
            >
            <MenuIcon />
            </IconButton>
            <Link to="/" style={{color: 'white'}}><Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>HR Administration System</Typography></Link>
            </Toolbar>
        </AppBar>
        </Box>

        {/* NAVBAR-MENU  */}
        <div id="toggle" className="navbar_menu">
        
            {/* IS USER AUTHENTICATED */}
            {
                userRole?
                <ul style={{margin:"0px"}}>
                    <li style={{marginBottom:"0px"}}><Link to="/">View Employee</Link></li>
                </ul> : null
            }

            {/* IS AUTHENTICATED USER HR/ADMIN */}
            {
                userRole==="HR/Admin"?
                <ul style={{margin:"0px"}}>
                    <li><Link to="/employee/create">Add Employee</Link></li>
                    <li><Link to="/department/create">Add Department</Link></li>             
                    <li><Link to="/department">View Departments</Link></li>
                </ul> : null
            }

            {/* IS USER LOGGED IN */}
            {
                userRole?
                <ul style={{margin:"0px"}}>
                    <li><Link to="" onClick={()=>handleLogout()}>Logout</Link></li>
                </ul>
                :
                <ul style={{margin:"0px"}}>
                    <li><Link to="/login">Login</Link></li>
                </ul>
            }
        </div>
    </div>
    );
}

export default Navbar;