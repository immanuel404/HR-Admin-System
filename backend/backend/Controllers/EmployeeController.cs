using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using backend.Context;
using backend.Models;
using Microsoft.Data.SqlClient;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly EmployeeContext _employeeContext;

        public EmployeeController(IConfiguration configuration, EmployeeContext employeeContext)
        {
            _configuration = configuration;
            _employeeContext = employeeContext;
        }


        // GET ALL EMPLOYEES
        [HttpGet("all_employees"), Authorize]
        public async Task<ActionResult<IEnumerable<Employee>>> GetAllEmployees()
        {
            if (_employeeContext.Employees == null)
            {
                return NotFound("Not found | table empty!");
            }
            return await _employeeContext.Employees.ToListAsync();
        }


        // GET EMPLOYEE
        [HttpGet("get_employee/{id}"), Authorize]
        public async Task<ActionResult<Employee>> GetEmployee(int id)
        {
            if (_employeeContext.Employees == null)
            {
                return NotFound("Not found | table empty!");
            }
            // check employee exists
            var employee = await _employeeContext.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound("Employee not found!");
            }
            return employee;
        }


        // GET EMPLOYEES BY EMP_MANAGER
        [HttpPost("employees_by_manager"), Authorize(Roles="Manager")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployeesByManager(Employee employee)
        {
            var columnName1 = "Id"; 
            var columnName2 = "EmpManager";
            var columnValue1 = new SqlParameter("columnValue1", employee.Id);
            var columnValue2 = new SqlParameter("columnValue2", employee.EmpManager);
            // query to get employees by specific emp_manager
            var employees = await _employeeContext.Employees
                .FromSqlRaw($"SELECT * FROM [Employees] WHERE {columnName1} = @columnValue1 OR {columnName2} = @columnValue2", columnValue1, columnValue2)
                .ToListAsync();

            if (employees == null)
            {
                return NotFound("No employees found.");
            }
            return employees;
        }


        // POST NEW_EMPLOYEE
        [HttpPost("add_employee"), Authorize(Roles="HR/Admin")]
        public async Task<ActionResult<Employee>> AddEmployee(Employee employee)
        {
            // check if email already in use
            if (_employeeContext.Employees.Any(x => x.Email == employee.Email))
            {
                return BadRequest("Email already in use!");
            }
            _employeeContext.Employees.Add(employee);
            await _employeeContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
        }


        // UPDATE EMPLOYEE
        [HttpPut("update_employee/{id}"), Authorize]
        public async Task<ActionResult> UpdateEmployee(int id, Employee employee)
        {
            if (id != employee.Id)
            {
                return BadRequest();
            }
            // save update
            _employeeContext.Entry(employee).State = EntityState.Modified;
            try
            {
                await _employeeContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }
            return Ok();
        }
    }
}
