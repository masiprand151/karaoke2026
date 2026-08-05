import { useEffect, useState } from "react";

export default function useSetting() {
  const [setting, setSetting] = useState({});

  useEffect(() => {
    window.electron.getSetting().then((value) => {
      setSetting(value);
    });
  }, []);

  return { setting };
}
