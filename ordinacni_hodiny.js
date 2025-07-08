async function loadData() {
  const params = new URLSearchParams(window.location.search);
  const townParam = params.get("town");
  const officeParam = params.get("office");
  const container = document.getElementById("content");

  if (!townParam || !officeParam) {
    container.innerHTML = "<p>❌ Missing URL parameters (e.g., ?town=chotebor&office=sportovko)</p>";
    return;
  }

  try {
    const response = await fetch("ordinacni_hodiny.json?_=" + Date.now());
    const jsonData = await response.json();

    const matchedRecord = jsonData.find(
      item => item.town === townParam && item.office === officeParam
    );

    if (!matchedRecord) {
      container.innerHTML = `<p>❌ Not found: ${townParam} / ${officeParam}</p>`;
      return;
    }

    let regularHoursHtml = "";
    for (const [day, values] of Object.entries(matchedRecord.regular_hours || {})) {
      const hours = `${values?.m_o || ""}–${values?.m_c || ""} / ${values?.a_o || ""}–${values?.a_c || ""}`;
      const note = values?.note ? ` (${values.note})` : "";
      regularHoursHtml += `<li><strong>${day}:</strong> ${hours}${note}</li>`;
    }

    const today = new Date();
    const todayStr = today.toLocaleDateString("cs-CZ").split(".").reverse().join("");
    const irregularToday = matchedRecord.irregular_changes
      ?.filter(change => change.date === todayStr)
      .map(change => {
        if (change.closed) {
          return `<li><strong>Closed today</strong> – ${change.note || ""}</li>`;
        }
        const hours = `${change.day?.m_o || ""}–${change.day?.m_c || ""} / ${change.day?.a_o || ""}–${change.day?.a_c || ""}`;
        return `<li><strong>Special hours today:</strong> ${hours} (${change.note || ""})</li>`;
      }) || [];

    container.innerHTML = `
      <h2>${matchedRecord.town} – ${matchedRecord.office}</h2>
      <p><strong>Nurse:</strong> ${matchedRecord.nurse || "-"}</p>
      <p><strong>Phone:</strong> ${matchedRecord.phone || "-"}</p>
      <p><strong>Email:</strong> ${matchedRecord.email || "-"}</p>
      <h3>Regular Hours</h3>
      <ul>${regularHoursHtml}</ul>
      ${irregularToday.length > 0 ? `<h3>Today's Changes</h3><ul>${irregularToday.join("")}</ul>` : ""}
    `;
  } catch (error) {
    container.innerHTML = "<p>❌ Error loading data.</p>";
    console.error(error);
  }
}

window.onload = loadData;
