using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using backend.Context;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly DepartmentContext _departmentContext;

        public DepartmentController(IConfiguration configuration, DepartmentContext departmentContext)
        {
            _configuration = configuration;
            _departmentContext = departmentContext;
        }


        // GET ALL DEPARTMENTS
        [HttpGet("all_departments"), Authorize]
        public async Task<ActionResult<IEnumerable<Department>>> GetAllDepartments()
        {
            if (_departmentContext.Departments == null)
            {
                return NotFound("Not found | table empty!");
            }
            return await _departmentContext.Departments.ToListAsync();
        }


        // GET DEPARTMENT
        [HttpGet("get_department/{id}"), Authorize(Roles = "HR/Admin")]
        public async Task<ActionResult<Department>> GetDepartment(int id)
        {
            if (_departmentContext.Departments == null)
            {
                return NotFound("Not found | table empty!");
            }
            // check employee exists
            var department = await _departmentContext.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound();
            }
            return department;
        }


        // POST NEW_DEPARTMENT
        [HttpPost("add_department"), Authorize(Roles="HR/Admin")]
        public async Task<ActionResult<Department>> AddDepartment(Department department)
        {
            _departmentContext.Departments.Add(department);
            await _departmentContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, department);
        }


        // UPDATE DEPARTMENT
        [HttpPut("{id}"), Authorize(Roles="HR/Admin")]
        public async Task<ActionResult> PutDepartment(int id, Department department)
        {
            if (id != department.Id)
            {
                return BadRequest();
            }
            // save update
            _departmentContext.Entry(department).State = EntityState.Modified;
            try
            {
                await _departmentContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }
            return Ok();
        }
    }
}
