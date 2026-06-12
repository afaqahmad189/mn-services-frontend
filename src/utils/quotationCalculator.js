import { EMPTY_CHARGES } from './quotationConstants';

function distributeByState(state, punjabAmount, islamabadAmount = 0) {
  if (state === 'Punjab') {
    return { punjab: punjabAmount || 0, islamabad: 0 };
  }
  if (state === 'Islamabad') {
    return { punjab: 0, islamabad: islamabadAmount || 0 };
  }
  return { punjab: punjabAmount || 0, islamabad: islamabadAmount || 0 };
}

// PUNJAB CALCULATIONS
function calculateRegistrationFeePb(cc, price) {
  if (cc <= 1000) return price * 0.01;
  if (cc <= 2000) return price * 0.02;
  return price * 0.04;
}

function calculateTokenTaxPb(cc, price) {
  if (cc <= 1000) return 20000;
  if (cc <= 2000) return price * 0.002;
  return price * 0.003;
}

function calculateIncomeTaxPb(cc, customerType) {
  const filerRates = [
    { min: 0, max: 1000, amount: 10000 },
    { min: 1001, max: 1299, amount: 1500 },
    { min: 1300, max: 1500, amount: 2500 },
    { min: 1600, max: 1800, amount: 3750 },
    { min: 1801, max: 2000, amount: 4500 },
    { min: 2001, max: 3000, amount: 10000 },
  ];
  const tier = filerRates.find((r) => cc >= r.min && cc <= r.max);
  const base = tier ? tier.amount : 0;
  return customerType === 'NonFiler' ? base * 3 : base;
}

function calculateHpaPb(cc) {
  if (cc <= 1000) return 1200;
  if (cc <= 2000) return 2000;
  if (cc <= 3000) return 3000;
  return 0;
}

function calculateTransferFeePb(cc) {
  if (cc <= 1000) return 2750;
  if (cc <= 1800) return 5500;
  if (cc <= 3000) return 11000;
  return 0;
}

function calculateAdditionalRegFeePb(cc) {
  if (cc <= 1000) return 2000;
  if (cc <= 2000) return 4000;
  if (cc <= 3000) return 6000;
  return 0;
}

// ISLAMABAD CALCULATIONS
function calculateRegistrationFeeIsb(cc, price) {
  if (cc <= 1000) return price * 0.01;
  if (cc <= 2000) return price * 0.02;
  return price * 0.04;
}

function calculateTokenTaxIsb(cc) {
  if (cc <= 1000) return 10000;
  if (cc <= 1200) return 1500;
  if (cc <= 1500) return 4000;
  if (cc <= 2000) return 5000;
  if (cc <= 2500) return 8000;
  return 12000; // 2501-3000
}

function calculateIncomeTaxIsb(cc, customerType) {
  let base = 0;
  if (cc <= 1000) base = 10000;
  else if (cc <= 1200) base = 1500;
  else if (cc <= 1300) base = 1750;
  else if (cc <= 1500) base = 2500;
  else if (cc <= 1600) base = 3750;
  else if (cc <= 2000) base = 4500;
  else base = 10000; // 2001-3000

  return customerType === 'NonFiler' ? base * 2 : base;
}

export function calculateVehicleCharges(form) {
  const cc = Number(form.cc || 0);
  const price = Number(form.carPrice || 0);
  const state = form.state || 'Both';

  // Punjab
  const regFeePb = calculateRegistrationFeePb(cc, price);
  const tokenPb = calculateTokenTaxPb(cc, price);
  const incomePb = calculateIncomeTaxPb(cc, form.customerType);
  const profPb = 200;
  const hpaPb = calculateHpaPb(cc);
  const transferPb = calculateTransferFeePb(cc);
  const addlFeePb = calculateAdditionalRegFeePb(cc);
  const govtPlatformPb = 15;

  // Islamabad
  const regFeeIsb = calculateRegistrationFeeIsb(cc, price);
  const tokenIsb = calculateTokenTaxIsb(cc);
  const incomeIsb = calculateIncomeTaxIsb(cc, form.customerType);
  const profIsb = 100;
  const hpaIsb = 0;
  const transferIsb = 0;
  const addlFeeIsb = 0;
  const govtPlatformIsb = 0;

  return {
    challan: {
      TransferChallanAmount: distributeByState(state, regFeePb, regFeeIsb),
      TokenTax: distributeByState(state, tokenPb, tokenIsb),
      IncomeTax: distributeByState(state, incomePb, incomeIsb),
      ProfessionalTax: distributeByState(state, profPb, profIsb),
      NumberPlate: distributeByState(state, 0, 1000),
      SmartCard: distributeByState(state, 1300, 1500),
      AdvanceTax: distributeByState(state, 0, 0),
      SpecialNoFee: distributeByState(state, 0, 0),
      TransferFee: distributeByState(state, transferPb, transferIsb),
      HPA: distributeByState(state, hpaPb, hpaIsb),
      CVT: distributeByState(state, 0, 0),
      LateFee: distributeByState(state, 0, 0),
      AdditionalRegistrationMarkFee: distributeByState(state, addlFeePb, addlFeeIsb),
      GovtFee: distributeByState(state, govtPlatformPb, govtPlatformIsb),
    },
    services: { ...EMPTY_CHARGES.services },
  };
}

export function buildQuotationData(form, existingData = null) {
  // Use these calculations if vehicleType is New, Used, or Imported
  if (['New', 'Used', 'Imported'].includes(form.vehicleType)) {
    return calculateVehicleCharges(form);
  }
  return existingData || { ...EMPTY_CHARGES };
}
