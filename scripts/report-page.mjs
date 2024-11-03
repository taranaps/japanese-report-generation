import { checkAuth, logout } from "./auth.js";
import { db } from "./firebaseConfig.mjs";
import {collection,getDocs,getFirestore,doc,getDoc,where,query,} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Check authentication status
checkAuth();

// Attach logout function to the logout button
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".logout").addEventListener("click", logout);
});

//--------------------------SCROLL TEMPLATES----------------------//

const imageScroll = document.getElementById("image-scroll");
const arrowUp = document.getElementById("arrow-up");
const arrowDown = document.getElementById("arrow-down");

// Variables to control scrolling
let scrollPosition = 0;
const scrollStep = 150; // Adjust this value to control how much the images move on each click

// Update maximum scroll based on the image container size
function updateMaxScroll() {
  const maxScroll =
    imageScroll.scrollHeight - imageScroll.parentElement.offsetHeight;
  return maxScroll > 0 ? maxScroll : 0;
}

// Scroll up by clicking the arrow
arrowUp.addEventListener("click", () => {
  if (scrollPosition > 0) {
    scrollPosition -= scrollStep;
    if (scrollPosition < 0) scrollPosition = 0; // Prevent over-scrolling
    imageScroll.scrollTo({ top: scrollPosition, behavior: "smooth" });
  }
  updateArrowVisibility();
});

// Scroll down by clicking the arrow
arrowDown.addEventListener("click", () => {
  const maxScroll = updateMaxScroll();
  if (scrollPosition < maxScroll) {
    scrollPosition += scrollStep;
    if (scrollPosition > maxScroll) scrollPosition = maxScroll; // Prevent over-scrolling
    imageScroll.scrollTo({ top: scrollPosition, behavior: "smooth" });
  }
  updateArrowVisibility();
});

// Handle manual scrolling with mouse or trackpad
imageScroll.addEventListener("scroll", () => {
  scrollPosition = imageScroll.scrollTop;
  updateArrowVisibility();
});

// Update arrow visibility based on scroll position
function updateArrowVisibility() {
  const maxScroll = updateMaxScroll();
  arrowUp.style.visibility = scrollPosition > 0 ? "visible" : "hidden";
  arrowDown.style.visibility =
    scrollPosition < maxScroll ? "visible" : "hidden";
}

// Initialize arrow visibility
updateArrowVisibility();

//--------------------TEMPLATE SELECTION-------------------------//



let selectedTemplate = "";

