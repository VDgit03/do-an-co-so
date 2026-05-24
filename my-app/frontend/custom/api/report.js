// button wallet
function toggleWalletMenu() {
    const menu = document.getElementById("walletMenu");
    const arrow = document.querySelector(".arrow");
    menu.classList.toggle("show");
    arrow.classList.toggle("rotate");
}

// button user
function toggleUserMenu() {
    document.getElementById("userMenu").classList.toggle("show");
}
document.addEventListener("click", (e) => {
    const user = document.querySelector(".user");
    const menu = document.getElementById("userMenu");
    if (user && !user.contains(e.target)) {
        menu.classList.remove("show");
    }
});


// time
function updateDateTime() {
    const now = new Date();
    const weekdays = [
        "Chủ nhật",
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7"
    ];
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const text = `${weekdays[now.getDay()]}, ${day} tháng ${month}, ${year}`;
    document.getElementById("current-date").textContent = text;
}
updateDateTime();
setInterval(updateDateTime, 60000);

const REPORTS = {}
let DATA = {};
let currentMonth = 5;
let currentYear = 2026;

/* month trans */

document.addEventListener("DOMContentLoaded", () => {

    const monthText =
        document.getElementById("monthText");

    const prevBtn =
        document.getElementById("prevMonth");

    const nextBtn =
        document.getElementById("nextMonth");


    function renderMonth() {

        monthText.textContent =
            `Tháng ${currentMonth}/${currentYear}`;
    }

    prevBtn.addEventListener("click", () => {

        currentMonth--;

        if (currentMonth < 1) {

            currentMonth = 12;
            currentYear--;
        }

        renderMonth();

        loadReport(currentMonth, currentYear);
    });

    nextBtn.addEventListener("click", () => {

        currentMonth++;

        if (currentMonth > 12) {

            currentMonth = 1;
            currentYear++;
        }

        renderMonth();

        loadReport(currentMonth, currentYear);
    });

    renderMonth();

    loadReport(currentMonth, currentYear);

});


/* chart */

let pieChart = null;
let barChart = null;
let lineChart = null;
let stackedChart = null;

/* =========================================================
   HELPERS
========================================================= */

const fmt = v => {

    return (v * 1000000).toLocaleString("vi-VN") + " ₫";
};

function renderMonth() {
    monthText.textContent = `Tháng ${currentMonth}/${currentYear}`;
}

function buildLegend(containerId, labels, colors, values) {

    const total = values
        ? values.reduce((a, b) => a + b, 0)
        : null;

    const el = document.getElementById(containerId);

    if (!el) return;

    el.innerHTML = labels.map((lbl, i) => {

        const pct = total
            ? ` ${Math.round(values[i] / total * 100)}%`
            : "";

        return `
            <span class="legend-item">
                <span 
                    class="legend-dot" 
                    style="background:${colors[i]}"
                ></span>

                ${lbl}${pct}
            </span>
        `;
    }).join("");
}

/* =========================================================
   LOAD REPORT
========================================================= */

async function loadReport(month, year) {

    try {

        const res = await fetch(
            `http://localhost:3000/api/reports?month=${month}&year=${year}`
        );

        DATA = await res.json();

        rerenderAll();

    } catch (err) {

        console.error(err);
    }
}

/* =========================================================
   SUMMARY
========================================================= */

function renderSummary() {

    const s = DATA.summary;

    document.getElementById("val-income").textContent =
        fmt(s.income);

    document.getElementById("val-expense").textContent =
        fmt(s.expense);


    const incBadge =
        document.getElementById("badge-income");

    incBadge.textContent =
        `${s.incomeChange > 0 ? "+" : ""}${s.incomeChange}% so với tháng trước`;

    incBadge.className =
        "metric-badge " + (s.incomeChange >= 0 ? "up" : "down");

    const expBadge =
        document.getElementById("badge-expense");

    expBadge.textContent =
        `${s.expenseChange > 0 ? "+" : ""}${s.expenseChange}% so với tháng trước`;

    expBadge.className =
        "metric-badge " + (s.expenseChange <= 0 ? "up" : "down");

}

