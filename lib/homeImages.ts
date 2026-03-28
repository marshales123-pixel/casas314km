const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/fotos`;

export const homeImages = {
  hero: `${storageBase}/hero-principal.jpg`,
  barrio: [
    `${storageBase}/entrada.jpg`,
    `${storageBase}/paisaje2.jpg`,
    `${storageBase}/entorno-general-1.jpg`,
    `${storageBase}/entorno-general-2.jpg`,
  ],
  playa: [
    `${storageBase}/playa-dunas.jpg`,
    `${storageBase}/playa-vista-aerea.jpg`,
  ],
  amenities: [
    `${storageBase}/pileta-general.jpg`,
    `${storageBase}/juegos-infantiles.jpg`,
    `${storageBase}/cancha-futbol.jpg`,
    `${storageBase}/club-house-atardecer.jpg`,
  ],
};
