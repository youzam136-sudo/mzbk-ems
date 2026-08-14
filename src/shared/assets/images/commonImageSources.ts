function createProfileDataUri() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none"><defs><radialGradient id="bg" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(17 14) rotate(48.5) scale(38)"><stop stop-color="#F5F0D8"/><stop offset=".48" stop-color="#5E7CBB"/><stop offset="1" stop-color="#121727"/></radialGradient><linearGradient id="shirt" x1="12" y1="29" x2="37" y2="45" gradientUnits="userSpaceOnUse"><stop stop-color="#4FD7E9"/><stop offset="1" stop-color="#5970FF"/></linearGradient></defs><circle cx="24" cy="24" r="24" fill="url(%23bg)"/><circle cx="24" cy="20" r="8" fill="#F6DEC7"/><path d="M16 19.2C16.5 11.5 22.4 9.3 28.6 12.1C31.4 13.4 33.1 15.7 33.5 19.2C30.1 16.9 26 16.1 21.1 17.2C19.2 17.6 17.5 18.3 16 19.2Z" fill="#1D2334"/><path d="M10.5 42C12.4 33.8 18.4 29 24 29C29.6 29 35.6 33.8 37.5 42H10.5Z" fill="url(%23shirt)"/><circle cx="20.7" cy="21" r="1.1" fill="#253047"/><circle cx="27.3" cy="21" r="1.1" fill="#253047"/><path d="M21 24.8C22.8 26.2 25.2 26.2 27 24.8" stroke="#B8846F" stroke-width="1.4" stroke-linecap="round"/></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const commonImageSources = {
  topbarProfile: {
    src: createProfileDataUri(),
    alt: '상단 프로필 이미지'
  }
} as const;
