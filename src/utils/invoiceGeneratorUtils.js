import { EMPTY_CHARGES } from './quotationConstants';

function distributeByState(state, amount) {
  const value = Number(amount || 0);
  if (state === 'Punjab') return { punjab: value, islamabad: 0 };
  if (state === 'Islamabad') return { punjab: 0, islamabad: value };
  return { punjab: value, islamabad: value };
}

export function buildInvoiceGeneratorTotals(form) {
  const challan = distributeByState(form.state, form.challanAmount);
  const services = distributeByState(form.state, form.serviceCharges);
  return {
    challanPunjab: challan.punjab,
    challanIslamabad: challan.islamabad,
    servicePunjab: services.punjab,
    serviceIslamabad: services.islamabad,
    grandPunjab: challan.punjab + services.punjab,
    grandIslamabad: challan.islamabad + services.islamabad,
  };
}

export function buildInvoiceGeneratorData() {
  return { ...EMPTY_CHARGES };
}
