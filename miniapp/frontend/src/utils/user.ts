import WebApp from '@twa-dev/sdk';

export function getUserId(): number {
  if (WebApp && WebApp.initDataUnsafe?.user?.id) {
    return WebApp.initDataUnsafe.user.id;
  }
  
  // Fallback for testing in browser outside Telegram
  const stored = localStorage.getItem('vrebro_temp_user_id');
  if (stored) {
    return parseInt(stored, 10);
  }
  
  const newId = Math.floor(Math.random() * 9000000000) + 1000000000;
  localStorage.setItem('vrebro_temp_user_id', newId.toString());
  return newId;
}
