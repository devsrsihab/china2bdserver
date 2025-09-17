export const normalizePhone = (phone: string): string => {
    if (phone.startsWith("+880")) {
      return phone; // already normalized
    }
    if (phone.startsWith("01")) {
      return "+88" + phone; // convert 01XXXXXXXXX → +880XXXXXXXXX
    }
    return phone; // fallback (shouldn't happen if validation worked)
  };