namespace Laboratorna8_UtilitiesApi.Models
{
    public class TenantService
    {
        public int TenantID { get; set; }
        public Tenant? Tenant { get; set; }

        public int ServiceID { get; set; }
        public Service? Service { get; set; }
    }
}
