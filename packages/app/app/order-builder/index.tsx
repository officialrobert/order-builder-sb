import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Divider } from 'primereact/divider';
import { MultiSelect } from 'primereact/multiselect';

const CONTRACT_PERIODS = Array.from({ length: 24 }, (_, i) => ({
  label: `${i + 1} Months`,
  value: i + 1,
}));

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
}

const INITIAL_PLANS: Plan[] = [
  { id: '1', name: 'Standard Plan', price: 99 },
  { id: '2', name: 'Premium Plan', price: 199 },
];

const INITIAL_ADDONS: AddOn[] = [
  { id: '1', name: 'Priority Support', price: 50 },
  { id: '2', name: 'Advanced Analytics', price: 150 },
  { id: '3', name: 'White Labeling', price: 300 },
];

function OrderBuilder(): React.ReactNode {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [contractStartDate, setContractStartDate] = useState<Date>(new Date());
  const [contractPeriod, setContractPeriod] = useState(12);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);

  // Dialog State
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showAddOnDialog, setShowAddOnDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', price: 0 });
  const [newAddOn, setNewAddOn] = useState({ name: '', price: 0 });

  // Data State
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [addOns, setAddOns] = useState<AddOn[]>(INITIAL_ADDONS);

  // Hydration guard - ensures PrimeReact components only render in browser
  if (!isHydrated) {
    return null;
  }

  const contractEndDate = new Date(contractStartDate);
  contractEndDate.setMonth(contractEndDate.getMonth() + contractPeriod);

  const totalPlanPrice = selectedPlan ? selectedPlan.price : 0;
  const totalAddOnsPrice = selectedAddOns.reduce(
    (sum, item) => sum + item.price,
    0,
  );
  const totalAmount = (totalPlanPrice + totalAddOnsPrice) * contractPeriod;

  const handleSavePlan = () => {
    const plan = { ...newPlan, id: Math.random().toString(36).substr(2, 9) };
    setPlans([...plans, plan]);
    setShowPlanDialog(false);
    setNewPlan({ name: '', price: 0 });
  };

  const handleSaveAddOn = () => {
    const addOn = { ...newAddOn, id: Math.random().toString(36).substr(2, 9) };
    setAddOns([...addOns, addOn]);
    setShowAddOnDialog(false);
    setNewAddOn({ name: '', price: 0 });
  };

  const cardHeader = (
    <div className="p-4 border-b">
      <h2 className="text-2xl font-bold text-gray-800">Order Builder</h2>
      <p className="text-gray-500">
        Configure your custom order and pricing quote
      </p>
    </div>
  );

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 pb-24 px-4 overflow-y-auto pt-24">
      <div className="w-full max-w-2xl mt-[100px]">
        <Card
          className="slick-card shadow-2xl border-0 overflow-hidden"
          header={cardHeader}
        >
          <div className="flex flex-col gap-6">
            {/* Customer Information */}
            <section>
              <label className="block text-sm font-semibold mb-2 uppercase tracking-wider text-gray-600">
                Customer Information
              </label>
              <div className="p-inputgroup flex-1">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-user"></i>
                </span>
                <InputText
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full"
                />
              </div>
            </section>

            <Divider />

            {/* Plan Selection */}
            <section>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Select Plan
                </label>
                <Button
                  label="New Plan"
                  icon="pi pi-plus"
                  className="p-button-text p-button-sm font-bold"
                  onClick={() => setShowPlanDialog(true)}
                />
              </div>
              <Dropdown
                value={selectedPlan}
                options={plans}
                onChange={(e) => setSelectedPlan(e.value)}
                optionLabel="name"
                placeholder="Choose a Plan"
                className="w-full"
                itemTemplate={(option: Plan) => (
                  <div className="flex justify-between w-full">
                    <span>{option.name}</span>
                    <span className="font-bold">${option.price}/mo</span>
                  </div>
                )}
              />
            </section>

            <Divider />

            {/* Deal Structure */}
            <section>
              <label className="block text-sm font-semibold mb-4 uppercase tracking-wider text-gray-600">
                Deal Structure
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-500">
                    Contract Length
                  </span>
                  <Dropdown
                    value={contractPeriod}
                    options={CONTRACT_PERIODS}
                    onChange={(e) => setContractPeriod(e.value)}
                    placeholder="Duration"
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-500">
                    Start Date
                  </span>
                  <Calendar
                    value={contractStartDate}
                    onChange={(e) => setContractStartDate(e.value as Date)}
                    showIcon
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-xs font-bold text-gray-500">
                    End Date
                  </span>
                  <InputText
                    value={contractEndDate.toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    disabled
                    className="w-full bg-gray-100 font-medium"
                  />
                </div>
              </div>
            </section>

            <Divider />

            {/* Add-ons Section */}
            <section>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Add-ons Configuration
                </label>
                <Button
                  label="Add New Type"
                  icon="pi pi-plus"
                  className="p-button-text p-button-sm font-bold"
                  onClick={() => setShowAddOnDialog(true)}
                />
              </div>
              <MultiSelect
                value={selectedAddOns}
                options={addOns}
                onChange={(e) => setSelectedAddOns(e.value)}
                optionLabel="name"
                placeholder="Configure Add-ons"
                className="w-full"
                display="chip"
                itemTemplate={(option: AddOn) => (
                  <div className="flex justify-between w-full">
                    <span>{option.name}</span>
                    <span className="font-bold">${option.price}</span>
                  </div>
                )}
              />
            </section>

            <Divider />

            {/* Price Breakdown */}
            <section className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-blue-700">
                Pricing Summary
              </label>
              <div className="space-y-2">
                <div className="flex justify-between text-blue-800">
                  <span>Base Plan ({selectedPlan?.name || 'N/A'}):</span>
                  <span className="font-semibold">${totalPlanPrice}/mo</span>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>Total Add-ons:</span>
                  <span className="font-semibold">
                    ${totalAddOnsPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-blue-800 pt-2 border-t border-blue-200">
                  <span>Monthly Average:</span>
                  <span className="font-bold">
                    ${(totalPlanPrice + totalAddOnsPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xl text-blue-900 font-black mt-2 pt-2 border-t-2 border-blue-300">
                  <span>Total Contract Value:</span>
                  <span>${totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </section>

            <div className="mt-4">
              <Button
                label="Generate Quote"
                icon="pi pi-check-circle"
                className="p-button-lg w-full shadow-lg"
                severity="success"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Create Plan Dialog */}
      <Dialog
        header="Create New Plan"
        visible={showPlanDialog}
        style={{ width: '400px' }}
        onHide={() => setShowPlanDialog(false)}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowPlanDialog(false)}
              className="p-button-text"
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={handleSavePlan}
              autoFocus
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Plan Name</label>
            <InputText
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Monthly Price ($)</label>
            <InputNumber
              value={newPlan.price}
              onValueChange={(e) =>
                setNewPlan({ ...newPlan, price: e.value || 0 })
              }
              mode="currency"
              currency="USD"
            />
          </div>
        </div>
      </Dialog>

      {/* Create Add-on Dialog */}
      <Dialog
        header="Create New Add-on"
        visible={showAddOnDialog}
        style={{ width: '400px' }}
        onHide={() => setShowAddOnDialog(false)}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowAddOnDialog(false)}
              className="p-button-text"
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={handleSaveAddOn}
              autoFocus
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Add-on Name</label>
            <InputText
              value={newAddOn.name}
              onChange={(e) =>
                setNewAddOn({ ...newAddOn, name: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">One-time Price ($)</label>
            <InputNumber
              value={newAddOn.price}
              onValueChange={(e) =>
                setNewAddOn({ ...newAddOn, price: e.value || 0 })
              }
              mode="currency"
              currency="USD"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default OrderBuilder;
