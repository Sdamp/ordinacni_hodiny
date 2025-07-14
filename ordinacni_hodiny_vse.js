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
  const container = document.getElementById("content");
  try {
    const response = await fetch("ordinacni_hodiny.json?_=" + Date.now());
    const jsonData = await response.json();

    const townsMap = {};
    jsonData.forEach(item => {
        if (!townsMap[item.town]) {
        townsMap[item.town] = [];
        }
        if (!townsMap[item.town].includes(item.office)) {
        townsMap[item.town].push(item.office);
        }
    });

    let html = `<h3>Aktuální změny:</h3><div style="display: flex; flex-wrap: wrap; gap: 10px;">`;
    for (const [town, offices] of Object.entries(townsMap)) {
        const color = colors[town] || "#eee";
        html += `<div style="background-color: ${color}; padding: 5px; border-radius: 5px; margin: 5px;"> <h3 style="border-bottom: 2px solid white; text-align: center;">${town}</h3>`; 
        for (const office of offices) {
            html += `<div style="margin-bottom: 5px;">`;
            html += `<strong style="border-bottom: 2px solid;">${office}</strong> <div style="margin: 10px;">`;
            const record = jsonData.find(item => item.town === town && item.office === office);
            if (!record || !record.irregular_changes || Object.keys(record.irregular_changes).length === 0) {
              html += `<p><em>Žádné aktuální změny</em></p>`;
            } else {
              for (const change of Object.values(record.irregular_changes)) {
                if (!isFutureDate(change.date)) continue;
                const isClosed = change.closed;
                const note = change.note ? ` <span style="font-weight: 500;">(${change.note})</span>` : "";
                html += `<div style="
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
                        display: inline-block;">
                        ${isClosed ? "Zavřeno" : formatHours(change.day)}${note}
                    </span>
                </div>`;
              }
            }
            html += `</div></div>`;
        }
        html += `</div>`;
    }

    container.innerHTML = html + `</div>`;

    } catch (error) {
        console.log(error);
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
