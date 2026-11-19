namespace Laboratorna8_UtilitiesApi.Models
{
    public class Service
    {
        public int ID { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public decimal? RatePerSqMeter { get; set; }
        public decimal? RatePerPerson { get; set; }
    }
}
