const toggle=document.querySelector('.mobile-toggle');
const nav=document.querySelector('.navlinks');
if(toggle&&nav){toggle.addEventListener('click',()=>nav.classList.toggle('open'));}
const form=document.querySelector('#quoteForm');
if(form){form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form);const subject=encodeURIComponent('Free Estimate Request - ELECTROLED LLC');const body=encodeURIComponent(`Name: ${d.get('name')}\nPhone: ${d.get('phone')}\nEmail: ${d.get('email')}\nService: ${d.get('service')}\n\nProject details:\n${d.get('message')}`);window.location.href=`mailto:support@electroledllc.net?subject=${subject}&body=${body}`;});}
