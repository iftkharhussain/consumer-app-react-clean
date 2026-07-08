/* eslint-disable */
/**
 * Hardcoded vehicle data for the UI/UX phase (USE_MOCK_DATA = true).
 * Swap to the real backend later by flipping USE_MOCK_DATA in config/carFunnel/config.js.
 */

export const YEARS = [
  2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010,
];

export const MAKES = [
  'Toyota', 'Honda', 'Ford', 'Hyundai', 'Mazda', 'Nissan',
  'Chevrolet', 'Volkswagen', 'BMW', 'Kia', 'Subaru', 'Jeep',
];

export const MODELS_BY_MAKE = {
  Toyota: ['Corolla', 'Camry', 'RAV4', 'Highlander', 'Tacoma', 'Prius'],
  Honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V', 'Odyssey'],
  Ford: ['F-150', 'Escape', 'Explorer', 'Mustang', 'Edge', 'Bronco'],
  Hyundai: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona', 'Palisade'],
  Mazda: ['Mazda3', 'CX-5', 'CX-30', 'Mazda6', 'MX-5', 'CX-9'],
  Nissan: ['Sentra', 'Altima', 'Rogue', 'Murano', 'Kicks', 'Pathfinder'],
  Chevrolet: ['Malibu', 'Equinox', 'Traverse', 'Silverado', 'Trax', 'Blazer'],
  Volkswagen: ['Jetta', 'Golf', 'Tiguan', 'Atlas', 'Passat', 'Taos'],
  BMW: ['3 Series', '5 Series', 'X3', 'X5', 'X1', 'X7'],
  Kia: ['Forte', 'K5', 'Sportage', 'Sorento', 'Soul', 'Telluride'],
  Subaru: ['Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'Ascent'],
  Jeep: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Gladiator', 'Renegade'],
};

// Shape mirrors what the real getModels() returns: { value, label, fullData }.
export function buildMockModels(year, make) {
  const names = MODELS_BY_MAKE[make] || ['Base', 'Sport', 'Limited'];
  return names.map((name, i) => ({
    value: `${1000 + i}-0`,
    label: name,
    fullData: {
      viccCode: 1000 + i,
      extVicc: 0,
      model: name,
      modelFr: name,
      label: name,
      bodyStyle: i % 2 === 0 ? 'Sedan' : 'SUV',
      bodyType: i % 2 === 0 ? 'Sedan' : 'SUV',
      cylinder: '4',
      fuelType: 'Gas',
      year,
      make,
    },
  }));
}

// Canned VIN lookup result.
export const MOCK_VIN_RESULT = [
  {
    label: 'Camry',
    model: 'Camry',
    modelFr: 'Camry',
    viccCode: 1001,
    extVicc: 0,
    year: 2022,
    make: 'Toyota',
    bodyStyle: 'Sedan',
    fuelType: 'Gas',
  },
];
