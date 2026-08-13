const toggle=document.querySelector('.mobile-toggle');
const nav=document.querySelector('.navlinks');
if(toggle&&nav){toggle.addEventListener('click',()=>nav.classList.toggle('open'));}

const form=document.querySelector('#quoteForm');
if(form){
  const submitButton=document.querySelector('#quoteSubmit');
  const status=document.querySelector('#formStatus');

  form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    status.textContent='';
    status.className='form-status';
    submitButton.disabled=true;
    submitButton.textContent='Sending...';

    const payload=Object.fromEntries(new FormData(form).entries());

    try{
      const response=await fetch('/api/contact',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });

      const result=await response.json().catch(()=>({}));

      if(!response.ok){
        throw new Error(result.error||'Unable to send your request.');
      }

      form.reset();
      status.textContent='Thank you! Your estimate request was sent successfully. We will contact you soon.';
      status.className='form-status success';
    }catch(error){
      status.textContent=error.message||'Something went wrong. Please call 914 319 2256 or email support@electroledllc.net.';
      status.className='form-status error';
    }finally{
      submitButton.disabled=false;
      submitButton.textContent='Send Estimate Request';
    }
  });
}
