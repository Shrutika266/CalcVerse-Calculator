// Conversion utilities and constants

export const areaUnits = {
  sq_km: { name: 'Square Kilometer (km²)', val: 1e6 },
  hectare: { name: 'Hectare (ha)', val: 10000 },
  sq_m: { name: 'Square Meter (m²)', val: 1 },
  sq_dm: { name: 'Square Decimeter (dm²)', val: 0.01 },
  sq_cm: { name: 'Square Centimeter (cm²)', val: 0.0001 },
  sq_mm: { name: 'Square Millimeter (mm²)', val: 1e-6 },
  sq_micron: { name: 'Square Micron (µm²)', val: 1e-12 },
  acre: { name: 'Acre (ac)', val: 4046.8564224 },
  ares: { name: 'Ar (a)', val: 100 },
  sq_yd: { name: 'Square Yard (yd²)', val: 0.83612736 },
  sq_ft: { name: 'Square Foot (ft²)', val: 0.09290304 },
  sq_in: { name: 'Square Inch (in²)', val: 0.00064516 },
  sq_rod: { name: 'Square Rod (rd²)', val: 25.29285264 },
};

export const lengthUnits = {
  meter: { name: 'Meter (m)', val: 1 },
  centimeter: { name: 'Centimeter (cm)', val: 0.01 },
  millimeter: { name: 'Millimeter (mm)', val: 0.001 },
  kilometer: { name: 'Kilometer (km)', val: 1000 },
  decimeter: { name: 'Decimeter (dm)', val: 0.1 },
  inch: { name: 'Inch (in)', val: 0.0254 },
  foot: { name: 'Foot (ft)', val: 0.3048 },
  yard: { name: 'Yard (yd)', val: 0.9144 },
  mile: { name: 'Mile (mi)', val: 1609.344 },
};

export const massUnits = {
  kg: { name: 'Kilogram (kg)', val: 1 },
  tonne: { name: 'Tonne (t)', val: 1000 },
  mg: { name: 'Milligram (mg)', val: 1e-6 },
  mcg: { name: 'Microgram (µg)', val: 1e-9 },
  quintal: { name: 'Quintal (q)', val: 100 },
  pound: { name: 'Pound (lb)', val: 0.45359237 },
  ounce: { name: 'Ounce (oz)', val: 0.028349523 },
  carat: { name: 'Carat (ct)', val: 0.0002 },
  grain: { name: 'Grain (gr)', val: 0.00006479891 },
  uk_cwt: { name: 'UK Hundredweight (cwt)', val: 50.80234544 },
  us_cwt: { name: 'US Hundredweight (cwt)', val: 45.359237 },
  stone: { name: 'Stone (st)', val: 6.35029318 },
  dram: { name: 'Dram (dr)', val: 0.001771845195 },
};

export const speedUnits = {
  m_s: { name: 'Meter per second (m/s)', val: 1 },
  light: { name: 'Lightspeed (c)', val: 299792458 },
  km_h: { name: 'Kilometer per hour (km/h)', val: 1 / 3.6 },
  km_s: { name: 'Kilometer per second (km/s)', val: 1000 },
  mph: { name: 'Mile per hour (mph)', val: 0.44704 },
  fps: { name: 'Foot per second (ft/s)', val: 0.3048 },
  ips: { name: 'Inch per second (in/s)', val: 0.0254 },
};

export const timeUnits = {
  sec: { name: 'Second (s)', val: 1 },
  min: { name: 'Minute (min)', val: 60 },
  hour: { name: 'Hour (h)', val: 3600 },
  day: { name: 'Day (d)', val: 86400 },
  week: { name: 'Week (wk)', val: 604800 },
  month: { name: 'Month (mo)', val: 2629746 }, // Average month 30.4368 days
  year: { name: 'Year (yr)', val: 31556952 }, // Average year 365.2425 days
  milli: { name: 'Millisecond (ms)', val: 1e-3 },
  micro: { name: 'Microsecond (µs)', val: 1e-6 },
  nano: { name: 'Nanosecond (ns)', val: 1e-9 },
  pico: { name: 'Picosecond (ps)', val: 1e-12 },
};

