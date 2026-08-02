import { useEffect, useState } from "react";

export default function useBackgroundTheme(imageUrl) {
  const [isDark, setIsDark] = useState(true);

  const [theme, setTheme] = useState({
    primaryColor: "#1677ff",
    backgroundColor: "#001529",
  });

  // ==============================
  // DARK / LIGHT DARI SETTING
  // ==============================
  useEffect(() => {
    window.electron.getSetting().then((value) => {
      console.log("SETTING COLOR:", value?.color);

      setIsDark(value?.color === "dark");
    });
  }, []);

  // ==============================
  // WARNA DARI BACKGROUND
  // ==============================
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();

    img.crossOrigin = "anonymous";
    img.src = `${imageUrl}?v=${Date.now()}`;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 50;
      canvas.height = 50;

      ctx.drawImage(img, 0, 0, 50, 50);

      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        setTheme({
          primaryColor: `rgb(${r}, ${g}, ${b})`,
          backgroundColor: `rgb(${r}, ${g}, ${b})`,
        });
      } catch (error) {
        console.error("Gagal membaca warna background:", error);
      }
    };

    img.onerror = (error) => {
      console.error("Gagal load background:", error);
    };
  }, [imageUrl]);

  return {
    ...theme,

    isDark,

    textColor: isDark ? "#ffffff" : "#111111",
  };
}
