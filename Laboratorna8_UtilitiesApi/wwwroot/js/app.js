"use strict";
const API_TENANTS = '/api/tenants';
const API_SERVICES = '/api/services';
const API_RECEIPT = '/api/tenantservices';
let allTenants = [];
let allServices = [];
// --- РОБОТА З МЕШКАНЦЯМИ ---
async function loadTenants() {
    const response = await fetch(API_TENANTS);
    allTenants = await response.json();
    const tbody = document.getElementById('tenants-body');
    const select = document.getElementById('receipt-tenant-select');
    const currentSelected = select.value;
    tbody.innerHTML = '';
    select.innerHTML = '<option value="">-- Оберіть мешканця --</option>';
    allTenants.forEach(t => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${t.accountNumber}</td>
            <td>${t.fullName}</td>
            <td>${t.address}</td>
            <td>${t.area} м²</td>
            <td>${t.occupantsCount}</td>
            <td>
                <button type="button" class="btn-edit" onclick="editTenantById(${t.id})">Редагувати</button>
                <button type="button" class="btn-del" onclick="deleteTenant(${t.id})">Видалити</button>
            </td>
        `;
        tbody.appendChild(row);
        const option = document.createElement('option');
        option.value = t.id.toString();
        option.textContent = `${t.accountNumber} — ${t.fullName}`;
        select.appendChild(option);
    });
    if (currentSelected) {
        select.value = currentSelected;
    }
}
async function saveTenant(event) {
    event.preventDefault();
    const id = Number(document.getElementById('tenant-id').value);
    const tenant = {
        id: id,
        accountNumber: document.getElementById('accountNumber').value,
        fullName: document.getElementById('fullName').value,
        address: document.getElementById('address').value,
        area: Number(document.getElementById('area').value),
        occupantsCount: Number(document.getElementById('occupantsCount').value)
    };
    if (id === 0) {
        await fetch(API_TENANTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tenant)
        });
    }
    else {
        await fetch(`${API_TENANTS}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tenant)
        });
    }
    resetTenantForm();
    await loadTenants();
    await loadReceipt();
}
function editTenantById(id) {
    const tenant = allTenants.find(t => t.id === id);
    if (!tenant)
        return;
    document.getElementById('tenant-id').value = tenant.id.toString();
    document.getElementById('accountNumber').value = tenant.accountNumber;
    document.getElementById('fullName').value = tenant.fullName;
    document.getElementById('address').value = tenant.address;
    document.getElementById('area').value = tenant.area.toString();
    document.getElementById('occupantsCount').value = tenant.occupantsCount.toString();
    document.getElementById('tenant-form')?.scrollIntoView({ behavior: 'smooth' });
}
async function deleteTenant(id) {
    if (!confirm('Видалити цього мешканця?'))
        return;
    await fetch(`${API_TENANTS}/${id}`, { method: 'DELETE' });
    await loadTenants();
}
function resetTenantForm() {
    document.getElementById('tenant-form').reset();
    document.getElementById('tenant-id').value = '0';
}
// --- РОБОТА З ПОСЛУГАМИ ---
async function loadServices() {
    const response = await fetch(API_SERVICES);
    allServices = await response.json();
    const tbody = document.getElementById('services-body');
    const select = document.getElementById('receipt-service-select');
    tbody.innerHTML = '';
    select.innerHTML = '<option value="">-- Оберіть послугу для підключення --</option>';
    allServices.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.serviceName}</td>
            <td>${s.ratePerSqMeter ?? '-'}</td>
            <td>${s.ratePerPerson ?? '-'}</td>
            <td>
                <button type="button" class="btn-edit" onclick="editServiceById(${s.id})">Редагувати</button>
                <button type="button" class="btn-del" onclick="deleteService(${s.id})">Видалити</button>
            </td>
        `;
        tbody.appendChild(row);
        const option = document.createElement('option');
        option.value = s.id.toString();
        option.textContent = s.serviceName;
        select.appendChild(option);
    });
}
async function saveService(event) {
    event.preventDefault();
    const id = Number(document.getElementById('service-id').value);
    const rateSq = document.getElementById('rateSq').value;
    const ratePers = document.getElementById('ratePers').value;
    const service = {
        id: id,
        serviceName: document.getElementById('serviceName').value,
        ratePerSqMeter: rateSq ? Number(rateSq) : null,
        ratePerPerson: ratePers ? Number(ratePers) : null
    };
    if (id === 0) {
        await fetch(API_SERVICES, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(service)
        });
    }
    else {
        await fetch(`${API_SERVICES}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(service)
        });
    }
    resetServiceForm();
    await loadServices();
    await loadReceipt();
}
function editServiceById(id) {
    const service = allServices.find(s => s.id === id);
    if (!service)
        return;
    document.getElementById('service-id').value = service.id.toString();
    document.getElementById('serviceName').value = service.serviceName;
    document.getElementById('rateSq').value = service.ratePerSqMeter != null ? service.ratePerSqMeter.toString() : '';
    document.getElementById('ratePers').value = service.ratePerPerson != null ? service.ratePerPerson.toString() : '';
    document.getElementById('service-form')?.scrollIntoView({ behavior: 'smooth' });
}
function resetServiceForm() {
    document.getElementById('service-form').reset();
    document.getElementById('service-id').value = '0';
}
async function deleteService(id) {
    if (!confirm('Видалити послугу?'))
        return;
    await fetch(`${API_SERVICES}/${id}`, { method: 'DELETE' });
    await loadServices();
    await loadReceipt();
}
// --- РОЗРАХУНОК КВИТАНЦІЇ (TENANTSERVICES) ---
async function loadReceipt() {
    const tenantId = document.getElementById('receipt-tenant-select').value;
    const container = document.getElementById('receipt-details');
    if (!tenantId) {
        container.style.display = 'none';
        return;
    }
    const response = await fetch(`${API_RECEIPT}/${tenantId}`);
    if (!response.ok)
        return;
    const receipt = await response.json();
    container.style.display = 'block';
    document.getElementById('receipt-info').textContent =
        `Платник: ${receipt.fullName} (Рахунок: ${receipt.accountNumber}) | Площа: ${receipt.area} м² | Мешканців: ${receipt.occupantsCount}`;
    const tbody = document.getElementById('receipt-body');
    tbody.innerHTML = '';
    receipt.services.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.serviceName}</td>
            <td>${item.ratePerSqMeter ?? 0} грн</td>
            <td>${item.ratePerPerson ?? 0} грн</td>
            <td><strong>${item.cost.toFixed(2)} грн</strong></td>
            <td>
                <button type="button" class="btn-del" onclick="removeServiceFromTenant(${receipt.tenantId}, ${item.serviceId})">Відключити</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    document.getElementById('receipt-total').textContent = `${receipt.totalAmount.toFixed(2)} грн`;
}
async function assignServiceToTenant() {
    const tenantId = Number(document.getElementById('receipt-tenant-select').value);
    const serviceId = Number(document.getElementById('receipt-service-select').value);
    if (!tenantId || !serviceId) {
        alert('Оберіть мешканця та послугу!');
        return;
    }
    const response = await fetch(API_RECEIPT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantID: tenantId, serviceID: serviceId })
    });
    if (!response.ok) {
        const msg = await response.text();
        alert(msg || 'Помилка при підключенні послуги');
        return;
    }
    await loadReceipt();
}
async function removeServiceFromTenant(tenantId, serviceId) {
    await fetch(`${API_RECEIPT}/${tenantId}/${serviceId}`, { method: 'DELETE' });
    await loadReceipt();
}
// Експорт функцій у глобальну область видимості
window.editTenantById = editTenantById;
window.deleteTenant = deleteTenant;
window.resetTenantForm = resetTenantForm;
window.editServiceById = editServiceById;
window.deleteService = deleteService;
window.resetServiceForm = resetServiceForm;
window.loadReceipt = loadReceipt;
window.assignServiceToTenant = assignServiceToTenant;
window.removeServiceFromTenant = removeServiceFromTenant;
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('tenant-form')?.addEventListener('submit', saveTenant);
    document.getElementById('service-form')?.addEventListener('submit', saveService);
    loadTenants();
    loadServices();
});
//# sourceMappingURL=app.js.map