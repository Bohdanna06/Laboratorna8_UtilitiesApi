namespace Laboratorna8_UtilitiesApi.Models
{
    public class Tenant
    {
        public int ID { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public int OccupantsCount { get; set; }
        public decimal Area { get; set; }
    }
}