document.addEventListener("DOMContentLoaded", async () => {
  const images = document.querySelectorAll(".image-container img");
  const templates = document.querySelectorAll(".workspace > div");
  // let selectTemplate;

  function hideAllTemplates() {
    templates.forEach((template) => {
      template.style.display = "none";
    });
  }
  const batchSelect = document.getElementById("batchSelect");
  async function getFilteredDocuments(batchName) {
    try {
      const collectionName = await getLatestCollection();
      if (!collectionName) {
        console.error("No collection name found");
        return null;
      }

      const colRef = collection(db, collectionName);
      const q = query(colRef, where("batchName", "==", batchName));
      const snapshot = await getDocs(q);

      const filteredData = snapshot.docs.map((doc) => doc.data());
      return filteredData;
    } 
    catch (error) {
      console.error("Error fetching filtered documents:", error);
      return null;
    }
  }

  async function populateBatchOptions() {
    try {
      const collectionName = await getLatestCollection();
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);

      const batchNames = [...new Set(snapshot.docs.map((doc) => doc.data().batchName)),];

      batchSelect.innerHTML ='<option value="">Select Batch</option> <option value="whole-batch">Whole Batch</option>';
      batchNames.forEach((batch) => {
        const option = document.createElement("option");
        option.value = batch;
        option.textContent = batch;
        batchSelect.appendChild(option);
      });
    } 
    catch (error) {
      console.error("Error loading batch options:", error);
    }
  }

  batchSelect.addEventListener("change", async (e) => {
    const selectedBatch = e.target.value;
    if (selectedBatch) {
      const filteredData = await getFilteredDocuments(selectedBatch);
      console.log("Filtered Data:", filteredData);
    }
  });
  await populateBatchOptions();

  function getTraineeDetails(data, id) {
    const createTable = document.getElementById(id);
    createTable.innerHTML = "";
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    const headers = ["SI No.", "Trainee Name", "DU", "Avg. Attendance"];

    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.appendChild(document.createTextNode(headerText));
      headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    data.forEach((item, index) => {
      const row = document.createElement("tr");
      const siNoCell = document.createElement("td");
      siNoCell.appendChild(document.createTextNode(index + 1));
      row.appendChild(siNoCell);

      const traineeCell = document.createElement("td");
      traineeCell.appendChild(document.createTextNode(item.traineeName));
      row.appendChild(traineeCell);

      const duCell = document.createElement("td");
      duCell.appendChild(document.createTextNode(item.du));
      row.appendChild(duCell);

      const attendanceCell = document.createElement("td");
      attendanceCell.appendChild(document.createTextNode(item.avgAttendance));
      row.appendChild(attendanceCell);

      table.appendChild(row);
    });

    return table;
  }

  async function generateChart(data, id) {
    const canvas = document.getElementById(id);
    if (!canvas) {
      console.error(`Canvas with id "${id}" not found`);
      return;
    }

    const ctx = canvas.getContext("2d");
    const chartData = {
      labels: data.map((item) => item.traineeName),
      datasets: [
        {
          label: "Avg. Attendance",
          data: data.map((item) => item.avgAttendance),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };

    new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
  async function generateChartToggle(data, id, chartType = "line") {
    const canvas = document.getElementById(id);
    console.log(`Selected chart type: ${chartType}`); // Log the selected chart type
    if (!canvas) {
        console.error(`Canvas with id "${id}" not found`);
        return;
    }
    console.log('Canvas found:', canvas); // Log the canvas element to ensure it was found

    // Clear existing chart instance if any
    if (canvas.chartInstance) {
        console.log('Destroying existing chart instance');
        canvas.chartInstance.destroy();
    }

    const ctx = canvas.getContext("2d");
    const chartData = {
        labels: data.map((item) => item.traineeName),
        datasets: [
            {
                label: "Avg. Attendance",
                data: data.map((item) => item.avgAttendance),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    // Create new chart instance and store it in the canvas element
    console.log('Creating new chart instance');
    canvas.chartInstance = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}


  async function getAttendanceData(data, id) {
    try {
      generateChart(data, id);
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
  }

  async function getLatestCollection() {
    try {
      const metaDocRef = doc(db, "meta", "collections");
      const metaDocSnapshot = await getDoc(metaDocRef);

      if (metaDocSnapshot.exists()) {
        const metaData = metaDocSnapshot.data();
        const collectionNames = metaData.names;

        if (collectionNames && collectionNames.length > 0) {
          const latestCollectionName =
            collectionNames[collectionNames.length - 1];
          return latestCollectionName;
        } else {
          console.log("No collections found in meta.");
          return null;
        }
      } else {
        console.log("Meta document does not exist.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching the latest collection name:", error);
      return null;
    }
  }

  async function createEvaluationTable(data, id) {
    const tablePosition = document.getElementById(id);
    tablePosition.innerHTML = "";
    const table = document.createElement("table");
    const headerRow = table.insertRow();
    ["Trainee Name", "DU"].forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    const uniqueEvaluations = new Set();
    data.forEach((item) => {
      item.evaluations.forEach((evaluation) => {
        if (evaluation.evaluationName !== "N/A") {
          uniqueEvaluations.add(evaluation.evaluationName);
        }
      });
    });
    const evaluationHeaders = Array.from(uniqueEvaluations);
    evaluationHeaders.forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });
    data.forEach((item) => {
      const row = table.insertRow();
      row.insertCell().textContent = item.traineeName;
      row.insertCell().textContent = item.du;
      const evaluationMap = {};
      item.evaluations.forEach((evaluation) => {
        if (evaluation.evaluationName !== "N/A") {
          evaluationMap[evaluation.evaluationName] = evaluation.evaluationScore;
        }
      });
      evaluationHeaders.forEach((header) => {
        const cell = row.insertCell();
        cell.textContent = evaluationMap[header] || "";
      });
    });

    return table;
  }

  function formatCollectionName(collectionName) {
    const [month, year] = collectionName.split("-"); 
    return month.charAt(0).toUpperCase() + month.slice(1) + " " + year;
  }


  async function getBatchTraineeCounts() {
    try {
      const collectionName = await getLatestCollection(); // Get the latest collection name
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);

      // Create a map to count trainees per batch
      const batchCounts = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const batchName = data.batchName;

        // Check if batchName exists before counting
        if (batchName) {
          batchCounts[batchName] = (batchCounts[batchName] || 0) + 1;
        } else {
          console.warn("Document missing batchName field:", doc.id);
        }
      });

      return batchCounts;
    } 
    catch (error) {
      console.error("Error fetching trainee counts:", error);
      return null;
    }
  }

  async function generateTraineeDoughnutChart(id,chartType = "doughnut",backgroundColor = [], borderColor = [])
    {
    const batchCounts = await getBatchTraineeCounts();
    if (!batchCounts) {
      console.error("No batch data available for the chart.");
      return;
    }

    const batchNames = Object.keys(batchCounts);
    const traineeCounts = Object.values(batchCounts);

    const ctx = document.getElementById(id).getContext("2d");
    new Chart(ctx, {
      type: chartType,
      data: {
        labels: batchNames,
        datasets: [
          {
            label: "Number of Trainees per Batch",
            data: traineeCounts,
            backgroundColor: backgroundColor.length
              ? backgroundColor
              : [
                  "#8061c3",
                  "#c6b5eb",
                  "#6823fc",
                  "#4109b9",
                  "#2d175c",
                  "#7f719e",
                ],
            borderColor: borderColor.length
              ? borderColor
              : [
                  "rgba(128, 97, 195, 1)",
                  "rgba(146, 113, 209, 1)",
                  "rgba(164, 130, 223, 1)",
                  "rgba(182, 146, 237, 1)",
                  "rgba(200, 163, 251, 1)",
                  "rgba(218, 180, 255, 1)",
                ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw;
                return `${label}: ${value} trainees`;
              },
            },
          },
        },
      },
    });
  }

let traineeChartInstance; // Global variable to store the current chart instance

async function generateTraineePieChart(id, chartType = "pie", backgroundColor = [], borderColor = []) {
  const batchCounts = await getBatchTraineeCounts();
  if (!batchCounts) {
    console.error("No batch data available for the chart.");
    return;
  }

  // Get batch names and trainee counts from the data
  const batchNames = Object.keys(batchCounts);
  const traineeCounts = Object.values(batchCounts);

  if (chartType === "bar" || chartType === "line") {
    canvas.style.width = "600px"; // Example width for bar/line charts
    canvas.style.height = "400px"; // Example height for bar/line charts
    canvas.style.margin = "20px";
  } else {
    canvas.style.width = "400px"; // Default width for other charts
    canvas.style.height = "300px"; // Default height for other charts
  }

  // Destroy the existing chart instance if it exists
  if (traineeChartInstance) {
    traineeChartInstance.destroy();
  }

  // Get the context of the canvas element
  const ctx = document.getElementById(id).getContext("2d");
  traineeChartInstance = new Chart(ctx, {
    type: chartType, // Use the chart type passed to the function
    data: {
      labels: batchNames,
      datasets: [
        {
          label: "Number of Trainees per Batch",
          data: traineeCounts,
          backgroundColor: backgroundColor.length
            ? backgroundColor
            : [
                "#8061c3",
                "#c6b5eb",
                "#6823fc",
                "#4109b9",
                "#2d175c",
                "#7f719e",
              ],
          borderColor: borderColor.length
            ? borderColor
            : [
                "rgba(128, 97, 195, 1)",
                "rgba(146, 113, 209, 1)",
                "rgba(164, 130, 223, 1)",
                "rgba(182, 146, 237, 1)",
                "rgba(200, 163, 251, 1)",
                "rgba(218, 180, 255, 1)",
              ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw;
              return `${label}: ${value} trainees`;
            },
          },
        },
      },
    },
  });
}

  async function getBatchDetailsFromLatestCollection() {
    try {
      // Fetch the latest collection name
      const latestCollectionName = await getLatestCollection();
      if (!latestCollectionName) {
        console.error("No latest collection name found.");
        return;
      }

      // Reference the latest collection
      const traineesCollection = collection(db, latestCollectionName);
      const snapshot = await getDocs(traineesCollection);

      // Initialize an object to store batch details
      const batchDetails = {};

      // Process each trainee document
      snapshot.forEach((doc) => {
        const trainee = doc.data();
        const batchName = trainee.batchName;

        // If this batch is not yet in batchDetails, initialize it
        if (!batchDetails[batchName]) {
          batchDetails[batchName] = {
            numberOfTrainees: 0,
            batchDurationTillDate: trainee.batchDurationTillDate || "N/A",
            certificationLevel: trainee.certificationLevel || "N/A",
            numberOfSessionsTillDate: trainee.numberOfSessionsTillDate || "N/A",
            batchDurationMonth: trainee.batchDurationMonth || "N/A",
            numberOfSessionsMonth: trainee.numberOfSessionsMonth || "N/A",
            trainerName: trainee.trainerName || "N/A", // Set trainer name only once
          };
        }

        // Increment the trainee count for the batch
        batchDetails[batchName].numberOfTrainees += 1;
      });

      // Log or return the batch details
      console.log(batchDetails);
      return batchDetails;
    } catch (error) {
      console.error(
        "Error fetching batch details from latest collection:",
        error
      );
      alert("Failed to load batch details from the latest collection.");
    }
  }

  function renderTotalSessionProgressBars(
    batchDetails,
    sessionTillDateId,
    batchDurationId,
    sessionDurationId,
    selectedBatch
  ) {
    const batchSessionContainer = document.getElementById(sessionTillDateId); // Assume there's a container for the progress bars
    const batchDurationContainer = document.getElementById(batchDurationId);
    const sessionDurationContainer = document.getElementById(sessionDurationId);
    // Clear existing content
    batchSessionContainer.innerHTML = "";
    batchDurationContainer.innerHTML = "";
    sessionDurationContainer.innerHTML = "";

    // Create progress bars for each batch

    for (const [batchName, details] of Object.entries(batchDetails)) {
      const {
        numberOfSessionsTillDate,
        batchDurationTillDate,
        numberOfSessionsMonth,
        batchDurationMonth,
      } = details;
      const progressBarHTML = `
            <div class="progress">
                <div class="progress-bar" id="progress-bar-no-of-sessions"><h3 >${batchName} - ${numberOfSessionsTillDate} Sessions</h3></div>
            </div>
    `;
      batchSessionContainer.innerHTML += progressBarHTML;

      const batchDurationTilldateHTML = `
    <div class="progress">
        <div class="progress-bar" id="progress-bar-duration-till"><h3 >${batchName} - ${batchDurationTillDate} </h3></div>
    </div>
`;
      batchDurationContainer.innerHTML += batchDurationTilldateHTML;

      if (batchName === selectedBatch) {
        const sessionDurationHTML = `
        <div class="progress">
            <div class="progress-bar id="progress-bar-duration-month"><h3>Total Duration: ${batchDurationMonth} </h3></div>
        </div>
        <div class="progress">
        <div class="progress-bar" id="progress-bar-session-month"><h3 >Total Sessions: ${numberOfSessionsMonth} </h3></div>
        </div>
        `;
        sessionDurationContainer.innerHTML += sessionDurationHTML;
      }
    }
  }

  function renderTotalSessionsAndDuration(
    batchDetails,
    sessionTillDateId,
    batchDurationId
  ) {
    const batchSessionContainer = document.getElementById(sessionTillDateId); // Assume there's a container for the progress bars
    const batchDurationContainer = document.getElementById(batchDurationId);
    // Clear existing content
    batchSessionContainer.innerHTML = "";
    batchDurationContainer.innerHTML = "";

    // Create progress bars for each batch

    for (const [batchName, details] of Object.entries(batchDetails)) {
      const { numberOfSessionsTillDate, batchDurationTillDate } = details;
      const progressBarHTML = `
            <div class="progress">
                <div class="progress-bar" id="progress-bar-no-of-sessions"><h3 >${batchName} - ${numberOfSessionsTillDate} Sessions</h3></div>
            </div>
    `;
      batchSessionContainer.innerHTML += progressBarHTML;

      const batchDurationTilldateHTML = `
    <div class="progress">
        <div class="progress-bar" id="progress-bar-duration-till"><h3 >${batchName} - ${batchDurationTillDate} </h3></div>
    </div>
`;
      batchDurationContainer.innerHTML += batchDurationTilldateHTML;
    }
  }

  async function loadAndDisplayBatchDetails(
    sessionTillDateId,
    batchDurationId,
    sessionDurationId,
    selectedBatch
  ) {
    const batchDetails = await getBatchDetailsFromLatestCollection();
    if (batchDetails) {
      renderTotalSessionProgressBars(
        batchDetails,
        sessionTillDateId,
        batchDurationId,
        sessionDurationId,
        selectedBatch
      );
    }
  }

  async function loadSessionsAndDurationWholeBatch(
    sessionTillDateId,
    batchDurationId
  ) {
    const batchDetails = await getBatchDetailsFromLatestCollection();
    if (batchDetails) {
      renderTotalSessionsAndDuration(
        batchDetails,
        sessionTillDateId,
        batchDurationId
      );
    }
  }

  function renderCertificationLevelChart(
    batchData,
    chartElementId,
    backgroundColor,
    borderColor
  ) {
    if (!Array.isArray(batchData) || batchData.length === 0) {
      console.error(
        "Invalid or empty batch data provided to renderCertificationLevelChart."
      );
      return;
    }

    // Mapping certification levels to numerical values
    const certificationLevelsMap = {
      N1: 5,
      N2: 4,
      N3: 3,
      N4: 2,
      N5: 1,
    };

    const batchNames = batchData.map((batch) => batch.batchName);
    const certificationLevels = batchData.map(
      (batch) => certificationLevelsMap[batch.certificationLevel]
    );

    // Destroy any existing chart instance
    if (window.certificationChart) {
      window.certificationChart.destroy();
    }

    // Get the context of the canvas element
    const ctx = document.getElementById(chartElementId).getContext("2d");
    window.certificationChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: batchNames,
        datasets: [
          {
            label: "Certification Level",
            data: certificationLevels,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "x", // Set to x for horizontal bars
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 5,
            ticks: {
              stepSize: 1,
              callback: function (value) {
                // Map numbers back to certification labels on the y-axis
                const reverseMap = {
                  0: "0",
                  1: "N5",
                  2: "N4",
                  3: "N3",
                  4: "N2",
                  5: "N1",
                };
                return reverseMap[value];
              },
              color: "#333",
            },
            title: {
              display: true,
              text: "Certification Level",
              color: "#333",
              font: { size: 8, weight: "bold" },
            },
          },
          x: {
            title: {
              display: true,
              text: "Batch Name",
              color: "#333",
              font: { size: 8, weight: "bold" },
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#333",
              font: { size: 8, weight: "bold" },
            },
          },
        },
      },
    });
  }

  async function initCertificationChart(
    chartElementId,
    backgroundColor,
    borderColor
  ) {
    // Fetch batch details
    const batchDetails = await getBatchDetailsFromLatestCollection();
    if (!batchDetails) {
      console.error("No batch details found.");
      return;
    }

    // Log the batch details to inspect the structure
    console.log("Batch Details:", batchDetails);

    // Convert batchDetails object to array format expected by renderCertificationLevelChart
    const batchDataArray = Object.entries(batchDetails).map(
      ([batchName, details]) => ({
        batchName,
        certificationLevel: details.certificationLevel, // Ensure you have this field
      })
    );

    // Check if the batch data array is empty
    if (batchDataArray.length === 0) {
      console.error("No batch data available to render chart.");
      return;
    }

    // Render the chart
    renderCertificationLevelChart(
      batchDataArray,
      chartElementId,
      backgroundColor,
      borderColor
    );
  }

  async function initTrainerDetails(chartElementId) {
    // Fetch batch details
    const batchDetails = await getBatchDetailsFromLatestCollection();
    if (!batchDetails) {
      console.error("No batch details found.");
      return;
    }

    // Log the batch details to inspect the structure
    console.log("Batch Details:", batchDetails);

    // Convert batchDetails object to array format expected by renderCertificationLevelChart
    const batchDataArray = Object.entries(batchDetails).map(
      ([batchName, details]) => ({
        batchName,
        trainerName: details.trainerName, // Ensure you have this field
      })
    );

    // Check if the batch data array is empty
    if (batchDataArray.length === 0) {
      console.error("No batch data available to render chart.");
      return;
    }

    // Render the chart
    displayTrainers(batchDataArray, chartElementId);
  }

  function displayTrainers(batchDetails, id) {
    const trainerContainer = document.getElementById(id); // Assume you have a container in your HTML

    // Clear the container first
    trainerContainer.innerHTML = "";

    const trainerNames = batchDetails[0].trainerName;

    if (Array.isArray(trainerNames)) {
      trainerNames.forEach((trainer) => {
        const trainerLine = document.createElement("h3");
        trainerLine.textContent = `${trainer}`;
        trainerContainer.appendChild(trainerLine);
      });
    } else {
      // In case trainerName is not an array, handle accordingly
      const trainerLine = document.createElement("h3");
      trainerLine.textContent = `Trainer for ${batch}: ${trainerNames}`;
      trainerContainer.appendChild(trainerLine);
    }
  }
  async function getNofBatches() {
    const batchDetails = await getBatchDetailsFromLatestCollection();
    if (!batchDetails) {
      console.error("No batch details found.");
      return;
    }
    const numberOfBatches = Object.keys(batchDetails).length;
    return numberOfBatches;
  }
  async function populateBatchDataTemplate2() {
    const batchDetails = await getBatchDetailsFromLatestCollection();
    if (!batchDetails) {
      console.error("No batch details found.");
      return;
    }

    const mainContainer = document.getElementById("batchwise-data-template2");
    mainContainer.innerHTML = ""; // Clear any previous content

    const numberOfBatches = Object.keys(batchDetails).length;
    const batchCountDisplay = document.getElementById("number");
    batchCountDisplay.textContent = numberOfBatches;

    for (const [batchName, details] of Object.entries(batchDetails)) {
      const filteredData = await getFilteredDocuments(batchName);

      const batchContainer = document.createElement("div");
      batchContainer.classList.add("batchwise-data-template2");

      const batchDurationMonth = details.batchDurationMonth;
      const numberOfSessionsMonth = details.numberOfSessionsMonth;

      if (
        batchDurationMonth === undefined ||
        numberOfSessionsMonth === undefined
      ) {
        console.error(`No batch data available for ${batchName}.`);
        continue; // Skip this iteration
      }

      batchContainer.innerHTML = `
            <div class="batch-info">
                <h2>${batchName}</h2>
            </div>
            <div class="details-template2">
                <div class="trainee-list-template2">
                    <h3>Trainee Details</h3>
                    <div id="trainee-details-${batchName}"></div>
                </div>
                <div class="details-right-template2">
                    <div class="batch-duration-template2">
                        
                        <div id="durationChart-${batchName}">
                            <h1>Total Sessions: ${numberOfSessionsMonth} </h1>
                            <h1>Total Duration: ${batchDurationMonth} </h1>
                            
                            
                        </div>
                    </div>
                    <div class="attendance-template2">
                        <h3>Attendance</h3>
                        <canvas id="attendanceChart-${batchName}" ></canvas>
                    </div>
                </div>
            </div>
            <div class="trainee-evaluation-template2">
            <h3>Evaluation Details</h3>
                <div id="evaluation-table-${batchName}"></div>
            </div>
        `;

      mainContainer.appendChild(batchContainer);

      const evaluationTable1 = document.getElementById(
        `evaluation-table-${batchName}`
      );
      const table1 = await createEvaluationTable(
        filteredData,
        `evaluation-table-${batchName}`
      );
      evaluationTable1.appendChild(table1);

      await getAttendanceData(filteredData, `attendanceChart-${batchName}`);

      const traineeDetailsTemplate2 = document.getElementById(
        `trainee-details-${batchName}`
      );
      const traineeTable2 = await getTraineeDetails(
        filteredData,
        `trainee-details-${batchName}`
      ); // Call your attendance data function
      traineeDetailsTemplate2.appendChild(traineeTable2);
    }
  }
  async function populateBatchDataTemplate1() {
    const batchDetails = await getBatchDetailsFromLatestCollection();
    if (!batchDetails) {
      console.error("No batch details found.");
      return;
    }
  }

  async function populateBatchDataTemplate3() {
    const batchDetails = await getBatchDetailsFromLatestCollection();
    if (!batchDetails) {
      console.error("No batch details found.");
      return;
    }

    const mainContainer = document.getElementById("batchwise-data-template3");
    mainContainer.innerHTML = ""; // Clear any previous content

    const numberOfBatches = Object.keys(batchDetails).length;
    const batchCountDisplay = document.getElementById(
      "number-of-Batch-tmeplate3"
    );
    batchCountDisplay.textContent = numberOfBatches;

    for (const [batchName, details] of Object.entries(batchDetails)) {
      const filteredData = await getFilteredDocuments(batchName);

      const batchContainer = document.createElement("div");
      batchContainer.classList.add("batchwise-data-template3");

      const batchDurationMonth = details.batchDurationMonth;
      const numberOfSessionsMonth = details.numberOfSessionsMonth;

      if (
        batchDurationMonth === undefined ||
        numberOfSessionsMonth === undefined
      ) {
        console.error(`No batch data available for ${batchName}.`);
        continue; // Skip this iteration
      }

      batchContainer.innerHTML = `
            <div class="t3batchname">
            <h3 class="batch-title">${batchName}</h3>
            <div class="t3sessions">
                <h2 class="t3sessions-firsth">Total Sessions: ${numberOfSessionsMonth}</h2>
                <h2 class="t3sessions-secondh">Total Duration: ${batchDurationMonth}</h2>
            </div>
        </div>
        <div class="traneediv">
            <div class="democheck">
            <div class="t3graphtraine">
                <div class="graph-title-trainee">Trainee Details</div>
                <div class="t3graph-trainee">
                    <div id="t3graph-trainee-${batchName}">
                
                </div>
                </div>
            </div>
            <div class="t3traineeatt">
                <div class="graph-title-attendance">Trainee Attendance</div>
                <div class="t3graph-attendance">
                <canvas id="t3graph-attendance-${batchName}" ></canvas>

                </div
            </div>
            </div>
        </div>
        <div class="eval-table">
            <div class="table-title">Trainee Evaluation</div>
            <div class="table-section">
                <div id="evaluation-table-${batchName}" style="width:100%;"></div>
            </div>
        </div>
        `;

      mainContainer.appendChild(batchContainer);

      const evaluationTable = document.getElementById(
        `evaluation-table-${batchName}`
      );
      const table1 = await createEvaluationTable(
        filteredData,
        `evaluation-table-${batchName}`
      );
      evaluationTable.appendChild(table1);

      await getAttendanceData(filteredData, `t3graph-attendance-${batchName}`);
      console.log(filteredData);

      const traineeDetailsTemplate2 = document.getElementById(
        `t3graph-trainee-${batchName}`
      );
      const traineeTable2 = await getTraineeDetails(
        filteredData,
        `t3graph-trainee-${batchName}`
      );
      traineeDetailsTemplate2.appendChild(traineeTable2);
    }
  }

  async function batchwiseDataTemplate3(selectedBatch) {

    const batchDetails = await getBatchDetailsFromLatestCollection();
    if (!batchDetails) {
      console.error("No batch details found.");
      return;
    }

    const sessionsPerBatch = batchDetails[selectedBatch].numberOfSessionsMonth;
    const sessionsTemplate3 = document.getElementById("t3sessions-firsth");
    sessionsTemplate3.textContent = `Total Sessions: ${sessionsPerBatch}`;

    const durationPerBatch = batchDetails[selectedBatch].batchDurationMonth;
    const durationTemplae3 = document.getElementById("t3sessions-secondh");
    durationTemplae3.textContent = `Total duration: ${durationPerBatch}`;

    const currentDate = await getLatestCollection();
    const filteredData = await getFilteredDocuments(selectedBatch);

    const template1Header = document.getElementById("subtitle");
    template1Header.textContent = formatCollectionName(currentDate);

    // await getAttendanceData(filteredData, "t3graph-attendance");

    const traineeDetailsTemplate1 = document.getElementById("t3graph-trainee");
    const traineeTable1 = await getTraineeDetails(
      filteredData,
      "t3graph-trainee"
    ); 
    traineeDetailsTemplate1.appendChild(traineeTable1);

    const evaluationTable1 = document.getElementById("table-section");
    const table1 = await createEvaluationTable(filteredData, "table-section");
    evaluationTable1.appendChild(table1);

    const batchCountDisplay = document.getElementById(
      "number-of-Batch-tmeplate3"
    );
    batchCountDisplay.textContent = await getNofBatches();

    initTrainerDetails("trainers-template3");

    const backgroundColor2 = 'rgba(153, 102, 255, 0.2)';
    const borderColor2 = 'rgba(255, 159, 64, 0.2)';
    initCertificationChart(
      "current-level-template3",
      backgroundColor2,
      borderColor2
    );

    const numberOfTrainees = document.getElementById("card-content");

    const backgroundColor = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ];
    const borderColor = [
      'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];
    numberOfTrainees.textContent = generateTraineePieChart(
      "card-content",
      "pie",
      backgroundColor,
      borderColor
    );
    loadSessionsAndDurationWholeBatch(
      "card-content-sessions",
      "card-content-duration"
    );

    const template3Header = document.getElementById("batch-title");
    template3Header.textContent = selectedBatch;
    console.log(selectedBatch);

    document.getElementById('chartTypeDropdown').addEventListener('change', (event) => {
        const selectedChartType = event.target.value;
        generateTraineePieChart("card-content",selectedChartType,backgroundColor,borderColor);  
        
      });

      generateChartToggle(filteredData, 't3graph-attendance', 'bar');
      document.getElementById('chartTypeDropdownAttendance').addEventListener('change', (event) => {
          const selectedChartType = event.target.value;
          generateChartToggle(filteredData, 't3graph-attendance', selectedChartType);
          
      });  

  }

  images.forEach((image) => {
    image.addEventListener("click", async function () {
      hideAllTemplates();
      const templateKey = this.getAttribute("data-template");
      selectTemplate = templateKey;

      selectedTemplate = document.getElementById(templateKey);
      if (selectedTemplate) {
        const selectedBatch = batchSelect.value;
        if (selectedBatch) {
          const currentDate = await getLatestCollection();
          const filteredData = await getFilteredDocuments(selectedBatch);
          switch (templateKey) {
            case "template1":
              if (selectedBatch === "whole-batch") {
                const populatedDataTemplate2 = document.getElementById(
                  "batchwise-data-template2"
                );
                populatedDataTemplate2.innerHTML = "";
                populateBatchDataTemplate1();
              } else {
                const template1Header = document.getElementById(
                  "header-template1-h3"
                );
                template1Header.textContent = formatCollectionName(currentDate); 
                // await getAttendanceData(filteredData,"attendance-body-template1");
                generateChartToggle(filteredData, 'attendance-body-template1', 'bar');
                document.getElementById('chartTypeDropdownAttendance').addEventListener('change', (event) => {
                    const selectedChartType = event.target.value;
                    generateChartToggle(filteredData, 'attendance-body-template1', selectedChartType);
                    
                });
                // generateChartToggle(filteredData, 'attendance-body-template1', 'bar');

                const traineeDetailsTemplate1 = document.getElementById("trainee-details-template1");

                const traineeTable1 = await getTraineeDetails(filteredData,"trainee-details-template1");
                traineeDetailsTemplate1.appendChild(traineeTable1);

                const evaluationTable1 = document.getElementById(
                  "evaluation-table-template1"
                );
                const table1 = await createEvaluationTable(
                  filteredData,
                  "evaluation-table-template1"
                );
                evaluationTable1.appendChild(table1);

                const numberOfTrainees = document.getElementById(
                  "trainee-piechart-template1"
                );

                const backgroundColor = [
                 'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
                ];
                const borderColor = [
                  "rgba(128, 97, 195, 1)",
                  "rgba(146, 113, 209, 1)",
                  "rgba(164, 130, 223, 1)",
                  "rgba(182, 146, 237, 1)",
                  "rgba(200, 163, 251, 1)",
                  "rgba(218, 180, 255, 1)",
                ];
                numberOfTrainees.textContent = generateTraineePieChart(
                  "trainee-piechart-template1",
                  "pie",
                  backgroundColor,
                  borderColor
                );

                const backgroundColor2 = 'rgba(153, 102, 255, 0.2)';
                const borderColor2 = 'rgba(153, 102, 255, 1)';
                initCertificationChart(
                  "certificationBarChart",
                  backgroundColor2,
                  borderColor2
                );

                initTrainerDetails("trainer-name-template1");

                loadAndDisplayBatchDetails(
                  "progressBarsContainer-templae1",
                  "whole-duration-data-templae1",
                  "duration-sessions-data-template1",
                  selectedBatch
                );
                
                document.getElementById('chartTypeDropdown').addEventListener('change', (event) => {
                    const selectedChartType = event.target.value;
                    generateTraineePieChart("trainee-piechart-template1",selectedChartType,backgroundColor,borderColor);
                    
                  });
              }
              break;
            case "template2":
              if (selectedBatch === "whole-batch") {
                const populatedDataTemplate2 = document.getElementById(
                  "batchwise-data-template2"
                );
                populatedDataTemplate2.innerHTML = "";
                populateBatchDataTemplate2();
              } else {
                const template1Header =
                  document.getElementById("template2-month");
                template1Header.textContent = formatCollectionName(currentDate);

                const evaluationTable1 = document.getElementById(
                  "evaluation-table-template2"
                );
                const table1 = await createEvaluationTable(
                  filteredData,
                  "evaluation-table-template2"
                );
                evaluationTable1.appendChild(table1);

                const template2Header = document.getElementById(
                  "batch-name-template2"
                );
                template2Header.textContent = selectedBatch; // Display selected batch instead

                // await getAttendanceData(filteredData, "attendanceChart");

                generateChartToggle(filteredData, 'attendanceChart', 'bar');
                document.getElementById('chartTypeDropdownAttendance').addEventListener('change', (event) => {
                    const selectedChartType = event.target.value;
                    generateChartToggle(filteredData, 'attendanceChart', selectedChartType);
                    
                });

                const traineeDetailsTemplate2 = document.getElementById(
                  "trainee-details-template2"
                );
                const traineeTable2 = await getTraineeDetails(
                  filteredData,
                  "trainee-details-template2"
                ); // Call your attendance data function
                traineeDetailsTemplate2.appendChild(traineeTable2);
                const numberOfTrainees =
                  document.getElementById("learnersChart");
                const backgroundColor = [
                 'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
                ];
                const borderColor = [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
                ];
                numberOfTrainees.textContent = generateTraineePieChart(
                  "learnersChart",
                  "pie",
                  backgroundColor,
                  borderColor
                );

                const batchCountDisplay = document.getElementById("number");
                batchCountDisplay.textContent = await getNofBatches();
                const diaplayBatch = document.getElementById("batch-number");
                diaplayBatch.textContent = generateTraineeDoughnutChart(
                  "batch-number",
                  "doughnut",
                  backgroundColor,
                  borderColor
                );
                const backgroundColor2 = 'rgba(153, 102, 255, 0.2)';
                const borderColor2 = 'rgba(153, 102, 255, 1)';
                initCertificationChart(
                  "levelChart",
                  backgroundColor2,
                  borderColor2
                );
                loadAndDisplayBatchDetails(
                  "sessionsChart",
                  "batchDurationChart",
                  "durationChart",
                  selectedBatch
                );
                initTrainerDetails("trainer-name-template2");
                
                document.getElementById('chartTypeDropdown').addEventListener('change', (event) => {
                    const selectedChartType = event.target.value;
                    generateTraineePieChart("learnersChart",selectedChartType,backgroundColor,borderColor);
                    
                  });
              }
              break;
            case "template3":
              if (selectedBatch === "whole-batch") {
                const populatedDataTemplate3 = document.getElementById(
                  "batchwise-data-template2"
                );
                populatedDataTemplate3.innerHTML = "";
                populateBatchDataTemplate3();
              } else {
                batchwiseDataTemplate3(selectedBatch);
              }

              // traineeTable = await getTraineeDetails(filteredData,"trainee-details-template3") // Call your attendance data function
              // traineeDetailsTemplate1.appendChild(traineeTable);
              break;
            case "template4":
              // const template4Header = document.getElementById("t4date");
              // template4Header.textContent = selectedBatch; // Display selected batch instead
              // await getAttendanceData(filteredData,"attendanceChart");

              // traineeTable = await getTraineeDetails(filteredData,"trainee-details-template2") // Call your attendance data function
              // traineeDetailsTemplate1.appendChild(traineeTable);
              break;
          }
        }

        selectedTemplate.style.display = "block"; // Show the selected template
      }
    });
  });
});



