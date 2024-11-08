//upload-data stuff. pls ignore.
// Validate the uploaded data against the specified rules
function validateData(data) {
    const expectedHeaders = [
        'Trainer Name', 'Batch Name', 'Number of Sessions Till Date', 'Number of Sessions (Month)',
        'Batch Duration Till Date', 'Batch Duration (Month)', 'Certification Level', 'Month',
        'Trainee Name', 'DU', 'Avg Attendance Percentage', 'Evaluation'
    ];

    // Check headers
    const headers = Object.keys(data[0]);
    for (const header of expectedHeaders) {
        if (!headers.includes(header)) {
            return { isValid: false, errorMessage: `Missing header: ${header}` };
        }
    }

    // Check if all "Month" values are the same
    const monthColumnValues = data.map(row => row['Month']).filter(Boolean); // Filter out any empty values
    const uniqueMonths = [...new Set(monthColumnValues)];

    if (uniqueMonths.length !== 1) {
        return { isValid: false, errorMessage: "All rows under the 'Month' column must have the same value." };
    }


    // Validation rules
    for (let row of data) {

        // Validate 'Trainee Name'
        // if ( !/^[A-Za-z\s.]+$/.test(row['Trainee Name'])) {
        // if (!row['Trainee Name'] || !/^[A-Za-z\s]+$/.test(row['Trainee Name'])) {

            // return { isValid: false, errorMessage: `Invalid or empty 'Trainee Name': '${row['Trainee Name']}'. It must contain only alphabets.` };
        // }

        // If 'Trainee Name' is valid, check that other related fields are not empty
        const relatedFields = [
            'Trainer Name', 'Batch Name', 'Number of Sessions Till Date', 'Number of Sessions (Month)',
            'Batch Duration Till Date', 'Batch Duration (Month)', 'Certification Level', 'Month',
            'DU', 'Avg Attendance Percentage'
        ];
        
        for (const field of relatedFields) {
            if (!row[field]) {
                return { isValid: false, errorMessage: `The field '${field}' cannot be empty for 'Trainee Name' '${row['Trainee Name']}'.` };
            }
        }

        if (row['Batch Name'] && !/^Batch \d+$/.test(row['Batch Name'])) {
            return { isValid: false, errorMessage: `Invalid Batch Name format for '${row['Batch Name']}'. Expected format: 'Batch [num]'` };
        }

        if (row['Certification Level'] && !/^(N[1-5])$/.test(row['Certification Level'])) {
            return { isValid: false, errorMessage: `Invalid Certification Level: '${row['Certification Level']}'. Expected values: N1, N2, N3, N4, N5` };
        }

        if (row['Month'] && !['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].includes(row['Month'])) {
            return { isValid: false, errorMessage: `Invalid Month: '${row['Month']}'. Expected a month name.` };
        }

        if (row['DU'] && !/^DU \d+$/.test(row['DU'])) {
            return { isValid: false, errorMessage: `Invalid DU format: '${row['DU']}'. Expected format: 'DU [num]' where num is from 1 to 6` };
        }

        if (row['Avg Attendance Percentage'] && (row['Avg Attendance Percentage'] < 1 || row['Avg Attendance Percentage'] > 100)) {
            return { isValid: false, errorMessage: `Avg Attendance Percentage must be between 1 and 100.` };
        }

        const { evalNumbers, evalDates, evalNames } = locateEvaluationRows(data);

        // Ensure evalNumbers, evalDates, evalNames are arrays
        // evalNumbers = Array.isArray(evalNumbers) ? evalNumbers : Object.values(evalNumbers || {});
        // evalDates = Array.isArray(evalDates) ? evalDates : Object.values(evalDates || {});
        // evalNames = Array.isArray(evalNames) ? evalNames : Object.values(evalNames || {});
        // const evaluations = extractEvaluations(row, evalNumbers, evalDates, evalNames)
        // const evaluations = extractEvaluations(row);
        // console.log('---Evaluation in validation:', {evaluations});
        // for (let evalEntry of evaluations) {
        //     if (evalEntry.evaluationNo && !/^E\d+$/.test(evalEntry.evaluationNo)) {
        //         return { isValid: false, errorMessage: `Invalid Evaluation No: '${evalEntry.evaluationNo}'. Expected format: 'E[num]'` };
        //     }
        //     if (evalEntry.evaluationDate && !isValidDate(evalEntry.evaluationDate, row['Month'])) {
        //         return { isValid: false, errorMessage: `Invalid Date: '${evalEntry.evaluationDate}'. Expected format: 'DD/MM/YYYY' matching the month '${row['Month']}'` };
        //     }
        //     if (evalEntry.evaluationName && !evalEntry.evaluationDate) {
        //         return { isValid: false, errorMessage: "Both Evaluation Name and Date must be provided." };
        //     }
        //     if (evalEntry.score && !['A', 'B', 'C', 'D', 'F', 'Absent'].includes(evalEntry.score)) {
        //         return { isValid: false, errorMessage: `Invalid Score: '${evalEntry.score}'. Expected one of: A, B, C, D, F, Absent` };
        //     }
        // }



        // for(let i = 0; i < evalNumbers; i++){
        //     if(evaluations) {
        //         let eno = evaluations[i].evaluationNo;
        //         let ename = evaluations[i].evaluationName;
        //         let edate = evaluations[i].evaluationDate;
        //         let escore = evaluations[i].evaluationNo;
        //         console.log('---validation eno:', {eno});
        //         console.log('---validation ename:', {ename});
        //         console.log('---validation edate:', {edate});
        //         console.log('---validation escore:', {escore});
        //         if (evaluations[i].evaluationNo && !/^E\d+$/.test(evaluations[i].evaluationNo)) {
        //                 return { isValid: false, errorMessage: `Invalid Evaluation No: '${evaluations.evaluationNo}'. Expected format: 'E[num]'` };
        //             }

        //         if (evaluations.evaluationDate && !isValidDate(evaluations.evaluationDate, row['Month'])) {
        //                 return { isValid: false, errorMessage: `Invalid Date: '${evaluations.evaluationDate}'. Expected format: 'DD/MM/YYYY' with the month matching '${row['Month']}'` };
        //             }

        //                 // Check for required values in the evaluation columns
        //         if ((evaluations.evaluationName && !evaluations.evaluationDate) || (evaluations.evaluationDate && !evaluations.evaluationName)) {
        //                 return { isValid: false, errorMessage: `If Evaluation Name is provided, Date must also be provided and vice versa.` };
        //             }
        //         if (evaluations.score && !['A', 'B', 'C', 'D', 'F', 'Absent'].includes(evaluations.score)) {
        //                 return { isValid: false, errorMessage: `Invalid Score: '${evaluations.score}'. Expected format: '['A', 'B', 'C', 'D', 'F', 'Absent']'` };
        //             }
        //     }
        // }

        // if (row['Trainee Name']) {
        //     const rowValues = Object.values(row);
        //     if (rowValues.some(value => value === "" && !['Evaluation'].includes(headers[rowValues.indexOf(value)]))) {
        //         return { isValid: false, errorMessage: `All fields for trainee '${row['Trainee Name']}' must have values except under the Evaluation section.` };
        //     }

        //     // Evaluation-specific validation
        //     if (row['Evaluation Name'] && row['Date']) {
        //         const validScores = ["A", "B", "C", "D", "F", "Absent"];
        //         const evaluationScores = headers.slice(headers.indexOf('Evaluation') + 1).map(header => row[header]);

        //         if (evaluationScores.some(score => score && !validScores.includes(score))) {
        //             return { isValid: false, errorMessage: `Invalid score for trainee '${row['Trainee Name']}'. Scores must be one of ${validScores.join(", ")}.` };
        //         }

        //         if (evaluationScores.some(score => score === "")) {
        //             return { isValid: false, errorMessage: `All scores under Evaluation must be filled if Evaluation Name and Date are present for trainee '${row['Trainee Name']}'` };
        //         }
        //     }
        // }

        // Check if Trainee Name has corresponding values in all columns
        // if (row['Trainee Name'] && Object.values(row).some(value => value === "")) {
        //     return { isValid: false, errorMessage: `All fields for trainee '${row['Trainee Name']}' must have values.` };
        // }
    }

    return { isValid: true };
}