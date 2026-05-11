(function(){
  'use strict';
  const SUPABASE_URL = 'https://jwyxywlseonoazarhlzv.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3eXh5d2xzZW9ub2F6YXJobHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Mjg1NTMsImV4cCI6MjA5NDAwNDU1M30.L-yq0ibWJ3IbPazd09D1t1Qae1GgwCVh3bM8QzRWquI';

  const box = document.createElement('div');
  box.id = 'auth-menu-box';
  box.style.cssText = 'position:fixed;top:16px;right:16px;z-index:99999;font-family:system-ui,-apple-system,sans-serif;';

  const pill = document.createElement('div');
  pill.id = 'auth-user-pill';
  pill.style.cssText = 'display:none;align-items:center;gap:8px;background:#111;border:1px solid #333;border-radius:50px;padding:6px 12px;cursor:pointer;color:#fff;position:relative;user-select:none;';

  const avatar = document.createElement('img');
  avatar.style.cssText = 'width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid #c9a84c;';

  const nameEl = document.createElement('span');
  nameEl.style.cssText = 'max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;';

  const arrow = document.createElement('span');
  arrow.textContent = '▾';
  arrow.style.cssText = 'font-size:10px;color:#aaa;margin-left:2px;';

  pill.append(avatar, nameEl, arrow);

  const menu = document.createElement('div');
  menu.id = 'auth-dropdown';
  menu.style.cssText = 'display:none;position:absolute;top:calc(100% + 8px);right:0;background:#111;border:1px solid #333;border-radius:12px;padding:6px;min-width:190px;box-shadow:0 8px 24px rgba(0,0,0,0.6);';

  const items = [
    { label: '👤 Contul Meu', href: '/profile' },
    { label: '📊 Dashboard', href: '/dashboard' },
    { label: '🪄 Wizard', href: '/wizard' },
    { label: '🚪 Deconectare', action: 'logout' }
  ];

  items.forEach(i => {
    const a = document.createElement('a');
    a.href = i.href || '#';
    a.textContent = i.label;
    a.style.cssText = 'display:block;padding:10px 12px;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;transition:.15s;';
    a.onmouseover = () => a.style.background = '#222';
    a.onmouseout = () => a.style.background = 'transparent';
    if (i.action === 'logout') {
      a.onclick = async (e) => {
        e.preventDefault();
        if (window.__sb) {
          await window.__sb.auth.signOut();
          window.location.href = '/login';
        }
      };
    }
    menu.appendChild(a);
  });

  pill.appendChild(menu);
  box.appendChild(pill);
  document.body.appendChild(box);

  pill.onclick = (e) => { e.stopPropagation(); menu.style.display = menu.style.display === 'block' ? 'none' : 'block'; };
  document.addEventListener('click', () => menu.style.display = 'none');

  function loadSDK(){
    return new Promise(r=>{
      if(window.supabase) return r();
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload=r; document.head.appendChild(s);
    });
  }

  async function init(){
    await loadSDK();
    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.__sb = sb;

    function updateUI(session){
      if(session){
        const u = session.user;
        avatar.src = u.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email)}&background=c9a84c&color=000`;
        nameEl.textContent = u.user_metadata?.full_name || u.email.split('@')[0];
        pill.style.display = 'flex';
      } else {
        pill.style.display = 'none';
      }
    }

    const { data: { session } } = await sb.auth.getSession();
    updateUI(session);
    sb.auth.onAuthStateChange((e, s) => updateUI(s));

    const origFetch = window.fetch;
    window.fetch = async function(url, opts={}){
      const { data: { session: s } } = await sb.auth.getSession();
      if(s && typeof url === 'string' && url.startsWith('/api/')){
        opts.headers = opts.headers || {};
        opts.headers['Authorization'] = 'Bearer ' + s.access_token;
      }
      return origFetch.call(this, url, opts);
    };
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