//-------------------- Toggle Charts---------------------------//


///-Change color//

const selectColor = document.getElementById("selectcolor");
selectColor.addEventListener("change", changecolor);

function changecolor(event) {
  let value = event.target.value;

  console.log(value);

  let firstColorDiv = selectedTemplate;
  console.log(firstColorDiv.classList[0]);

  if (firstColorDiv.classList[0] == "template-one") {
    const colors = {
      1: {
        bg: "#DC143C",
        accent: "#e66a83",
      },
      2: {
        bg: "#64a2f5",
        accent: "#93bdf5",
      },
      3: {
        bg: "#43bf73",
        accent: "#75c794",
      },
      4: {
        bg: "#8061c3",
        accent: "#bda7ec",
      },
    };

    const commonElements = [
      "learners-template1",
      "trainer-template1",
      "session-template1",
      "level-heading",
      "duration-heading-template1",
      "duration-sessions-heading-template1",
      "attendance-heading-template1",
      "evaluation-heading-template1",
      "batch-evaluation-heading-template1",
    ];

    function applyColors(value) {
      const color = colors[value] || { bg: "#C3FFC0", accent: "green" };

      // Set background color for the firstColorDiv children
      firstColorDiv.children[0].children[0].style.backgroundColor = color.bg;
      if (color.accent) {
        firstColorDiv.children[0].children[1].children[0].style.backgroundColor =
          color.accent;
      }

      // Apply common background color to other elements
      commonElements.forEach((id) => {
        document.getElementById(id).style.backgroundColor = color.bg;
      });
      var th = document.querySelectorAll("#trainee-details-template1 th");
      th.forEach((e) => {
        e.style.backgroundColor = color.bg;
      });
      var td = document.querySelectorAll("#trainee-details-template1 td");
      td.forEach((e) => {
        e.style.backgroundColor = color.accent;
      });
      var td = document.querySelectorAll("#evaluation-table-template1 th");
      td.forEach((e) => {
        e.style.backgroundColor = color.bg;
      });
      var th = document.querySelectorAll("#evaluation-table-template1 td");
      th.forEach((e) => {
        e.style.backgroundColor = color.accent;
      });

      var th1 = document.querySelectorAll(
        "#progressBarsContainer-templae1 .progress-bar"
      );
      th1.forEach((e) => {
        e.style.backgroundColor = color.bg;
      });

      var th2 = document.querySelectorAll(
        "#duration-sessions-data-template1 .progress-bar"
      );
      th2.forEach((e) => {
        e.style.backgroundColor = color.bg;
      });
      var th4 = document.querySelectorAll(
        "#whole-duration-data-templae1 .progress-bar"
      );
      th4.forEach((e) => {
        e.style.backgroundColor = color.bg;
      });
      var th4 = document.querySelectorAll("#trainer-name-template1 h3");
      th4.forEach((e) => {
        e.style.color = color.bg;
      });
    }

    // Example of calling the function
    applyColors(value);
  } else if (firstColorDiv.classList[0] == "template-two") {
    switch (value) {
      case "1":
        firstColorDiv.children[0].style.backgroundColor = "#DC143C";

        break;
      case "2":
        firstColorDiv.children[0].style.backgroundColor = "#64a2f5";
        break;
      case "3":
        firstColorDiv.children[0].style.backgroundColor = "#43bf73";
        break;
      case "4":
        firstColorDiv.children[0].style.backgroundColor = "#8061c3";
        break;
      default:
        firstColorDiv.children[0].style.backgroundColor = "#C3FFC0";
    }
  } else if (firstColorDiv.classList[0] == "template-three") {
    switch (value) {
      case "1":
        firstColorDiv.children[0].style.backgroundColor = "#DC143C";
        document.getElementById("t3graph").style.backgroundColor = "#e66a83";
        document.getElementById("table-section").style.backgroundColor =
          "#e66a83";
        document.getElementById("t3batchname").style.color = "white";

        break;
      case "2":
        firstColorDiv.children[0].style.backgroundColor = "#64a2f5";
        document.getElementById("t3graph").style.backgroundColor = "#5d94de";
        document.getElementById("table-section").style.backgroundColor =
          "#5d94de";
        document.getElementById("t3batchname").style.color = "#5d94de";
        break;
      case "3":
        firstColorDiv.children[0].style.backgroundColor = "green";
        break;
      case "4":
        firstColorDiv.children[0].style.backgroundColor = "violet";
        break;
      default:
        firstColorDiv.children[0].style.backgroundColor = "#C3FFC0";
    }
  } else if (firstColorDiv.classList[0] == "template-four") {
    switch (value) {
      case "1":
        firstColorDiv.children[0].style.backgroundColor = "red";
        break;
      case "2":
        firstColorDiv.children[0].style.backgroundColor = "blue";
        break;
      case "3":
        firstColorDiv.children[0].style.backgroundColor = "green";
        break;
      case "4":
        firstColorDiv.children[0].style.backgroundColor = "violet";
        break;
      default:
        firstColorDiv.children[0].style.backgroundColor = "#C3FFC0";
    }
  }
}
