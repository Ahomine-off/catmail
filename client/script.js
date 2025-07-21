const form = document.getElementById('sendMailForm');
const inboxDiv = document.getElementById('inbox');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    sender: form.from.value,
    recipient: form.to.value,
    subject: form.subject.value,
    message: form.message.value
  };

  const res = await fetch('http://localhost:3000/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(result.message || "Message envoyé 🐾");

  loadInbox(data.sender);
});

async function loadInbox(user) {
  const res = await fetch(`http://localhost:3000/inbox/${user}`);
  const { inbox } = await res.json();

  inboxDiv.innerHTML = `<h2>Boîte de réception de ${user} 📥</h2>`;
  inbox.forEach(mail => {
    inboxDiv.innerHTML += `
      <div style="border:1px solid #ccc; padding:10px; margin:10px;">
        <strong>De :</strong> ${mail.sender} <br>
        <strong>Sujet :</strong> ${mail.subject} <br>
        <strong>Message :</strong> ${mail.message} <br>
        <em>📅 ${new Date(mail.timestamp).toLocaleString()}</em>
      </div>
    `;
  });
}
