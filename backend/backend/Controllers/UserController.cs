using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Mvc;
using backend.Context;
using backend.Models;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly UserContext _userContext;

        public UserController(IConfiguration configuration, UserContext userContext)
        {
            _configuration = configuration;
            _userContext = userContext;
        }


        // GET USER
        [HttpGet("get_user/{id}"), Authorize]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            if (_userContext.Users == null)
            {
                return NotFound();
            }
            // find user
            var user = await _userContext.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }


        // GET USER->MANAGERS
        [HttpGet("get_managers"), Authorize]
        public async Task<ActionResult<IEnumerable<User>>> GetManagers()
        {
            var columnName = "Role";
            var columnValue = new SqlParameter("columnValue", "Manager");
            // get users with manager role
            var managers = await _userContext.Users
                .FromSqlRaw($"SELECT * FROM [Users] WHERE {columnName} = @columnValue", columnValue)
                .ToListAsync();

            if (managers == null)
            {
                return NotFound("No managers found.");
            }
            return managers;
        }


        // POST NEW_USER
        [HttpPost("add_user"), Authorize(Roles = "HR/Admin")]
        public async Task<ActionResult<User>> AddUser(User user)
        {
            // check if email already taken
            if (_userContext.Users.Any(x => x.Email == user.Email))
            {
                return BadRequest("Email already in use!");
            }
            // hash password
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(user.Password);
            user.Password = passwordHash;
            // save user
            _userContext.Users.Add(user);
            await _userContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }


        // LOGIN USER
        [HttpPost("login_user"), AllowAnonymous]
        public async Task<ActionResult<string>> Login(User user)
        {
            // if super-user credentials
            if (user.Email == "hradmin@test.com" && user.Password == "TestPass1234")
            {
                string superUserToken = CreateToken("Super User", "HR/Admin");
                return "0" +"+"+ "Super User" +"+"+ "HR/Admin" +"+"+ superUserToken;
            }

            foreach (var i in _userContext.Users)
            {
                //check email match
                if (i.Email == user.Email)
                {
                    //check password match
                    bool verified = BCrypt.Net.BCrypt.Verify(user.Password, i.Password);

                    if (verified) {
                        string token = CreateToken(i.Fullname, i.Role);
                        //return user_info & token
                        return i.Id.ToString() + "+"+ i.Fullname +"+"+ i.Role + "+" + token;
                    }
                }
            }
            return BadRequest("Login failed, incorrect input!");
        }
        // CREATE JWT_TOKEN
        private string CreateToken(string name, string role)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, name),
                new Claim(ClaimTypes.Role, role)
            };

            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(
                _configuration.GetSection("AppSettings:Token").Value));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                // token set to expire->24 hours
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }


        // UPDATE USER
        [HttpPut("update_user/{id}"), Authorize]
        public async Task<ActionResult> UpdateUser(int id, User user)
        {
            if (id != user.Id)
            {
                return BadRequest();
            }
            // hash password
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(user.Password);
            user.Password = passwordHash;
            // save update
            _userContext.Entry(user).State = EntityState.Modified;
            try
            {
                await _userContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }
            return Ok();
        }
    }
}
