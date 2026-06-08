import { EMPTY_CHARGES } from './quotationConstants';

function distributeByState(state, punjabAmount, islamabadAmount = punjabAmount) {
  if (state === 'Punjab') {
    return { punjab: punjabAmount, islamabad: 0 };
  }
  if (state === 'Islamabad') {
    return { punjab: 0, islamabad: 0 };
  }
  return { punjab: punjabAmount, islamabad: 0 };
}

function calculateRegistrationFee(cc, price) {
  if (cc <= 1000) return price * 0.01;
  if (cc <= 2000) return price * 0.02;
  return price * 0.04;
}

function calculateTokenTax(cc, price) {
  if (cc <= 1000) return 20000;
  if (cc <= 2000) return price * 0.002;
  return price * 0.003;
}

function calculateIncomeTax(cc, customerType) {
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

function calculateHpa(cc) {
  if (cc <= 1000) return 1200;
  if (cc <= 2000) return 2000;
  if (cc <= 3000) return 3000;
  return 0;
}

function calculateTransferFee(cc) {
  if (cc <= 1000) return 2750;
  if (cc <= 1800) return 5500;
  if (cc <= 3000) return 11000;
  return 0;
}

function calculateAdditionalRegFee(cc) {
  if (cc <= 1000) return 2000;
  if (cc <= 2000) return 4000;
  if (cc <= 3000) return 6000;
  return 0;
}

export function calculateNewVehicleCharges(form) {
  const cc = Number(form.cc || 0);
  const price = Number(form.carPrice || 0);
  const state = form.state || 'Punjab';

  const registrationFee = calculateRegistrationFee(cc, price);
  const tokenTax = calculateTokenTax(cc, price);
  const incomeTax = calculateIncomeTax(cc, form.customerType);
  const professionalTax = 200;
  const hpa = calculateHpa(cc);
  const transferFee = calculateTransferFee(cc);
  const additionalFee = calculateAdditionalRegFee(cc);

  const govtPlatformFee = state === 'Islamabad' ? 0 : 15;

  return {
    challan: {
      TransferChallanAmount: distributeByState(state, registrationFee),
      TokenTax: distributeByState(state, tokenTax),
      IncomeTax: distributeByState(state, incomeTax),
      ProfessionalTax: distributeByState(state, professionalTax),
      NumberPlate: {
        punjab: 0,
        islamabad: state === 'Islamabad' || state === 'Both' ? 1000 : 0,
      },
      SmartCard: {
        punjab: state === 'Punjab' || state === 'Both' ? 1300 : 0,
        islamabad: state === 'Islamabad' || state === 'Both' ? 2400 : 0,
      },
      AdvanceTax: distributeByState(state, 0),
      SpecialNoFee: distributeByState(state, 0),
      TransferFee: distributeByState(state, transferFee),
      HPA: distributeByState(state, hpa),
      CVT: distributeByState(state, 0),
      LateFee: distributeByState(state, 0),
      AdditionalRegistrationMarkFee: distributeByState(state, additionalFee),
      GovtFee: distributeByState(state, govtPlatformFee, 0),
    },
    services: { ...EMPTY_CHARGES.services },
  };
}

export function buildQuotationData(form, existingData = null) {
  if (form.vehicleType !== 'New') {
    return existingData || { ...EMPTY_CHARGES };
  }
  return calculateNewVehicleCharges(form);
}
