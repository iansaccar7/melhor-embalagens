// Catálogo provisório: substitua pelos produtos reais após confirmação da loja.
const products = [
{id:'001',name:'Copo descartável',category:'Descartáveis'},
{id:'002',name:'Prato descartável',category:'Descartáveis'},
{id:'003',name:'Talher descartável',category:'Descartáveis'},
{id:'004',name:'Marmitex',category:'Delivery'},
{id:'005',name:'Embalagem térmica',category:'Delivery'},
{id:'006',name:'Embalagem de alumínio',category:'Delivery'},
{id:'007',name:'Sacola plástica',category:'Sacos e sacolas'},
{id:'008',name:'Saco de papel',category:'Sacos e sacolas'},
{id:'009',name:'Saco para alimentos',category:'Sacos e sacolas'},
{id:'010',name:'Caixa para bolo',category:'Confeitaria e festa'},
{id:'011',name:'Forminha para doce',category:'Confeitaria e festa'},
{id:'012',name:'Bandeja para doces',category:'Confeitaria e festa'},
{id:'013',name:'Pote organizador',category:'Utilidades'},
{id:'014',name:'Pano de limpeza',category:'Utilidades'},
{id:'015',name:'Esponja de limpeza',category:'Utilidades'}
];
const categories=[...new Set(products.map(p=>p.category))];
const key='melhor-pedido-v1';let cart={},note='',category='Todos',drafts={};const $=s=>document.querySelector(s);let timer;
function validQty(q){return Number.isSafeInteger(q)&&q>0&&q<=999}
try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&typeof saved==='object'){for(const p of products){if(validQty(saved.cart?.[p.id]))cart[p.id]=saved.cart[p.id]}if(typeof saved.note==='string')note=saved.note.slice(0,2000)}}catch(e){$('#storage-note').textContent='Sua lista fica disponível nesta aba.'}
function save(){try{localStorage.setItem(key,JSON.stringify({cart,note}))}catch(e){$('#storage-note').textContent='Não foi possível salvar. Mantenha esta aba aberta.'}}
function notify(text){$('#toast').textContent=text;clearTimeout(timer);timer=setTimeout(()=>$('#toast').textContent='',3000)}
function normalized(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
const categoryVisuals={
  'Descartáveis':'<path d="M15 19h42l-7 48H22l-7-48ZM12 19h48M26 10h20M35 10v9"/>',
  'Delivery':'<path d="m10 30 24-14 24 14v28L34 71 10 58V30Zm0 0 24 14 24-14M34 44v27"/>',
  'Sacos e sacolas':'<path d="M13 25h42l-4 45H17l-4-45Zm11 3V15a10 10 0 0 1 20 0v13"/>',
  'Confeitaria e festa':'<path d="M10 37h48v27H10V37Zm-2 28h52M15 37c4-13 10-17 19-17s15 4 19 17M34 20V9"/>',
  'Utilidades':'<path d="m34 5 7 22 22 7-22 7-7 22-7-22-22-7 22-7 7-22Zm22 49 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z"/>'
};
function quantityControl(id,value,context){return `<div class="stepper"><button data-action="minus" data-id="${id}" data-context="${context}" aria-label="Diminuir quantidade de ${products.find(p=>p.id===id).name}" ${value<=1?'disabled':''}>−</button><input type="number" inputmode="numeric" min="1" max="999" value="${value}" data-id="${id}" data-context="${context}" aria-label="Quantidade de pacotes de ${products.find(p=>p.id===id).name}"><button data-action="plus" data-id="${id}" data-context="${context}" aria-label="Aumentar quantidade de ${products.find(p=>p.id===id).name}" ${value>=999?'disabled':''}>+</button></div>`}
function renderFilters(){$('#filters').innerHTML=['Todos',...categories].map(c=>`<button aria-pressed="${c===category}" data-category="${c}">${c}${c==='Todos'?' <span class="label">/ 15</span>':''}</button>`).join('')}
function renderProducts(){const query=normalized($('#search').value.trim());const list=products.filter(p=>(category==='Todos'||p.category===category)&&normalized(p.name).includes(query));$('#result-count').textContent=`${list.length} ${list.length===1?'produto':'produtos'}`;$('#products').innerHTML=list.length?list.map(p=>`<article class="product"><div class="product-meta"><span>ITEM ${p.id}</span><span>${p.category}</span></div><div class="product-visual" data-type="${p.category}"><svg viewBox="0 0 68 76" aria-hidden="true">${categoryVisuals[p.category]}</svg></div><h3>${p.name}</h3><p class="confirm">Disponibilidade sob consulta</p><p class="pack">Pacote e valor confirmados pela loja</p><div class="product-actions">${quantityControl(p.id,drafts[p.id]||1,'catalog')}<button class="add" data-action="add" data-id="${p.id}" aria-label="Adicionar ${p.name}">Adicionar <span aria-hidden="true">+</span></button></div></article>`).join(''):'<p class="empty">Nenhum item encontrado. Descreva o que precisa no campo de pedidos especiais.</p>'}
function update(){const count=Object.keys(cart).length;$('#count').textContent=count;$('#summary').textContent=count?`${count} ${count===1?'produto':'produtos'} · Revisar lista`:note.trim()?'Recado incluído · Revisar':'Nenhum item adicionado';document.querySelectorAll('.send-order').forEach(b=>b.disabled=!count&&!note.trim());save()}
function renderOrder(){const entries=products.filter(p=>cart[p.id]);$('#order-items').innerHTML=entries.length?entries.map(p=>`<div class="list-row"><strong>${p.name}</strong><span class="confirm">Quantidade por pacote e valor sob consulta</span><div class="list-controls">${quantityControl(p.id,cart[p.id],'order')}<button class="remove" data-action="remove" data-id="${p.id}" aria-label="Remover ${p.name}">Remover</button></div></div>`).join(''):'<p style="padding:24px 0">Sua lista ainda não tem produtos. Adicione os itens no catálogo.</p>';$('#order-note').textContent=note.trim()?`O que mais você precisa:\n${note.trim()}`:''}
function setQuantity(id,context,value,control){const qty=Math.max(1,Math.min(999,Math.floor(Number(value)||1)));if(context==='order'){cart[id]=qty;update()}else drafts[id]=qty;control.querySelector('input').value=qty;control.querySelector('[data-action="minus"]').disabled=qty===1;control.querySelector('[data-action="plus"]').disabled=qty===999}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.id,action=b.dataset.action;if(action==='minus'||action==='plus'){const control=b.closest('.stepper');setQuantity(id,b.dataset.context,Number(control.querySelector('input').value)+(action==='plus'?1:-1),control)}if(action==='add'){const qty=drafts[id]||1;cart[id]=Math.min(999,(cart[id]||0)+qty);update();notify(`${products.find(p=>p.id===id).name} adicionado à lista`)}if(action==='remove'){delete cart[id];update();renderOrder()}if(b.dataset.category){category=b.dataset.category;document.querySelectorAll('[data-category]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.category===category)));renderProducts()}if(b.dataset.jumpCategory){category=b.dataset.jumpCategory;$('#search').value='';renderFilters();renderProducts();$('#catalogo').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}});
document.addEventListener('change',e=>{if(e.target.matches('.stepper input'))setQuantity(e.target.dataset.id,e.target.dataset.context,e.target.value,e.target.closest('.stepper'))});
$('#search').addEventListener('input',renderProducts);$('#special').value=note;$('#special').addEventListener('input',e=>{note=e.target.value;update()});
$('#review').addEventListener('click',()=>{renderOrder();$('#order-dialog').showModal()});$('.close').addEventListener('click',()=>$('#order-dialog').close());$('#order-dialog').addEventListener('click',e=>{if(e.target===$('#order-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
function message(){const lines=['Olá, Melhor Embalagens & Utilidades!','Gostaria de consultar este pedido:',''];products.filter(p=>cart[p.id]).forEach(p=>lines.push(`• ${cart[p.id]} pacote(s) — ${p.name}`));if(note.trim())lines.push('','Também preciso de:',note.trim());lines.push('','Podem confirmar disponibilidade, quantidade por pacote e valores?','Gostaria de combinar a retirada ou consultar se fazem entrega.');return lines.join('\n')}
document.querySelectorAll('.send-order').forEach(b=>b.addEventListener('click',()=>{if(!Object.keys(cart).length&&!note.trim())return;window.open('https://wa.me/551122945382?text='+encodeURIComponent(message()),'_blank','noopener,noreferrer')}));
$('#year').textContent=new Intl.DateTimeFormat('en',{timeZone:'America/Sao_Paulo',year:'numeric'}).format(new Date());renderFilters();renderProducts();update();
