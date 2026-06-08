export const CHALLAN_LABELS = {
  TransferChallanAmount: 'Transfer Challan Amount',
  TokenTax: 'Token Tax',
  IncomeTax: 'Income Tax',
  ProfessionalTax: 'Professional Tax',
  NumberPlate: 'No. Plates',
  SmartCard: 'Smart Card',
  AdvanceTax: 'W-H Tax / Advance Tax',
  SpecialNoFee: 'Special No Fee',
  TransferFee: 'Transfer Fee',
  HPA: 'HPA (Hire Purchase Agreement)',
  CVT: 'CVT Capital Value Tax',
  LateFee: 'Late Fee',
  AdditionalRegistrationMarkFee: 'Additional Reg. Mark Fee',
  GovtFee: 'Govt Platform Charges',
};

export const SERVICE_LABELS = {
  PhysicalInspection: 'Physical Inspection',
  SpecialNoFee172: 'Special No Fee (172)',
  NoDemandCharges: 'No Demand Charges',
  OlpRequestLetterFee: 'Olp Request Letter Fee',
  PaidByEPayChoiceNo: 'Paid By E Pay For Choice No',
  ServiceCharges: 'Service Charges',
  OtherCharges: '',
};

export const EMPTY_CHARGES = {
  challan: Object.keys(CHALLAN_LABELS).reduce((acc, key) => {
    acc[key] = { punjab: 0, islamabad: 0 };
    return acc;
  }, {}),
  services: Object.keys(SERVICE_LABELS).reduce((acc, key) => {
    acc[key] = { punjab: 0, islamabad: 0 };
    return acc;
  }, {}),
};

export function sumColumn(items, column) {
  return Object.values(items).reduce(
    (sum, item) => sum + Number(item[column] || 0),
    0
  );
}

export function formatAmount(value) {
  const num = Number(value || 0);
  return num === 0 ? '-' : num.toLocaleString();
}
