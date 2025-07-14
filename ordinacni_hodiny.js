const colors = {
  chotebor_p: "#009e7cb8",
  chotebor_m: "#d75d9eba",
  hlinsko: "#01bbffba",
  kolin: "#ff6900",
  malec: "#ffcd57",
};

const day_dict = {
  mon: "Pondělí",
  tue: "Úterý",
  wed: "Středa",
  thu: "Čtvrtek",
  fri: "Pátek",
  sat: "Sobota",
  sun: "Neděle",
};

async function loadData() {
  const params = new URLSearchParams(window.location.search);
  const townParam = params.get("town");
  const officeParam = params.get("office");
  const container = document.getElementById("content");

  const response = await fetch("ordinacni_hodiny.json?_=" + Date.now());
  const jsonData = await response.json();

  if (!townParam || !officeParam) {
    container.innerHTML = `<p style="color: red;">❌ Prosím, zadejte město a ordinaci v URL(např. ?town=chotebor_m&office=sportovko).</p>`;
    return;
  }

  //with params
  try {
    const matchedRecord = jsonData.find(
      (item) => item.town === townParam && item.office === officeParam
    );

    if (!matchedRecord) {
      container.innerHTML = `<p style="color: red;">❌ Nenalezeno: ${townParam} / ${officeParam}</p>`;
      return;
    }

    const bgColor = colors[townParam.toLowerCase()] || "#f5f5f5";
    let index = 0;

    let currHtml = `
      <div style="
        font-family: Arial, sans-serif;
        font-size: 16px;
        background-color: #ffffff;
        padding: 2px;
        max-width: 600px;
        margin: 0 auto;
        box-sizing: border-box;
        color: #333;
      ">
    `;

    for (const [day, values] of Object.entries(matchedRecord.regular_hours || {})) {
      if (day === "sun") continue;
      if (day === "sat" && (values.closed || !values.m_o)) continue;

      const dayName = day_dict[day] || day;
      const note = values?.note ? ` <span style="font-weight: 500;">(${values.note})</span>` : "";
      const rowColor = index % 2 === 0 ? bgColor : "#ffffff";
      index++;

      currHtml += `
        <div style="
          display: flex;
          padding: 10px 14px;
          background-color: ${rowColor};
          border-radius: 6px;
          margin-bottom: 6px;
          box-shadow: inset 0 0 0 1px #ddd;
          align-items: center;
        ">
          <span style="flex-shrink: 0; width: 100px; font-weight: 600;">${dayName}</span>
          <span style="
            flex-grow: 1; 
            margin-left: 12px; 
            text-align: right; 
            word-wrap: break-word; 
            white-space: normal; 
            max-width: calc(100% - 110px);
            display: inline-block;
          ">
            ${formatHours(values)}${note}
          </span>
        </div>`;
    }

    const futureChanges = (matchedRecord.irregular_changes || []).filter(change => isFutureDate(change.date));
    if (futureChanges.length > 0) {
      currHtml += `<h3 style="margin-top: 24px; font-size: 20px; border-bottom: 2px solid #ccc; padding-bottom: 4px;">Aktuální změny⚠️</h3>`;
      for (const change of futureChanges) {
        const isClosed = change.closed;
        const note = change.note ? ` <span style="font-weight: 500;">(${change.note})</span>` : "";

        currHtml += `
          <div style="
            display: flex;
            padding: 10px 14px;
            background-color: ${isClosed ? "#ffecec" : "#e6f7e6"};
            border-left: 4px solid ${isClosed ? "#ff4d4f" : "#4caf50"};
            border-radius: 6px;
            margin-bottom: 6px;
            align-items: center;
          ">
            <span style="flex-shrink: 0; width: 100px; font-weight: 600;">${formatDate(change.date)}</span>
            <span style="
              flex-grow: 1; 
              margin-left: 12px; 
              text-align: right; 
              word-wrap: break-word; 
              white-space: normal; 
              max-width: calc(100% - 110px);
              display: inline-block;
            ">
              ${isClosed ? "Zavřeno" : formatHours(change.day)}${change.note ? ` ${note}` : ""}
            </span>
          </div>`;
      }
    }

    currHtml += `</div>`;
    container.innerHTML = currHtml;
  } catch (error) {
    container.innerHTML = `<p style="color: red;">❌ Chyba při načítání dat.</p>`;
    console.error(error);
  }
}

function formatHours(day) {
  if (!day.m_o) return "Zavřeno";
  let ret = [];
  if (day.m_o?.length === 4) ret.push(day.m_o.slice(0, 2) + ":" + day.m_o.slice(2, 4));
  if (day.m_c?.length === 4) ret.push(" - " + day.m_c.slice(0, 2) + ":" + day.m_c.slice(2, 4));
  if (day.a_o?.length === 4) ret.push("︱" + day.a_o.slice(0, 2) + ":" + day.a_o.slice(2, 4));
  if (day.a_c?.length === 4) ret.push(" - " + day.a_c.slice(0, 2) + ":" + day.a_c.slice(2, 4));
  return ret.join("");
}

function isFutureDate(dateStr) {
  if (dateStr.length !== 8) return false;
  const year = parseInt(dateStr.slice(4, 8), 10);
  const month = parseInt(dateStr.slice(2, 4), 10) - 1;
  const day = parseInt(dateStr.slice(0, 2), 10);
  const inputDate = new Date(year, month, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return inputDate >= today;
}

function formatDate(dateStr) {
  if (dateStr.length !== 8) return dateStr;
  const year = dateStr.slice(4, 8);
  const month = dateStr.slice(2, 4);
  const day = dateStr.slice(0, 2);
  return `${day}.${month}.${year}`;
}

window.onload = loadData;
