document.addEventListener('DOMContentLoaded', () => {
    // Get all keys from localStorage to identify the correct month-year data
    const allKeys = Object.keys(localStorage);

    // Assuming there is only one relevant month-year key in localStorage
    const monthYearKey = allKeys.find(key => /^[a-zA-Z]+-\d{4}$/.test(key));  

    console.log("Using Collection Key:", monthYearKey);  // Verify correct key selection

    if (!monthYearKey) {
        alert("No valid data found in localStorage!");
        return;
    }

    const trainees = JSON.parse(localStorage.getItem(monthYearKey)) || [];
    console.log("Loaded Trainees Data:", trainees);  // Debugging: Verify if data exists

    const dataTable = document.getElementById('dataTable').querySelector('tbody');

    if (trainees.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7">No data available</td>`;
        dataTable.appendChild(row);
        return;
    }

    // Render rows for each trainee
    trainees.forEach(trainee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${trainee.traineeName}</td>
            <td>${trainee.batchName}</td>
            <td>${trainee.certificationLevel}</td>
            <td>${trainee.month}</td>
            <td>${trainee.du}</td>
            <td>${trainee.avgAttendance}</td>
            <td>
                <ul>
                    ${trainee.evaluations
                        .filter(e => e.evaluationName && e.evaluationName.toUpperCase() !== 'N/A')
                        .map(e => `
                            <li>
                                ${e.evaluationNo}: ${e.evaluationDate}, ${e.evaluationName}, ${e.evaluationScore}
                            </li>`).join('')}
                </ul>
            </td>
        `;
        dataTable.appendChild(row);
    });
});
