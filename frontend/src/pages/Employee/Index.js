import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// REACT-PAGINATION
import ReactPaginate from 'react-paginate';
// MUI->SEARCHBAR
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
// MUI->ICON
import FilterAltIcon from '@mui/icons-material/FilterAlt';
// MUI->TABLE
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


const Index = () => {
  const [tableData, setTableData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [managerData, setManagerData] = useState([]);
  // USER-INFO
  const userId = useRef();
  const userName = useRef("");
  const userRole = useRef("");
  const userToken = useRef("");
  // FILTER & SEARCH
  const [filter_Status, setFilterStatus] = useState('');
  const [filter_Department, setFilterDept] = useState('');
  const [filter_Manager, setFilterManager] = useState('');
  const [search_Name, setSearchName] = useState('');
  // NAVIGATION
  const navigate = useNavigate();
  // PAGE-NAVIGINATION-SETUP
  const [currentPage, setCurrentPage] = useState(0);
  const [showPerPage, setShowPerPage] = useState(5);
  const offset = currentPage * showPerPage;
  var currentPageData;
  var pageCount = 0;
  if(userRole.current!=="Employee"){
    currentPageData = tableData.slice(offset, offset + showPerPage);
    pageCount = Math.ceil(tableData.length / showPerPage);
  }
  // PAGINATION->EVENT HANDLER
  function handlePageClick({ selected: selectedPage }) {
    setCurrentPage(selectedPage);
  }

  
  useEffect(()=>{
    // AUTHORIZE USER
    const Authorize = async () => {
      const userStorageInfo = localStorage.getItem("userData");
      if(userStorageInfo){
        let splitInfo = userStorageInfo.split("+");
        userId.current = splitInfo[0];
        userName.current = splitInfo[1];
        userRole.current = splitInfo[2];
        userToken.current = splitInfo[3];
        // get table data based on user role
        if(userRole.current==="Employee"){
          getEmployee(userId.current);
        }
        else if(userRole.current==="Manager"){
          getEmployeesByManager(userId.current, userName.current);
        } else {
          getAllEmployees();
        }
      } else {
        console.log("unauthorized");
        navigate('/login');
      }
    }

    Authorize();
    getDepartments();
    getManagers();
  },[navigate])


  // IF USER->EMPLOYEE
  const getEmployee = async (id) => {
    const headers = { 'Authorization': 'bearer '+userToken.current };
    await axios.get(`https://localhost:7069/api/Employee/get_employee/${id}`,{ headers })
    .then((resp)=>{
      setTableData(resp.data);
    })
    .catch((error)=>{
      console.log(error.response);
    })
  }
  // IF USER->MANAGER
  const getEmployeesByManager = async (id,name) => {
    if(id && name) {
      const data = {
        "id": id,
        "name": "string",
        "surname": "string",
        "tel": "string",
        "email": "string",
        "empManager": name,
      }
      const headers = { 'Authorization': 'bearer '+userToken.current };
      await axios.post(`https://localhost:7069/api/Employee/employees_by_manager`,data,{ headers })
      .then((resp)=>{
        setTableData(resp.data);
      })
      .catch((error)=>{
        console.log(error.response);
      })
    }
  }
  // IF USER->HR/ADMIN
  const getAllEmployees = async () => {
    const headers = { 'Authorization': 'bearer '+userToken.current };
    await axios.get(`https://localhost:7069/api/Employee/all_employees`,{ headers })
    .then((resp)=>{
      setTableData(resp.data);
    })
    .catch((error)=>{
      console.log(error.response);
    })
  }


  // GET DEPARTMENT_NAMES->FILTER MENU
  const getDepartments = async () => {
    const headers = { 'Authorization': 'bearer '+userToken.current };
    await axios.get('https://localhost:7069/api/Department/all_departments',{ headers })
    .then((resp)=>{
      setDepartmentData(resp.data);
    })
    .catch((error)=>{
      console.log(error.response);
    })
  }
  // GET DEPARTMENT_MANAGERS->FILTER MENU
  const getManagers = async () => {
    const headers = { 'Authorization': 'bearer '+userToken.current };
    await axios.get('https://localhost:7069/api/Department/all_departments',{ headers })
    .then((resp)=>{
      // return unique managers
      const unique = [...new Set(resp.data.map((item) => item.manager))];
      setManagerData(unique);
    })
    .catch((error)=>{
      console.log(error.response);
    })
  }


  // FILTER EMPLOYEES TABLE
  const beforeFilter = () => {
    if(userRole.current==="Manager"){
      getEmployeesByManager(userId.current, userName.current);
    } else if(userRole.current==="HR/Admin"){
      getAllEmployees();
    }
  }
  const handleFilter = () => {
    if(userRole.current!=="Employee"){
      var dataFiltered;
      if(filter_Status){
        dataFiltered = tableData.filter((el)=> {return el.status===filter_Status;});
      }
      if(filter_Department){
        // Find manager of requested department, then filter by manager
        const findDepartment = departmentData.find(el => el.name=== filter_Department);
        var filter_Dept = findDepartment.manager;
        dataFiltered = tableData.filter((el)=> {return el.empManager===filter_Dept;});
      }
      if(filter_Manager){
        dataFiltered = tableData.filter((el)=> {return el.empManager===filter_Manager;});
      }
      setTableData(dataFiltered);
    }
  }


  // SEARCH EMPLOYEES->NAME
  const beforeSearch = (e) => {
    setSearchName(e.target.value);
    if(userRole.current==="Manager"){
      getEmployeesByManager(userId.current, userName.current);
    } else if(userRole.current==="HR/Admin"){
      getAllEmployees();
    }
  }
  const handleSearch = () => {
    if(userRole.current!=="Employee" && search_Name){
      var searchData = tableData.filter((el)=> {
        return el.name.toLowerCase().includes(search_Name.toLowerCase());
      });
      setTableData(searchData);
    }
  }


  // CHANGE EMPLOYEEE->STATUS
  const handleStatusChange = async (id,name,surname,tel,email,empManager,action) => {
    if(userRole.current==="HR/Admin"){
      const data = {
        "id": id,
        "name": name,
        "surname": surname,
        "tel": tel,
        "email": email,
        "empManager": empManager,
        "status": action
      }
      const headers = { 'Authorization': 'bearer '+userToken.current };
      await axios.put(`https://localhost:7069/api/Employee/update_employee/${id}`,data,{ headers })
      .then(()=>{
        console.log("status changed");
        getAllEmployees();
      }).catch((error)=>{
        console.log(error.response);
      })
    } else {
      console.log("unauthorized");
    }
  }


  return (
    <div className="container">
      <div className="title">
        <h2>Employees</h2>
      </div>

      <div className="filter">
        <h3>Filters</h3>
        <div>
          <label htmlFor="status">Status</label>
          <select name="status" onClick={()=>beforeFilter()} onChange={(e)=>setFilterStatus(e.target.value)}>
            <option value="">Active Only / (All) / Deactive Only</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label htmlFor="department">Department</label>
          <select name="department" onClick={()=>beforeFilter()} onChange={(e)=>setFilterDept(e.target.value)}>
            <option value="">-- Select --</option>
          { departmentData && departmentData.length>0? departmentData.map((row, index) => (
            <option key={index} value={row.name}>{row.name}</option>
          )): null }
          </select>
        </div>
        <div>
          <label htmlFor="manager">Manager</label>
          <select name="manager" onClick={()=>beforeFilter()} onChange={(e)=>setFilterManager(e.target.value)}>
            <option value="">-- Select --</option>
          { managerData && managerData.length>0? managerData.map((row, index) => (
            <option key={index} value={row}>{row}</option>
          )): null }
          </select>
        </div>
        <button onClick={()=>handleFilter()}><FilterAltIcon/>Filter</button>
      </div>

      <div className="above_data_table">
        <div className="showPerPage">
          <label htmlFor="perPage">Show Per Page</label>
          <select name="showPerPage" onChange={(e)=>setShowPerPage(e.target.value)}>
            <option value="">10 / 20 / 50 / 100 / All</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="1000">All</option>
          </select>
        </div>
        <div className="searchbar">
          <form>
            <TextField id="search-bar" className="text" onChange={(e)=>beforeSearch(e)}
              label="Search by name" variant="outlined" placeholder="Search..." size="small" />
            <IconButton aria-label="search" onClick={()=>handleSearch()}>
            <SearchIcon style={{ fill: "black" }} />
            </IconButton>
          </form>
        </div>
      </div>
      
      <div  className="data_table">
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead style={{background:"#eee"}}>
              <TableRow>
                <TableCell>Actions</TableCell>
                <TableCell align="right">First Name</TableCell>
                <TableCell align="right">Last Name</TableCell>
                <TableCell align="right">Telephone Number</TableCell>
                <TableCell align="right">Email Address</TableCell>
                <TableCell align="right">Manager</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { currentPageData && currentPageData.length>0?
                currentPageData.map((row, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                  <Link to={`/employee/edit/${row.id}`}>Edit</Link>
                  &nbsp;
                    {row.status ==="Active"?
                    <Link to={``} onClick={()=>handleStatusChange(row.id,row.name,row.surname,row.tel,row.email,row.empManager,"Inactive")}>Deactivate</Link>:
                    <Link to={``} onClick={()=>handleStatusChange(row.id,row.name,row.surname,row.tel,row.email,row.empManager,"Active")}>Activate</Link>}
                  </TableCell>
                  <TableCell align="right">{row.name}</TableCell>
                  <TableCell align="right">{row.surname}</TableCell>
                  <TableCell align="right">{row.tel}</TableCell>
                  <TableCell align="right">{row.email}</TableCell>
                  <TableCell align="right">{row.empManager}</TableCell>
                  <TableCell align="right">{row.status}</TableCell>
                </TableRow>
              )):
              <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                  <Link to={`/employee/edit/${tableData.id}`}>Edit</Link>
                  </TableCell>
                  <TableCell align="right">{tableData.name}</TableCell>
                  <TableCell align="right">{tableData.surname}</TableCell>
                  <TableCell align="right">{tableData.tel}</TableCell>
                  <TableCell align="right">{tableData.email}</TableCell>
                  <TableCell align="right">{tableData.empManager}</TableCell>
                  <TableCell align="right">{tableData.status}</TableCell>
                </TableRow>
              }
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className="paginate">
        <ReactPaginate
          previousLabel={"← Previous"}
          nextLabel={"Next →"}
          pageCount={pageCount}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          previousLinkClassName={"pagination__link"}
          nextLinkClassName={"pagination__link"}
          disabledClassName={"pagination__link--disabled"}
          activeClassName={"pagination__link--active"}
        />
      </div>
    </div>
  );
}

export default Index;