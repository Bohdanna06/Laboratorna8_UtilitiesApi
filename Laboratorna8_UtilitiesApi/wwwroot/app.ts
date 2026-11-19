interface Tenant {
    id: number;
    accountNumber: string;
    fullName: string;
    address: string;
    occupantsCount: number;
    area: number;
}

interface Service {
    id: number;
    serviceName: string;
    ratePerSqMeter?: number | null;
    ratePerPerson?: number | null;
}

interface ReceiptItem {
    serviceId: number;
    serviceName: string;
    ratePerSqMeter?: number | null;
    ratePerPerson?: number | null;
    cost: number;
}

interface Receipt {
    tenantId: number;
    fullName: string;
    accountNumber: string;
    area: number;
    occupantsCount: number;
    services: ReceiptItem[];
    totalAmount: number;
}

const API_TENANTS = '/api/tenants';
const API_SERVICES = '/api/services';
const API_RECEIPT = '/api/tenantservices';

let allTenants: Tenant[] = [];
let allServices: Service[] = [];

// --- РОБОТА З МЕШКАНЦЯМИ ---

async function loadTenants(): Promise<void> {
    const response = await fetch(API_TENANTS);
    allTenants = await response.json();

    const tbody = document.getElementById('tenants-body') as HTMLTableSectionElement;
    const select = document.getElementById('receipt-tenant-select') as HTMLSelectElement;
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

async function saveTenant(event: Event): Promise<void> {
    event.preventDefault();

    const id = Number((document.getElementById('tenant-id') as HTMLInputElement).value);
    const tenant: Tenant = {
        id: id,
        accountNumber: (document.getElementById('accountNumber') as HTMLInputElement).value,
        fullName: (document.getElementById('fullName') as HTMLInputElement).value,
        address: (document.getElementById('address') as HTMLInputElement).value,
        area: Number((document.getElementById('area') as HTMLInputElement).value),
        occupantsCount: Number((document.getElementById('occupantsCount') as HTMLInputElement).value)
    };

    if (id === 0) {
        await fetch(API_TENANTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tenant)
        });
    } else {
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

function editTenantById(id: number): void {
    const tenant = allTenants.find(t => t.id === id);
    if (!tenant) return;

    (document.getElementById('tenant-id') as HTMLInputElement).value = tenant.id.toString();
    (document.getElementById('accountNumber') as HTMLInputElement).value = tenant.accountNumber;
    (document.getElementById('fullName') as HTMLInputElement).value = tenant.fullName;
    (document.getElementById('address') as HTMLInputElement).value = tenant.address;
    (document.getElementById('area') as HTMLInputElement).value = tenant.area.toString();
    (document.getElementById('occupantsCount') as HTMLInputElement).value = tenant.occupantsCount.toString();

    document.getElementById('tenant-form')?.scrollIntoView({ behavior: 'smooth' });
}

async function deleteTenant(id: number): Promise<void> {
    if (!confirm('Видалити цього мешканця?')) return;
    await fetch(`${API_TENANTS}/${id}`, { method: 'DELETE' });
    await loadTenants();
}

function resetTenantForm(): void {
    (document.getElementById('tenant-form') as HTMLFormElement).reset();
    (document.getElementById('tenant-id') as HTMLInputElement).value = '0';
}

// --- РОБОТА З ПОСЛУГАМИ ---

async function loadServices(): Promise<void> {
    const response = await fetch(API_SERVICES);
    allServices = await response.json();

    const tbody = document.getElementById('services-body') as HTMLTableSectionElement;
    const select = document.getElementById('receipt-service-select') as HTMLSelectElement;

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

async function saveService(event: Event): Promise<void> {
    event.preventDefault();

    const id = Number((document.getElementById('service-id') as HTMLInputElement).value);
    const rateSq = (document.getElementById('rateSq') as HTMLInputElement).value;
    const ratePers = (document.getElementById('ratePers') as HTMLInputElement).value;

    const service: Service = {
        id: id,
        serviceName: (document.getElementById('serviceName') as HTMLInputElement).value,
        ratePerSqMeter: rateSq ? Number(rateSq) : null,
        ratePerPerson: ratePers ? Number(ratePers) : null
    };

    if (id === 0) {
        await fetch(API_SERVICES, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(service)
        });
    } else {
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

function editServiceById(id: number): void {
    const service = allServices.find(s => s.id === id);
    if (!service) return;

    (document.getElementById('service-id') as HTMLInputElement).value = service.id.toString();
    (document.getElementById('serviceName') as HTMLInputElement).value = service.serviceName;
    (document.getElementById('rateSq') as HTMLInputElement).value = service.ratePerSqMeter != null ? service.ratePerSqMeter.toString() : '';
    (document.getElementById('ratePers') as HTMLInputElement).value = service.ratePerPerson != null ? service.ratePerPerson.toString() : '';

    document.getElementById('service-form')?.scrollIntoView({ behavior: 'smooth' });
}

function resetServiceForm(): void {
    (document.getElementById('service-form') as HTMLFormElement).reset();
    (document.getElementById('service-id') as HTMLInputElement).value = '0';
}

async function deleteService(id: number): Promise<void> {
    if (!confirm('Видалити послугу?')) return;
    await fetch(`${API_SERVICES}/${id}`, { method: 'DELETE' });
    await loadServices();
    await loadReceipt();
}

// --- РОЗРАХУНОК КВИТАНЦІЇ (TENANTSERVICES) ---

async function loadReceipt(): Promise<void> {
    const tenantId = (document.getElementById('receipt-tenant-select') as HTMLSelectElement).value;
    const container = document.getElementById('receipt-details') as HTMLDivElement;

    if (!tenantId) {
        container.style.display = 'none';
        return;
    }

    const response = await fetch(`${API_RECEIPT}/${tenantId}`);
    if (!response.ok) return;

    const receipt: Receipt = await response.json();
    container.style.display = 'block';

    (document.getElementById('receipt-info') as HTMLParagraphElement).textContent =
        `Платник: ${receipt.fullName} (Рахунок: ${receipt.accountNumber}) | Площа: ${receipt.area} м² | Мешканців: ${receipt.occupantsCount}`;

    const tbody = document.getElementById('receipt-body') as HTMLTableSectionElement;
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

    (document.getElementById('receipt-total') as HTMLSpanElement).textContent = `${receipt.totalAmount.toFixed(2)} грн`;
}

async function assignServiceToTenant(): Promise<void> {
    const tenantId = Number((document.getElementById('receipt-tenant-select') as HTMLSelectElement).value);
    const serviceId = Number((document.getElementById('receipt-service-select') as HTMLSelectElement).value);

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

async function removeServiceFromTenant(tenantId: number, serviceId: number): Promise<void> {
    await fetch(`${API_RECEIPT}/${tenantId}/${serviceId}`, { method: 'DELETE' });
    await loadReceipt();
}

// Експорт функцій у глобальну область видимості
(window as any).editTenantById = editTenantById;
(window as any).deleteTenant = deleteTenant;
(window as any).resetTenantForm = resetTenantForm;
(window as any).editServiceById = editServiceById;
(window as any).deleteService = deleteService;
(window as any).resetServiceForm = resetServiceForm;
(window as any).loadReceipt = loadReceipt;
(window as any).assignServiceToTenant = assignServiceToTenant;
(window as any).removeServiceFromTenant = removeServiceFromTenant;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('tenant-form')?.addEventListener('submit', saveTenant);
    document.getElementById('service-form')?.addEventListener('submit', saveService);
    loadTenants();
    loadServices();
});