export const volumeUnits = {
  liter: { name: 'Liter (L)', val: 1 },
  cubic_m: { name: 'Cubic Meter (m³)', val: 1000 },
  cubic_dm: { name: 'Cubic Decimeter (dm³)', val: 1 },
  cubic_cm: { name: 'Cubic Centimeter (cm³)', val: 0.001 },
  cubic_mm: { name: 'Cubic Millimeter (mm³)', val: 1e-6 },
  hectoliter: { name: 'Hectoliter (hL)', val: 100 },
  deciliter: { name: 'Deciliter (dL)', val: 0.1 },
  centiliter: { name: 'Centiliter (cL)', val: 0.01 },
  milliliter: { name: 'Milliliter (mL)', val: 0.001 },
  cubic_ft: { name: 'Cubic Foot (ft³)', val: 28.316846592 },
  cubic_in: { name: 'Cubic Inch (in³)', val: 0.016387064 },
  cubic_yd: { name: 'Cubic Yard (yd³)', val: 764.554857984 },
  acre_foot: { name: 'Acre-foot (ac-ft)', val: 1233481.8375 },
};

// Custom temperature conversions
export function convertTemperature(value: number, from: string, to: string): number {
  if (isNaN(value)) return 0;
  
  // Convert from input unit to Kelvin
  let kelvin = 273.15;
  switch (from) {
    case 'celsius':
      kelvin = value + 273.15;
      break;
    case 'fahrenheit':
      kelvin = (value - 32) / 1.8 + 273.15;
      break;
    case 'kelvin':
      kelvin = value;
      break;
    case 'rankine':
      kelvin = value / 1.8;
      break;
    case 'reaumur':
      kelvin = value / 0.8 + 273.15;
      break;
  }

  // Convert from Kelvin to target unit
  switch (to) {
    case 'celsius':
      return kelvin - 273.15;
    case 'fahrenheit':
      return (kelvin - 273.15) * 1.8 + 32;
    case 'kelvin':
      return kelvin;
    case 'rankine':
      return kelvin * 1.8;
    case 'reaumur':
      return (kelvin - 273.15) * 0.8;
    default:
      return kelvin;
  }
}

// Numerical system conversion helper
export function convertNumeralSystem(value: string, fromBase: 'dec' | 'bin' | 'oct' | 'hex'): {
  dec: string;
  bin: string;
  oct: string;
  hex: string;
  error?: string;
} {
  const cleanVal = value.trim();
  if (!cleanVal) {
    return { dec: '', bin: '', oct: '', hex: '' };
  }

  let decimalValue: number;

  try {
    switch (fromBase) {
      case 'dec':
        if (!/^-?\d+$/.test(cleanVal)) throw new Error('Invalid Decimal format');
        decimalValue = parseInt(cleanVal, 10);
        break;
      case 'bin':
        if (!/^[01]+$/.test(cleanVal)) throw new Error('Invalid Binary format');
        decimalValue = parseInt(cleanVal, 2);
        break;
      case 'oct':
        if (!/^[0-7]+$/.test(cleanVal)) throw new Error('Invalid Octal format');
        decimalValue = parseInt(cleanVal, 8);
        break;
      case 'hex':
        if (!/^[0-9a-fA-F]+$/.test(cleanVal)) throw new Error('Invalid Hexadecimal format');
        decimalValue = parseInt(cleanVal, 16);
        break;
    }

    if (isNaN(decimalValue)) {
      throw new Error('Parsing error');
    }

    // Convert decimal value to all other systems
    return {
      dec: decimalValue.toString(10),
      bin: decimalValue.toString(2),
      oct: decimalValue.toString(8),
      hex: decimalValue.toString(16).toUpperCase(),
    };
  } catch (err: any) {
    return {
      dec: fromBase === 'dec' ? value : '',
      bin: fromBase === 'bin' ? value : '',
      oct: fromBase === 'oct' ? value : '',
      hex: fromBase === 'hex' ? value : '',
      error: err.message || 'Invalid format',
    };
  }
}
