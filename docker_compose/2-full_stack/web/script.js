const API_URL = '/api/materias';

async function loadMaterias() {
  const status = document.getElementById('status');
  const list = document.getElementById('materia-list');

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const materias = await response.json();

    status.remove();

    materias.forEach((materia) => {
      const card = document.createElement('div');
      const typeClass = `type-${materia.type.toLowerCase()}`;
      card.className = `materia-card ${typeClass}`;
      card.innerHTML = `
        <h2>${materia.name}</h2>
        <div class="type">${materia.type}</div>
        <p>${materia.description}</p>
        <p><strong>Effect:</strong> ${materia.effect}</p>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    status.textContent = 'Failed to load materias. Is the API running?';
    console.error(err);
  }
}

loadMaterias();
