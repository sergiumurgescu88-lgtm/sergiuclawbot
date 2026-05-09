(function(){
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('mobileMenu');
  const overlay= document.getElementById('navOverlay');
  if(!toggle||!menu||!overlay) return;

  function closeMenu(){ menu.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow=''; }
  function openMenu(){ menu.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow='hidden'; }

  toggle.addEventListener('click', ()=> menu.classList.contains('open') ? closeMenu() : openMenu());
  overlay.addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(a=> a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeMenu(); });
})();
