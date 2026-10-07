(() => {
  let preference = 'system';
  try {
    const saved = localStorage.getItem('jobfinder_theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') preference = saved;
  } catch {}
  const dark = preference === 'dark' || (preference === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  const theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
