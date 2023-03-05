namespace backend.Models
{
    public class Employee
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Tel { get; set; }
        public string Email { get; set; }
        public string? EmpManager { get; set; }
        public string? Status { get; set; }
    }
}