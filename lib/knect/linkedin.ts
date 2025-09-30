export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const extractLinkedInUsername = (url: string): string | null => {
  if (!url) return null;
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
  try {
    const urlObj = new URL(cleanUrl);
    const match = urlObj.pathname.match(/\/(in|pub)\/([^\/\?]+)/);
    return match ? match[2] : null;
  } catch {
    return null;
  }
};

export const openLinkedInProfile = (linkedinUrl: string): void => {
  if (!linkedinUrl) return;
  let normalizedUrl = linkedinUrl.trim();
  if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl;
  if (isMobileDevice()) {
    const username = extractLinkedInUsername(normalizedUrl);
    if (username) {
      const deepLink = `linkedin://profile/${username}`;
      window.location.href = deepLink;
      setTimeout(() => {
        window.location.href = normalizedUrl;
      }, 1500);
    } else {
      window.location.href = normalizedUrl;
    }
  } else {
    window.open(normalizedUrl, '_blank');
  }
};


