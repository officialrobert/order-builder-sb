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
import { InputTextarea } from 'primereact/inputtextarea';
import type { Product, Plan, AddOn } from '~/mock-data';

const CONTRACT_PERIODS = Array.from({ length: 24 }, (_, i) => ({
  label: `${i + 1} Months`,
  value: i + 1,
}));

const PLAN_TYPES = [
  { label: 'Tier Based', value: 'TierBased' },
  { label: 'One Time', value: 'OneTime' },
  { label: 'Volume', value: 'Volume' },
  { label: 'Usage', value: 'Usage' },
];

const BILLING_CYCLES = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Annual', value: 'annual' },
];

interface OrderBuilderProps {
  initialProducts: Product[];
  initialPlans: Plan[];
  initialAddOns: AddOn[];
  addOnPrices: Record<string, number>;
}

function OrderBuilder({
  initialProducts,
  initialPlans,
  initialAddOns,
  addOnPrices,
}: OrderBuilderProps): React.ReactNode {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [contractStartDate, setContractStartDate] = useState<Date>(new Date());
  const [contractPeriod, setContractPeriod] = useState(12);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);

  // Dialog Visibility
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showAddOnDialog, setShowAddOnDialog] = useState(false);

  // New Items State
  const [newProduct, setNewProduct] = useState({ name: '', description: '' });
  const [newPlan, setNewPlan] = useState<Partial<Plan>>({
    name: '',
    price: '0',
    planType: 'TierBased',
    billingCycle: 'monthly',
    isRecurring: true,
  });
  const [newAddOn, setNewAddOn] = useState({ name: '', price: 0 });

  // Data State (Starting with initial data from loader)
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [addOns, setAddOns] = useState<AddOn[]>(initialAddOns);
  const [localAddOnPrices, setLocalAddOnPrices] = useState(addOnPrices);

  // Pricing API State
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [calculatedCosts, setCalculatedCosts] = useState({
    monthlyCost: '0.00',
    totalAmount: '0.00',
    tax: '0.00',
  });

  // Calculate Price via API
  useEffect(() => {
    if (!selectedPlan) {
      setCalculatedCosts({
        monthlyCost: '0.00',
        totalAmount: '0.00',
        tax: '0.00',
      });
      return;
    }

    const calculatePrice = async () => {
      setLoadingPrice(true);
      try {
        const response = await fetch('/api/calculate-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planPrice: selectedPlan.price,
            addonIds: selectedAddOns.map((a) => a.id),
            contractPeriod,
            billingCycle: selectedPlan.billingCycle,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setCalculatedCosts(data);
        }
      } catch (error) {
        console.error('Failed to calculate price:', error);
      } finally {
        setLoadingPrice(false);
      }
    };

    const debounce = setTimeout(calculatePrice, 300);
    return () => clearTimeout(debounce);
  }, [selectedPlan, selectedAddOns, contractPeriod]);

  // Filtered Logic
  const availablePlans = plans.filter(
    (p) => p.productId === selectedProduct?.id,
  );
  const availableAddOns = addOns.filter(
    (a) => a.productId === selectedProduct?.id,
  );

  // Hydration guard
  if (!isHydrated) return null;

  const contractEndDate = new Date(contractStartDate);
  contractEndDate.setMonth(contractEndDate.getMonth() + contractPeriod);

  const totalAddOnsPrice = selectedAddOns.reduce(
    (sum, item) => sum + (localAddOnPrices[item.id] || 0),
    0,
  );

  const handleSaveProduct = () => {
    const product: Product = {
      ...newProduct,
      id: Math.random().toString(36).substr(2, 9),
      isAddOn: false,
      tenantId: 't1',
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    };
    setProducts([...products, product]);
    setShowProductDialog(false);
    setNewProduct({ name: '', description: '' });
  };

  const handleSavePlan = () => {
    if (!selectedProduct) return;
    const plan: Plan = {
      ...(newPlan as Plan),
      id: Math.random().toString(36).substr(2, 9),
      productId: selectedProduct.id,
      currency: 'usd',
      price: newPlan.price?.toString() || '0',
      description: null,
      prevPlanId: null,
      credits: null,
      metadata: null,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    };
    setPlans([...plans, plan]);
    setShowPlanDialog(false);
    setNewPlan({
      name: '',
      price: '0',
      planType: 'TierBased',
      billingCycle: 'monthly',
      isRecurring: true,
    });
  };

  const handleSaveAddOn = () => {
    if (!selectedProduct) return;
    const addOn: AddOn = {
      ...newAddOn,
      id: Math.random().toString(36).substr(2, 9),
      productId: selectedProduct.id,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    };
    setLocalAddOnPrices({ ...localAddOnPrices, [addOn.id]: newAddOn.price });
    setAddOns([...addOns, addOn]);
    setShowAddOnDialog(false);
    setNewAddOn({ name: '', price: 0 });
  };

  const cardHeader = (
    <div className="p-4 border-b">
      <h2 className="text-2xl font-bold text-gray-800">Order Builder</h2>
      <p className="text-gray-500">Consuming Data from Home Loader</p>
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

            <section>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Step 1: Select Product
                </label>
                <Button
                  label="New Product"
                  icon="pi pi-plus"
                  className="p-button-text p-button-sm font-bold"
                  onClick={() => setShowProductDialog(true)}
                />
              </div>
              <Dropdown
                value={selectedProduct}
                options={products}
                onChange={(e) => {
                  setSelectedProduct(e.value);
                  setSelectedPlan(null);
                  setSelectedAddOns([]);
                }}
                optionLabel="name"
                placeholder="Choose a Product"
                className="w-full"
              />
            </section>

            <section
              className={
                !selectedProduct ? 'opacity-50 pointer-events-none' : ''
              }
            >
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Step 2: Select Plan
                </label>
                <Button
                  label="New Plan"
                  icon="pi pi-plus"
                  className="p-button-text p-button-sm font-bold"
                  onClick={() => setShowPlanDialog(true)}
                  disabled={!selectedProduct}
                />
              </div>
              <Dropdown
                value={selectedPlan}
                options={availablePlans}
                onChange={(e) => setSelectedPlan(e.value)}
                optionLabel="name"
                placeholder={
                  selectedProduct ? 'Choose a Plan' : 'Select a product first'
                }
                className="w-full"
                itemTemplate={(option: Plan) => (
                  <div className="flex justify-between w-full">
                    <span>{option.name}</span>
                    <span className="font-bold">
                      ${option.price}/
                      {option.billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                )}
              />
            </section>

            <Divider />

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

            <section
              className={
                !selectedProduct ? 'opacity-50 pointer-events-none' : ''
              }
            >
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Add-ons Configuration
                </label>
                <Button
                  label="Add New Type"
                  icon="pi pi-plus"
                  className="p-button-text p-button-sm font-bold"
                  onClick={() => setShowAddOnDialog(true)}
                  disabled={!selectedProduct}
                />
              </div>
              <MultiSelect
                value={selectedAddOns}
                options={availableAddOns}
                onChange={(e) => setSelectedAddOns(e.value)}
                optionLabel="name"
                placeholder={
                  selectedProduct
                    ? 'Configure Add-ons'
                    : 'Select a product first'
                }
                className="w-full"
                display="chip"
                itemTemplate={(option: AddOn) => (
                  <div className="flex justify-between w-full">
                    <span>{option.name}</span>
                    <span className="font-bold">
                      ${localAddOnPrices[option.id] || 0}
                    </span>
                  </div>
                )}
              />
            </section>

            <Divider />

            <section
              className={`bg-blue-50 p-4 rounded-xl border border-blue-100 transition-opacity ${loadingPrice ? 'opacity-60' : 'opacity-100'}`}
            >
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-bold uppercase tracking-wider text-blue-700">
                  Pricing Summary
                </label>
                {loadingPrice && (
                  <i className="pi pi-spin pi-spinner text-blue-600"></i>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-blue-800">
                  <span>Product:</span>
                  <span className="font-semibold">
                    {selectedProduct?.name || 'None Selected'}
                  </span>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>Base Plan ({selectedPlan?.name || 'N/A'}):</span>
                  <span className="font-semibold">
                    ${selectedPlan?.price || 0} (
                    {selectedPlan?.billingCycle || 'N/A'})
                  </span>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>Total Add-ons:</span>
                  <span className="font-semibold">
                    ${totalAddOnsPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>Tax (Estimated):</span>
                  <span className="font-semibold">${calculatedCosts.tax}</span>
                </div>
                <div className="flex justify-between text-blue-800 pt-2 border-t border-blue-200">
                  <span>Effective Monthly:</span>
                  <span className="font-bold">
                    ${calculatedCosts.monthlyCost}
                  </span>
                </div>
                <div className="flex justify-between text-xl text-blue-900 font-black mt-2 pt-2 border-t-2 border-blue-300">
                  <span>Total Contract Value:</span>
                  <span>
                    $
                    {Number(calculatedCosts.totalAmount).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                      },
                    )}
                  </span>
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

      <Dialog
        header="Create New Product"
        visible={showProductDialog}
        style={{ width: '450px' }}
        onHide={() => setShowProductDialog(false)}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowProductDialog(false)}
              className="p-button-text"
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={handleSaveProduct}
              autoFocus
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Product Name</label>
            <InputText
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Description</label>
            <InputTextarea
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Create New Plan"
        visible={showPlanDialog}
        style={{ width: '500px' }}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-sm">Plan Type</label>
              <Dropdown
                value={newPlan.planType}
                options={PLAN_TYPES}
                onChange={(e) => setNewPlan({ ...newPlan, planType: e.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-sm">Billing Cycle</label>
              <Dropdown
                value={newPlan.billingCycle}
                options={BILLING_CYCLES}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, billingCycle: e.value })
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm">Price ($)</label>
            <InputNumber
              value={Number(newPlan.price)}
              onValueChange={(e) =>
                setNewPlan({ ...newPlan, price: e.value?.toString() || '0' })
              }
              mode="currency"
              currency="USD"
            />
          </div>
        </div>
      </Dialog>

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
            <label className="font-bold text-sm">Price ($)</label>
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
