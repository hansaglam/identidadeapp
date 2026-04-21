export interface DisciplineMuscles {
  karar: number; // Anlık karar verme
  direnc: number; // İç dirence karşı koyma
  baglam: number; // Farklı ortamda yapma
  energi: number; // Düşük enerjide yapma
  sosyal: number; // Sosyal baskı altında yapma
}

export const MUSCLE_NAMES: Record<keyof DisciplineMuscles, string> = {
  karar: "Karar Anlık",
  direnc: "Direnç Yönetimi",
  baglam: "Bağlam Değiştirme",
  energi: "Düşük Enerji",
  sosyal: "Sosyal Baskı",
};
