/* ==================================================================
   The order form. Shared by the homepage and the order page so the
   two can never drift apart — one fix applies to both.
   ================================================================== */
let submitted = false;   // one order per page load, no matter what

let selectedBox = '';

function selectBox(el, name, price) {
  document.querySelectorAll('.box-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedBox = name + ' ' + price;
}

async function submitOrder() {
  const name = document.getElementById('sender-name').value.trim();
  const email = document.getElementById('sender-email').value.trim();
  const kid = document.getElementById('kid-name').value.trim();
  const age = document.getElementById('kid-age').value.trim();
  const street = document.getElementById('street').value.trim();
  const city   = document.getElementById('city').value.trim();
  const state  = document.getElementById('state').value.trim();
  const zip    = document.getElementById('zip').value.trim();
  if (!street || !city || !state || !zip) {
    alert('Please fill in the full address — street, city, state and ZIP.\n\nWithout all four we cannot mail the box.');
    return;
  }
  if (!/^\d{5}(-\d{4})?$/.test(zip)) {
    alert('That ZIP code does not look right. It should be 5 digits, like 92656.');
    return;
  }
  const address = street + ', ' + city + ', ' + state + ' ' + zip;
  const notes = document.getElementById('notes').value.trim();

  if (!selectedBox || !name || !email || !kid || !address) {
    alert('Please fill in all required fields and pick a box!');
    return;
  }

  const subject = encodeURIComponent('Joy Box Order — ' + selectedBox);
  const body = encodeURIComponent(
    'Box: ' + selectedBox + '\n' +
    'From: ' + name + '\n' +
    'Email: ' + email + '\n' +
    "Kid's name: " + kid + '\n' +
    "Kid's age: " + age + '\n' +
    'Address: ' + address + '\n' +
    'Notes: ' + (notes || 'None')
  );

  const btn = document.querySelector('.btn');
  if (submitted) return;          // already ordered on this page
  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const res = await fetch('https://qbzpyhsbrjagyqsruzcb.supabase.co/rest/v1/orders', {
      method: 'POST',
      headers: {
        'apikey': 'sb_publishable_fD1zz60o4p8oEDmWDKJeNg_wd-IAhbs',
        'Authorization': 'Bearer sb_publishable_fD1zz60o4p8oEDmWDKJeNg_wd-IAhbs',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ box: selectedBox, sender_name: name, sender_email: email, kid_name: kid, kid_age: age, address, notes })
    });

    if (res.ok || res.status === 201) {
      // Do NOT navigate to a mailto here. Sending the buyer into their mail
      // app made them come back to a reloaded page and press order again —
      // that is where every duplicate order came from. Show the confirmation
      // instead and leave the button dead for good.
      submitted = true;
      document.getElementById('confirm-email').textContent = email;
      document.getElementById('success').style.display = 'block';
      document.getElementById('success').scrollIntoView({ behavior: 'smooth' });
      btn.textContent = '✅ ORDER PLACED!';
      btn.disabled = true;
    } else {
      btn.disabled = false;
      btn.textContent = '🎁 PLACE ORDER';
      alert('Something went wrong. Try again!');
    }
  } catch(e) {
    btn.disabled = false;
    btn.textContent = '🎁 PLACE ORDER';
    alert('Something went wrong. Try again!');
  }
}
