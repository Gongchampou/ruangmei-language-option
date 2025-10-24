document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("contactForm");if(!e)return;e.classList.add("form"),e.setAttribute("action","#"),e.setAttribute("method","POST"),e.dataset.formsubmitEmail="jonahkamei42@gmail.com",e.setAttribute("onsubmit","return false"),e.innerHTML=`
            <div class="row">
              <div class="field">
                <label for="name">Your name</label>
                <input class="input" type="text" id="name" name="name" required />
              </div>
              <div class="field">
                <label for="email">Email</label>
                <input class="input" type="email" id="email" name="email" required />
              </div>
            </div>

            <div class="row">
              <div class="field">
                <label for="topic">Subject</label>
                <select id="topic" name="subject" class="input" required>
                  <option value="Contribution">Contribution</option>
                  <option value="Correction">Correction</option>
                  <option value="Permission">Permission</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div class="field">
                <label for="ref">Reference (optional)</label>
                <input class="input" type="text" id="ref" name="reference" placeholder="Link or short note" />
              </div>
            </div>

            <div class="field">
              <label for="message">Message</label>
              <textarea class="textarea" id="message" name="message" required placeholder="Write your message..."></textarea>
            </div>

            <div class="actions">
              <button id="sendBtn" class="btn primary" type="button">Send</button>
            </div>

            <input type="hidden" name="_captcha" value="false">
  `;let t=()=>{let t=e.dataset&&e.dataset.formsubmitEmail?e.dataset.formsubmitEmail:"",a=t?`https://formsubmit.co/ajax/${encodeURIComponent(t)}`:"https://formsubmit.co/ajax/";fetch(a,{method:e.method,body:new FormData(e),headers:{Accept:"application/json"}}).then(t=>{t.ok?(alert("✅ Message sent successfully!"),e.reset()):alert("❌ Something went wrong. Please try again.")}).catch(()=>alert("⚠️ Network error. Please check your connection."))};e.addEventListener("submit",e=>{e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation&&e.stopImmediatePropagation(),t()});let a=e.querySelector("#sendBtn");a&&a.addEventListener("click",e=>{e.preventDefault(),t()})});