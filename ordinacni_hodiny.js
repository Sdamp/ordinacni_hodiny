const colors = {
  chotebor_p: "#009e7cb8",
  chotebor_m: "#d75d9eba",
  hlinsko: "#01bbffba",
  kolin: "#ff6900",
  malec: "#ffcd57",
};

const day_dict = {
  "mon" : "Pondělí",
  "tue" : "Úterý",
  "wed" : "Středa",
  "thu" : "Čtvrtek",
  "fri" : "Pátek",
  "sat" : "Sobota",
  "sun" : "Neděle",
}

async function loadData() {
  const params = new URLSearchParams(window.location.search);
  const townParam = params.get("town");
  const officeParam = params.get("office");
  const container = document.getElementById("content");

  if (!townParam || !officeParam) {
    container.innerHTML = "<p>❌ Missing URL parameters (e.g., ?town=chotebor_m&office=sportovko)</p>";
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

    const bgColor = colors[townParam.toLowerCase()] || "white";
    let index = 0;
    let currHtml = "<div>";
    currHtml += `<h3>Stálý rozvrh:</h3>`;

    for (const [day, values] of Object.entries(matchedRecord.regular_hours || {})) {
      if (day === "sun") continue;
      if (day === "sat" && (values.closed || !values.m_o)) continue;

      const dayName = day_dict[day] || day;
      const note = values?.note ? ` (${values.note})` : "";
      const rowColor = index % 2 === 0 ? bgColor : "white";
      index++;
      currHtml += `<div style="display:flex; justify-content: space-between; padding: 8px; background-color: ${rowColor}; border-bottom: 1px solid #ddd;">`;
      currHtml += `<span>${dayName}:</span>`;
      currHtml += `<span>${formatHours(values)}`;
      if (note) currHtml += ` (${note})</span>`;
      currHtml += `</div>`;
    }
    currHtml += `</div>`;
    currHtml += `<h3>Nepravidelné změny:</h3><ul>`;
    currHtml += `<div>`;

    for (const change of matchedRecord.irregular_changes || []) {
      console.log(change);
      currHtml += `<div style="display:flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #ddd;">`;
      currHtml += `<span>${formatDate(change.date)}:</span>`;
      if (change.closed) {
        currHtml += `<span>Zavřeno`;
      } else {
        currHtml += `<span>${formatHours(change.day)}`;
      }
      if (change.note) currHtml += ` (${change.note})</span>`;
      currHtml += `</div>`;
    }
    currHtml += `</div>`;

    container.innerHTML = currHtml;
  } catch (error) {
    container.innerHTML = "<p>❌ Error loading data.</p>";
    console.error(error);
  }
}

function formatHours(day) {
  if (!day.m_o) return "Zavřeno";
  let ret = [];
  if (day.m_o && day.m_o.length === 4) {
    ret.push(day.m_o.slice(0,2) + ":" + day.m_o.slice(2,4));
  }
  if (day.m_c && day.m_c.length === 4) {
    ret.push(" - ");
    ret.push(day.m_c.slice(0,2) + ":" + day.m_c.slice(2,4));
  }
  if (day.a_o && day.a_o.length === 4) {
    ret.push(";\n");
    ret.push(day.a_o.slice(0,2) + ":" + day.a_o.slice(2,4));
  }
  if (day.a_c && day.a_c.length === 4) {
    ret.push(" - ");
    ret.push(day.a_c.slice(0,2) + ":" + day.a_c.slice(2,4));
  }
  return ret.length ? ret.join('') : "";
}

function formatDate(dateStr) {
  if (dateStr.length !== 8) return dateStr;
  const year = dateStr.slice(4, 8);
  const month = dateStr.slice(2, 4);
  const day = dateStr.slice(0, 2);
  return `${day}.${month}.${year}`;
}

window.onload = loadData;
