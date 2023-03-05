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
  const [data, setData] = useState([]);
  // USER-INFO
  const userRole = useRef("");
  const userToken = useRef("");
  // FILTER & SEARCH
  const [filter_Status, setFilterStatus] = useState('');
  const [search_Name, setSearchName] = useState('');
  // NAVIGATION
  const navigate = useNavigate();
  // PAGINATION-SETUP
  const [currentPage, setCurrentPage] = useState(0);
  const [showPerPage, setShowPerPage] = useState(5);
  const offset = currentPage * showPerPage;
  const currentPageData = data.slice(offset, offset + showPerPage);
  const pageCount = Math.ceil(data.length / showPerPage);
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
    Authorize();
    getDepartments();
  },[navigate])


  // GET DEPARTMENTS
  const getDepartments = async () => {
    const headers = { 'Authorization': 'bearer '+userToken.current };
    await axios.get('https://localhost:7069/api/Department/all_departments',{ headers })
    .then((resp)=>{
      setData(resp.data);
    })
    .catch((error)=>{
      console.log(error.response);
    })
  }


  // FILTER DEPARTMENT->STATUS
  const beforeFilter = (e) => {
    setFilterStatus(e.target.value)
    getDepartments();
  }
  const handleFilter = () => {
    if(filter_Status){
      var filterData = data.filter((el)=> {return el.status===filter_Status;});
      setData(filterData);
    }
  }
  

  // SEARCH DEPARTMENT->NAME
  const beforeSearch = (e) => {
    setSearchName(e.target.value);
    getDepartments();
  }
  const handleSearch = () => {
    if(search_Name){
      var searchData = data.filter((el)=> {return el.name.toLowerCase().includes(search_Name.toLowerCase());});
      setData(searchData);
    }
  }


  // CHANGE DEPARTMENT->STATUS
  const handleStatusChange = async (id,name,manager,action) => {
    if(userRole.current==="HR/Admin"){
      const data = {
        "id": id,
        "name": name,
        "manager": manager,
        "status": action
      }
      const headers = { 'Authorization': 'bearer '+userToken.current };
      await axios.put(`https://localhost:7069/api/Department/${id}`,data,{ headers })
      .then(()=>{
        console.log("status changed");
        getDepartments();
      }).catch((error)=>{
        console.log(error.response);
      })
    }
  }


  return (
    <div className="container">
      <div className="title">
        <h2>Departments</h2>
      </div>

      <div className="filter">
        <h3>Filters</h3>
        <div>
          <label htmlFor="status">Status</label>
          <select name="status" onChange={(e)=>beforeFilter(e)}>
            <option value="">Active Only / (All) / Deactive Only</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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
              label="Search department" variant="outlined" placeholder="Search..." size="small" />
            <IconButton aria-label="search" onClick={()=>handleSearch()}>
            <SearchIcon style={{ fill: "black" }} />
            </IconButton>
          </form>
        </div>
      </div>

      <div className="data_table">
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead style={{background:"#eee"}}>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell align="right">Department Name</TableCell>
                <TableCell align="right">Manager</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            { currentPageData && currentPageData.length>0?
              currentPageData.map((row, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                  <Link to={`/department/edit/${row.id}`}>Edit</Link>
                  &nbsp;
                    {row.status ==="Active"?
                    <Link to={``} onClick={()=>handleStatusChange(row.id,row.name,row.manager,"Inactive")}>Deactivate</Link>:
                    <Link to={``} onClick={()=>handleStatusChange(row.id,row.name,row.manager,"Active")}>Activate</Link>}
                  </TableCell>
                  <TableCell align="right">{row.name}</TableCell>
                  <TableCell align="right">{row.manager}</TableCell>
                  <TableCell align="right">{row.status}</TableCell>
                </TableRow>
              )): null }
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