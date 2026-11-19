using Laboratorna8_UtilitiesApi.Data;
using Laboratorna8_UtilitiesApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Laboratorna8_UtilitiesApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TenantServicesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TenantServicesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/tenantservices/5 (отримати квитанцію та послуги конкретного мешканця)
        [HttpGet("{tenantId}")]
        public async Task<IActionResult> GetTenantReceipt(int tenantId)
        {
            var tenant = await _context.Tenants.FindAsync(tenantId);
            if (tenant == null) return NotFound("Мешканця не знайдено");

            var services = await _context.TenantServices
                .Where(ts => ts.TenantID == tenantId)
                .Include(ts => ts.Service)
                .Select(ts => ts.Service!)
                .ToListAsync();

            var items = services.Select(s =>
            {
                decimal sqCost = (s.RatePerSqMeter ?? 0) * tenant.Area;
                decimal personCost = (s.RatePerPerson ?? 0) * tenant.OccupantsCount;
                decimal totalItemCost = Math.Round(sqCost + personCost, 2);

                return new
                {
                    serviceId = s.ID,
                    serviceName = s.ServiceName,
                    ratePerSqMeter = s.RatePerSqMeter,
                    ratePerPerson = s.RatePerPerson,
                    cost = totalItemCost
                };
            }).ToList();

            decimal totalAmount = items.Sum(i => i.cost);

            return Ok(new
            {
                tenantId = tenant.ID,
                fullName = tenant.FullName,
                accountNumber = tenant.AccountNumber,
                area = tenant.Area,
                occupantsCount = tenant.OccupantsCount,
                services = items,
                totalAmount = totalAmount
            });
        }

        // POST: api/tenantservices (підключити послугу мешканцю)
        [HttpPost]
        public async Task<IActionResult> AssignService([FromBody] TenantService dto)
        {
            var exists = await _context.TenantServices
                .AnyAsync(ts => ts.TenantID == dto.TenantID && ts.ServiceID == dto.ServiceID);

            if (exists)
                return BadRequest("Ця послуга вже підключена цьому мешканцю.");

            var link = new TenantService
            {
                TenantID = dto.TenantID,
                ServiceID = dto.ServiceID
            };

            _context.TenantServices.Add(link);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/tenantservices/5/2 (відключити послугу 2 у мешканця 5)
        [HttpDelete("{tenantId}/{serviceId}")]
        public async Task<IActionResult> RemoveService(int tenantId, int serviceId)
        {
            var link = await _context.TenantServices
                .FirstOrDefaultAsync(ts => ts.TenantID == tenantId && ts.ServiceID == serviceId);

            if (link == null) return NotFound();

            _context.TenantServices.Remove(link);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}