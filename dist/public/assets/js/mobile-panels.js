// Toggle sidebar/chat panels pe mobil
document.querySelectorAll('.wz-chat-toggle, .sb-logo, .new-chat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = document.querySelector('.sidebar, aside.sidebar, .wz-chat-panel');
    if (panel) panel.classList.toggle('open');
  });
});
// Închide panel la tap în afara lui
document.addEventListener('click', (e) => {
  const panel = document.querySelector('.sidebar.open, aside.sidebar.open, .wz-chat-panel.open');
  if (panel && !panel.contains(e.target) && !e.target.closest('.wz-chat-toggle, .sb-logo, .new-chat-btn')) {
    panel.classList.remove('open');
  }
});
