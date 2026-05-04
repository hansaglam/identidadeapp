/**
 * Kilometre taşı notları coachBanner ile bazen çakışır; bu satır coach notu BOŞ ise gösterilir.
 */
export function getJourneyMomentLine(dayNumber: number): string | null {
  switch (dayNumber) {
    case 1:
      return "Hoş geldin — beyin bugün sırayı ‘kayıt’ etmeye başlar; çıtayı yere indirmek doğru.";
    case 23:
      return "Faz 2 eşiği: tutarlılık baskın olduğunda kimlik tonu daha net duyulur.";
    case 45:
      return "Faz 3: çoğu hareket hâlâ fark ettirmez ama yol daha ‘kendinden’ gelir.";
    default:
      return null;
  }
}
