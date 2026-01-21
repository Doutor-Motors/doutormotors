// Car brand images mapping
// Using generated images for brand cards

import brandToyota from '@/assets/cars/brand-toyota.jpg';
import brandHonda from '@/assets/cars/brand-honda.jpg';
import brandFord from '@/assets/cars/brand-ford.jpg';
import brandChevrolet from '@/assets/cars/brand-chevrolet.jpg';
import brandVolkswagen from '@/assets/cars/brand-volkswagen.jpg';
import brandBmw from '@/assets/cars/brand-bmw.jpg';
import brandMercedes from '@/assets/cars/brand-mercedes.jpg';
import brandAudi from '@/assets/cars/brand-audi.jpg';
import brandNissan from '@/assets/cars/brand-nissan.jpg';
import brandHyundai from '@/assets/cars/brand-hyundai.jpg';
import brandKia from '@/assets/cars/brand-kia.jpg';
import brandMazda from '@/assets/cars/brand-mazda.jpg';
import brandSubaru from '@/assets/cars/brand-subaru.jpg';
import brandJeep from '@/assets/cars/brand-jeep.jpg';
import brandDodge from '@/assets/cars/brand-dodge.jpg';
import brandChrysler from '@/assets/cars/brand-chrysler.jpg';
import brandLexus from '@/assets/cars/brand-lexus.jpg';
import brandAcura from '@/assets/cars/brand-acura.jpg';
import brandInfiniti from '@/assets/cars/brand-infiniti.jpg';
import brandVolvo from '@/assets/cars/brand-volvo.jpg';
import brandLandRover from '@/assets/cars/brand-land-rover.jpg';
import brandPorsche from '@/assets/cars/brand-porsche.jpg';
import brandTesla from '@/assets/cars/brand-tesla.jpg';
import brandMitsubishi from '@/assets/cars/brand-mitsubishi.jpg';
import brandBuick from '@/assets/cars/brand-buick.jpg';
import brandCadillac from '@/assets/cars/brand-cadillac.jpg';
import brandGmc from '@/assets/cars/brand-gmc.jpg';
import brandLincoln from '@/assets/cars/brand-lincoln.jpg';
import brandFiat from '@/assets/cars/brand-fiat.jpg';
import brandMini from '@/assets/cars/brand-mini.jpg';
import brandRam from '@/assets/cars/brand-ram.jpg';
import brandJaguar from '@/assets/cars/brand-jaguar.jpg';
import brandAlfaRomeo from '@/assets/cars/brand-alfa-romeo.jpg';
import brandPeugeot from '@/assets/cars/brand-peugeot.jpg';
import brandRenault from '@/assets/cars/brand-renault.jpg';
import brandCitroen from '@/assets/cars/brand-citroen.jpg';
import brandSaab from '@/assets/cars/brand-saab.jpg';
import brandDefault from '@/assets/cars/brand-default.jpg';
// Additional brands
import brandSuzuki from '@/assets/cars/brand-suzuki.jpg';
import brandSmart from '@/assets/cars/brand-smart.jpg';
import brandSaturn from '@/assets/cars/brand-saturn.jpg';
import brandScion from '@/assets/cars/brand-scion.jpg';
import brandSeat from '@/assets/cars/brand-seat.jpg';
import brandSkoda from '@/assets/cars/brand-skoda.jpg';
import brandPontiac from '@/assets/cars/brand-pontiac.jpg';
import brandPlymouth from '@/assets/cars/brand-plymouth.jpg';
import brandOldsmobile from '@/assets/cars/brand-oldsmobile.jpg';
import brandMercury from '@/assets/cars/brand-mercury.jpg';
import brandLada from '@/assets/cars/brand-lada.jpg';
import brandLancia from '@/assets/cars/brand-lancia.jpg';
import brandIsuzu from '@/assets/cars/brand-isuzu.jpg';
import brandHummer from '@/assets/cars/brand-hummer.jpg';
import brandGenesis from '@/assets/cars/brand-genesis.jpg';
import brandDaewoo from '@/assets/cars/brand-daewoo.jpg';
import brandDacia from '@/assets/cars/brand-dacia.jpg';

// Brand name to image mapping (case-insensitive)
const brandImages: Record<string, string> = {
  'toyota': brandToyota,
  'honda': brandHonda,
  'ford': brandFord,
  'chevrolet': brandChevrolet,
  'chevy': brandChevrolet,
  'volkswagen': brandVolkswagen,
  'vw': brandVolkswagen,
  'bmw': brandBmw,
  'mercedes': brandMercedes,
  'mercedes-benz': brandMercedes,
  'audi': brandAudi,
  'nissan': brandNissan,
  'hyundai': brandHyundai,
  'kia': brandKia,
  'mazda': brandMazda,
  'subaru': brandSubaru,
  'jeep': brandJeep,
  'dodge': brandDodge,
  'chrysler': brandChrysler,
  'lexus': brandLexus,
  'acura': brandAcura,
  'infiniti': brandInfiniti,
  'volvo': brandVolvo,
  'land rover': brandLandRover,
  'land-rover': brandLandRover,
  'landrover': brandLandRover,
  'porsche': brandPorsche,
  'tesla': brandTesla,
  'mitsubishi': brandMitsubishi,
  'buick': brandBuick,
  'cadillac': brandCadillac,
  'gmc': brandGmc,
  'lincoln': brandLincoln,
  'fiat': brandFiat,
  'mini': brandMini,
  'mini cooper': brandMini,
  'ram': brandRam,
  'jaguar': brandJaguar,
  'alfa romeo': brandAlfaRomeo,
  'alfa-romeo': brandAlfaRomeo,
  'alfaromeo': brandAlfaRomeo,
  'peugeot': brandPeugeot,
  'renault': brandRenault,
  'citroen': brandCitroen,
  'citroën': brandCitroen,
  'saab': brandSaab,
  // Additional brands with unique images
  'suzuki': brandSuzuki,
  'smart': brandSmart,
  'saturn': brandSaturn,
  'scion': brandScion,
  'seat': brandSeat,
  'skoda': brandSkoda,
  'škoda': brandSkoda,
  'pontiac': brandPontiac,
  'plymouth': brandPlymouth,
  'oldsmobile': brandOldsmobile,
  'mercury': brandMercury,
  'lada': brandLada,
  'lancia': brandLancia,
  'isuzu': brandIsuzu,
  'hummer': brandHummer,
  'genesis': brandGenesis,
  'daewoo': brandDaewoo,
  'dacia': brandDacia,
  // Fallback brands
  'geo': brandDefault,
  'daihatsu': brandDefault,
  'opel': brandVolkswagen, // Opel uses VW style
};

/**
 * Get the image URL for a car brand
 * Returns the specific brand image if available, otherwise returns a default image
 */
export function getBrandImage(brandName: string): string {
  const normalizedName = brandName.toLowerCase().trim();
  return brandImages[normalizedName] || brandDefault;
}

/**
 * Get the image URL for a car model
 * Uses the brand image as base since we generate brand-specific images
 */
export function getModelImage(brandName: string, _modelName: string): string {
  // Use brand image for models
  return getBrandImage(brandName);
}

/**
 * Check if a brand has a specific image available
 */
export function hasBrandImage(brandName: string): boolean {
  const normalizedName = brandName.toLowerCase().trim();
  return normalizedName in brandImages && brandImages[normalizedName] !== brandDefault;
}

/**
 * Get the default car image
 */
export function getDefaultCarImage(): string {
  return brandDefault;
}

export default {
  getBrandImage,
  getModelImage,
  hasBrandImage,
  getDefaultCarImage,
};