/* =========================================================
   PIE CHART
========================================================= */

function renderPie() {

    const { labels, colors, values } = DATA.categories;

    buildLegend(
        "pie-legend",
        labels,
        colors,
        values
    );

    if (pieChart) {
        pieChart.destroy();
    }

    pieChart = new Chart(
        document.getElementById("cPie"),
        {
            type: "pie",

            data: {
                labels,

                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: "#fff"
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        callbacks: {
                            label: ctx =>
                                `${ctx.label}: ${fmt(ctx.raw)}`
                        }
                    }
                }
            }
        }
    );
}

/* =========================================================
   BAR CHART
========================================================= */

function renderBar() {

    const { labels, income, expense } =
        DATA.monthly;

    if (barChart) {
        barChart.destroy();
    }

    barChart = new Chart(
        document.getElementById("cBar"),
        {
            type: "bar",

            data: {
                labels,

                datasets: [
                    {
                        label: "Thu nhập",
                        data: income,
                        backgroundColor: "#5DCAA5",
                        borderRadius: 4
                    },

                    {
                        label: "Chi tiêu",
                        data: expense,
                        backgroundColor: "#F0997B",
                        borderRadius: 4
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        ticks: {
                            callback: v => v + "tr"
                        }
                    }
                }
            }
        }
    );
}

/* =========================================================
   LINE CHART
========================================================= */

function renderLine() {

    const { labels, income, expense } =
        DATA.monthly;

    const saving = income.map((v, i) =>
        +(v - expense[i]).toFixed(1)
    );

    if (lineChart) {
        lineChart.destroy();
    }

    lineChart = new Chart(
        document.getElementById("cLine"),
        {
            type: "line",

            data: {
                labels,

                datasets: [

                    {
                        label: "Thu nhập",
                        data: income,
                        borderColor: "#1D9E75",
                        backgroundColor: "#1D9E7515",
                        fill: true,
                        tension: 0.4
                    },

                    {
                        label: "Chi tiêu",
                        data: expense,
                        borderColor: "#D85A30",
                        backgroundColor: "#D85A3015",
                        fill: true,
                        tension: 0.4
                    },

                    {
                        label: "Tiết kiệm",
                        data: saving,
                        borderColor: "#378ADD",
                        borderDash: [5, 4],
                        tension: 0.4
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        }
    );
}

/* =========================================================
   STACKED CHART
========================================================= */

function renderStacked(months = 12) {

    const labels =
        DATA.monthly.labels.slice(-months);

    const datasets =
        DATA.categories.labels.map((name, i) => ({
            label: name,
            data: DATA.categoryMonthly[i].slice(-months),
            backgroundColor: DATA.categories.colors[i]
        }));

    if (stackedChart) {
        stackedChart.destroy();
    }

    stackedChart = new Chart(
        document.getElementById("cStacked"),
        {
            type: "bar",

            data: {
                labels,
                datasets
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    x: {
                        stacked: true
                    },

                    y: {
                        stacked: true,

                        ticks: {
                            callback: v => v + "tr"
                        }
                    }
                }
            }
        }
    );
}

/* =========================================================
   RERENDER ALL
========================================================= */

function rerenderAll() {

    renderSummary();

    renderPie();

    renderBar();

    renderLine();

    buildLegend(
        "stacked-legend",
        DATA.categories.labels,
        DATA.categories.colors
    );

    renderStacked(12);
}

// /* =========================================================
//    MONTH BUTTON EVENTS
// ========================================================= */

// prevBtn.addEventListener("click", () => {

//     currentMonth--;

//     if (currentMonth < 1) {

//         currentMonth = 12;

//         currentYear--;
//     }

//     renderMonth();

//     loadReport(
//         currentMonth,
//         currentYear
//     );
// });

/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderMonth();

        loadReport(
            currentMonth,
            currentYear
        );
    }
);