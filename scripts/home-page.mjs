import { checkAuth, logout } from "./auth.js";
import { db } from "./firebaseConfig.mjs";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Check authentication status
checkAuth();

// Attach logout function to the logout button
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#logout").addEventListener("click", logout);
});

async function fetchLatestCollection() {
  const metaDocRef = doc(db, "meta", "collections");
  const metaDocSnapshot = await getDoc(metaDocRef);

  if (metaDocSnapshot.exists()) {
    const metaData = metaDocSnapshot.data();
    const collectionNames = metaData.names;

    if (collectionNames && collectionNames.length > 0) {
      // Get the last added collection name
      const latestCollectionName = collectionNames[collectionNames.length - 1];
      // console.log("Latest collection name:", latestCollectionName);
      return latestCollectionName;
    } else {
      // console.log("No collections found in meta.");
      return null;
    }
  } else {
    // console.log("Meta document does not exist.");
    return null;
  }
}

async function renderDashboard() {
  const latestCollectionName = await fetchLatestCollection();

  if (!latestCollectionName) {
    console.error("No collection found.");
    return;
  }

  const collectionRef = collection(db, latestCollectionName);
  const snapshot = await getDocs(collectionRef);

  const trainerName = new Set();
  const batchData = {};
  let totalTrainees = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();

    // Add unique trainer names from the TrainerName array
    if (Array.isArray(data.trainerName)) {
      data.trainerName.forEach((trainer) => {
        trainerName.add(trainer);
        // console.log("Adding trainer:", trainer);
      });
    } else {
      // console.warn("trainerName is not an array:", data.trainerName);
    }

    if (!batchData[data.batchName]) {
      batchData[data.batchName] = {
        trainees: [],
        sessionsTillDate: data.numberOfSessionsTillDate,
        durationTillDate: data.batchDurationTillDate,
        durationMonth: data.batchDurationMonth,
        totalAttendance: 0,
        certificationLevel: data.certificationLevel,
      };
    }
    batchData[data.batchName].trainees.push({
      name: data.traineeName,
      du: data.du,
      certificationLevel: data.certificationLevel,
      avgAttendance: data.avgAttendance,
    });
    batchData[data.batchName].totalAttendance += data.avgAttendance;
    totalTrainees++;
  });

  displayTrainerName([...trainerName]);
  renderBatchAttendanceChart(batchData);
  displayBatchCount(Object.keys(batchData).length);
  displayTraineeCount(totalTrainees);

  // Start the synchronized carousel for batches
  startBatchCarousel(batchData);
}

function displayBatchCount(numBatches) {
  document.getElementById("activeBatches").textContent = numBatches;
}

function displayTraineeCount(numTrainees) {
  document.getElementById("numTrainees").textContent = numTrainees;
}

function displayTrainerName(trainerName) {
  const trainerBox = document.getElementById("trainerNames");
  trainerBox.innerHTML = trainerName.join("<br>");
}

// Display batch data across all carousels simultaneously
function displayBatchData(batchName, details) {
  // Update Sessions carousel
  const sessionsCarousel = document.getElementById("totalSessions");
  sessionsCarousel.innerHTML = `<h2>${batchName}</h2><h1>${details.sessionsTillDate}</h1>`;

  // Update Duration carousel
  const durationCarousel = document.getElementById("totalDuration");
  durationCarousel.innerHTML = `<h2>${batchName}</h2><h1>${details.durationTillDate}</h1>`;

  // Update Certification carousel
  const certificationCarousel = document.getElementById("certificationLevel");
  certificationCarousel.innerHTML = `<h2>${batchName}</h2><h1>${details.certificationLevel}</h1>`;
}

// Start the batch carousel to rotate through batches simultaneously
function startBatchCarousel(batchData) {
  const batchNames = Object.keys(batchData);
  let currentBatchIndex = 0;

  setInterval(() => {
    const batchName = batchNames[currentBatchIndex];
    const details = batchData[batchName];
    displayBatchData(batchName, details);

    // Move to the next batch
    currentBatchIndex = (currentBatchIndex + 1) % batchNames.length;
  }, 3000);
}

// Render batch attendance chart for all batches
function renderBatchAttendanceChart(batchData) {
  const batchNames = Object.keys(batchData);
  const avgAttendances = batchNames.map((batchName) => {
    const details = batchData[batchName];
    return details.totalAttendance / details.trainees.length;
  });

  const ctx = document
    .getElementById("attendanceChart")
    .getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: batchNames,
      datasets: [
        {
          label: "Average Attendance by Batch (%)",
          data: avgAttendances,
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100 },
      },
    },
  });
}

document.addEventListener("DOMContentLoaded", renderDashboard);
