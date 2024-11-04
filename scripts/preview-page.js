
function preview_togglepopup() {
        document.getElementById("preview-popup").classList.toggle("active");
    }
    
    function share_togglepopup() {
        document.getElementById("share-popup").classList.toggle("active");
    }

    async function sendEmail() {
        const form = document.getElementById('email-form');
        const formData = new FormData(form);

        try {
            const response = await fetch('http://localhost:3001/send-email', {  // Corrected server URL
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to send email.");
        }
    }
    

    const images = document.querySelectorAll('.image-container img');
const templates = document.querySelectorAll('.workspace > div');
let selectTemplate;



function hideAllTemplates() {
    templates.forEach(template => {
        template.style.display = 'none';
    });
}
// function month(){
//   const currentMonth = 
// }

images.forEach(image => {
    image.addEventListener('click', function() {
        hideAllTemplates()
        const templateKey = this.getAttribute('data-template');
        // selectTemplate = this.getAttribute('data-template');
        // console.log(templateKey);
        selectTemplate=templateKey;

        const selectedTemplate = document.getElementById(templateKey);
        if (selectedTemplate) {

          if(templateKey==="template1"){
            fetch("../data.json")
              .then(response => response.json())
              .then(content => {
                let templatHeaderh3 = document.getElementById("header-template1-h3");
                templatHeaderh3.textContent = content[0].month

              })
              .catch(error => console.error('Error fetching films:', error));
          }
          if(templateKey==="template2"){
            fetch("../data.json")
            .then(response => response.json())
            .then(content =>{
              let templatHeaderh3 = document.getElementById("template2-month");
              templatHeaderh3.textContent = content[0].month

            })
            .catch(error => console.error('Error fetching films:', error));
          }
          if(templateKey==="template3"){
            fetch("../data.json")
            .then(response => response.json())
            .then(content =>{
              let templatHeaderh3 = document.getElementById("subtitle");
              templatHeaderh3.textContent = content[0].month

            })
            .catch(error => console.error('Error fetching films:', error));
          }
          if(templateKey==="template4"){
            fetch("../data.json")
            .then(response => response.json())
            .then(content =>{
              let templatHeaderh3 = document.getElementById("t4date");
              templatHeaderh3.textContent = content[0].month

            })
            .catch(error => console.error('Error fetching films:', error));
          }

          selectedTemplate.style.display = 'block';
        }
        // copyHtml(selectTemplate)
    });
});
 






// function copyHtml( selectTemplate) {
//     var sourceDiv = document.getElementById( selectTemplate);
//     var wrapperDiv = document.querySelector(".preview-report");

//     // Clone the source div including its content
//     var clonedContent = sourceDiv.cloneNode(true);

//     // Clear the wrapper div and append the cloned content
//     wrapperDiv.innerHTML = ''; // Clear previous content
//     wrapperDiv.appendChild(clonedContent); // Append cloned content

//     // Remove the source div's id from the cloned element to avoid conflicts
//     clonedContent.removeAttribute('id');

//     if( selectTemplate==='template1'){
//         clonedContent.style.marginLeft ="10px";
//         clonedContent.style.marginTop ="-20px";

//     }
   
//    else if( selectTemplate==='template2'){
//         clonedContent.style.marginLeft ="40px";
    
//      }
//      else if( selectTemplate==='template3'){
//         clonedContent.style.marginLeft="70px";
        
//      }
//      else{
//         clonedContent.style.marginLeft="40px";

//      }

   

//     // Get the actual dimensions of the cloned content
//     var contentWidth = clonedContent.offsetWidth; // Get original width
//     var contentHeight = clonedContent.offsetHeight; // Get original height

//     // Set the cloned content's width and height to its actual size
//     clonedContent.style.width = contentWidth + "px"; // Set width to original
//     clonedContent.style.height = contentHeight + "px"; // Set height to original

//     // Get the dimensions of the wrapper container
//     var targetWidth = wrapperDiv.offsetWidth;
//     var targetHeight = wrapperDiv.offsetHeight;

//     // Check if the content exceeds the grid container's dimensions
//     if (contentWidth > targetWidth || contentHeight > targetHeight) {
//         // Calculate the scaling factor to fit both dimensions (scale proportionally)
//         var scaleWidth = targetWidth / contentWidth;
//         var scaleHeight = targetHeight / contentHeight;

//         // Use the smaller scaling factor to maintain the aspect ratio
//         var scaleFactor = Math.min(scaleWidth, scaleHeight);

//         // Apply the scaling transformation
//         clonedContent.style.transform = "scale(" + scaleFactor + ")";
//         clonedContent.style.transformOrigin = "top left"; // Set the origin for scaling

//         // Update the dimensions to reflect the scaled content
//         clonedContent.style.width = contentWidth + "px"; // Reset width for scaling
//         clonedContent.style.height = contentHeight + "px"; // Reset height for scaling
//     } else {
//         // If the content fits, reset transform and size
//         clonedContent.style.transform = ""; // Remove scaling
//         clonedContent.style.width = contentWidth + "px"; // Set width to original
//         clonedContent.style.height = contentHeight + "px"; // Set height to original
//     }

//     // // Center the scroll position in the wrapper
//     // wrapperDiv.scrollLeft = (wrapperDiv.scrollWidth - wrapperDiv.clientWidth) / 2; // Center horizontally
//     // wrapperDiv.scrollTop = (wrapperDiv.scrollHeight - wrapperDiv.clientHeight) / 2; // Center vertically
// }


// function copyHtml(selectTemplate) {
//     var sourceDiv = document.getElementById(selectTemplate);
//     var wrapperDiv = document.querySelector(".preview-report");

//     // Clone the source div content
//     var clonedContent = sourceDiv.cloneNode(true);

//     // Clear the wrapper div and append the cloned content
//     wrapperDiv.innerHTML = '';
//     wrapperDiv.appendChild(clonedContent);

//     // Remove the cloned div's ID to avoid conflicts
//     clonedContent.removeAttribute('id');

//     // Apply margin based on template selection
//     if (selectTemplate === 'template1') {
//         clonedContent.style.marginLeft = "10px";
//         clonedContent.style.marginTop = "-20px";
//     } else if (selectTemplate === 'template2') {
//         clonedContent.style.marginLeft = "40px";
//     } else if (selectTemplate === 'template3') {
//         clonedContent.style.marginLeft = "70px";
//     } else {
//         clonedContent.style.marginLeft = "40px";
//     }

//     // Get chart canvas elements in the cloned content
//     var clonedCanvases = clonedContent.querySelectorAll("canvas");

//     // Find the original chart canvases in the source div
//     var originalCanvases = sourceDiv.querySelectorAll("canvas");

//     // Reinitialize charts for each canvas
//     originalCanvases.forEach((originalCanvas, index) => {
//         var chartData = originalCanvas.chart; // Assuming each chart instance is stored in canvas.chart

//         if (chartData) {
//             // Copy the original chart configuration
//             var chartConfig = chartData.config;

//             // Get the corresponding cloned canvas
//             var clonedCanvas = clonedCanvases[index];
//             clonedCanvas.getContext('2d'); // Ensure the context is ready

//             // Recreate the chart in the cloned canvas
//             new Chart(clonedCanvas, chartConfig);
//         }
//     });
// }


function copyHtml(selectTemplate) {
    var sourceDiv = document.getElementById(selectTemplate);
    var wrapperDiv = document.querySelector(".preview-report");

    // Use html2canvas to convert the source div to an image
    html2canvas(sourceDiv).then(canvas => {
        // Clear previous content in the wrapper div
        wrapperDiv.innerHTML = '';

        // Convert the canvas to a PNG data URL
        var imgData = canvas.toDataURL("image/png");

        // Create a new image element
        var img = document.createElement("img");
        img.src = imgData;
        if (selectTemplate === 'template1') {
                    img.style.marginLeft = "10px";
                    img.style.marginTop = "-20px";
                } else if (selectTemplate === 'template2') {
                    img.style.marginLeft = "100px";
                } else if (selectTemplate === 'template3') {
                    img.style.marginLeft = "0px";
                } else {
                    img.style.marginLeft = "40px";
                }

        // Get the dimensions of the wrapper div
        var targetWidth = wrapperDiv.offsetWidth;
        var targetHeight = wrapperDiv.offsetHeight;

        // Set the image dimensions to fit the wrapper div while maintaining aspect ratio
        img.onload = function() {
            // Calculate the aspect ratios
            var imgAspectRatio = img.naturalWidth / img.naturalHeight;
            var targetAspectRatio = targetWidth / targetHeight;

            if (imgAspectRatio > targetAspectRatio) {
                // Image is wider relative to the target div
                img.style.width = targetWidth + "px";
                img.style.height = (targetWidth / imgAspectRatio) + "px";
            } else {
                // Image is taller relative to the target div
                img.style.height = targetHeight + "px";
                img.style.width = (targetHeight * imgAspectRatio) + "px";
            }

            // Append the image to the wrapper div
            wrapperDiv.appendChild(img);
        };
    });
}












    



 const dropdown = document.querySelectorAll('.dropdown');

dropdown.forEach(dropdown => {
    var select = dropdown.querySelector('.select');
    var caret = dropdown.querySelector('.caret');
    var menu = dropdown.querySelector('.menu');
    var options = dropdown.querySelectorAll('.menu li');
    var selected = dropdown.querySelector('.selected');
    var downloadButton = document.getElementById('download-button');
    const canvas = document.getElementById('canvas');

    
    select.addEventListener('click', () => {
        select.classList.toggle('select-clicked');
        caret.classList.toggle('caret-rotate');
        menu.classList.toggle('menu-open');
    });

    function clearDownloadButtonListeners() {
        let newButton = downloadButton.cloneNode(true); 
        downloadButton.replaceWith(newButton); 
        downloadButton = document.getElementById('download-button'); 
    }

    options.forEach(option => {
        option.addEventListener('click', () => {
            selected.innerText = option.innerText;

            
            select.classList.remove('select-clicked');
            caret.classList.remove('caret-rotate');
            menu.classList.remove('menu-open');

            
            clearDownloadButtonListeners();
            downloadButton.disabled = false; 
            console.log(selected.innerText)

            if (selected.innerText === 'pdf') {
                downloadButton.addEventListener('click', downloadPDF);
            } else if (selected.innerText === 'jpg') {
                downloadButton.addEventListener('click', downloadJPG);
            } else {
                downloadButton.addEventListener('click', downloadPNG);
            }

            
            options.forEach(option => {
                option.classList.remove('active');
                option.style.backgroundColor = '';
            });
            option.classList.add('active');
            option.style.backgroundColor = '#dc143cfa';
        });
    });

    
    

    function downloadPDF() {
        
        // const { jsPDF } = window.jspdf; // Import jsPDF
    
        // // Capture the div with html2canvas
        // html2canvas(document.getElementById(selectTemplate)).then(canvas => {
        //     var imgData = canvas.toDataURL('image/jpeg', 1.0); // Convert canvas to image with full quality
    
        //     // Create jsPDF instance (Portrait, A4 page size)
        //     var pdf = new jsPDF('p', 'mm', 'a4');
    
        //     // Calculate width and height in mm (A4 size)
        //     var imgWidth = 210; // A4 width in mm
        //     var pageHeight = 297; // A4 height in mm
        //     var imgHeight = canvas.height * imgWidth / canvas.width;
        //     var heightLeft = imgHeight;
    
        //     var position = 0;
    
        //     // Add the first image to the PDF
        //     pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        //     heightLeft -= pageHeight;
    
        //     // Loop to add new pages if the content is taller than one page
        //     while (heightLeft > 0) {
        //         position = heightLeft - imgHeight; // Calculate the position for the new page
        //         pdf.addPage(); // Create new page
        //         pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        //         heightLeft -= pageHeight;
        //     }
    
        //     // Save the PDF with a filename
        //     pdf.save("report.pdf");
        // });


        
            // const { jsPDF } = window.jspdf;
        
            // html2canvas(document.getElementById(selectTemplate)).then((canvas) => {
            //     const imgData = canvas.toDataURL('image/png');
            //     const pdf = new jsPDF();
        
            //     // Add image to PDF and save
            //     pdf.addImage(imgData, 'PNG', 0, 0);
            //     pdf.save('output.pdf');
            // });



            const { jsPDF } = window.jspdf;

            // Get the content div dimensions
            const content = document.getElementById(selectTemplate);
            const width = content.offsetWidth; // Width of the div
            const height = content.offsetHeight; // Height of the div
        
            // Create PDF with custom dimensions
            const pdf = new jsPDF({
                orientation: 'portrait', // or 'landscape'
                unit: 'px', // Use pixels for dimensions
                format: [width, height], // Set format to the div's width and height
                putOnlyUsedFonts: true,
                floatPrecision: 16 // Precision of float numbers
            });
        
            html2canvas(content).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, width, height); // Adjusted to use div dimensions
                pdf.save('output.pdf');
            });
        
        
    }
    

    function downloadJPG() {
        const element = document.getElementById(selectTemplate);

            // Use html2canvas to capture the div
            html2canvas(element).then((canvas) => {
                // Convert the canvas to JPEG
                canvas.toBlob((blob) => {
                    // Use FileSaver.js to save the blob directly without an anchor tag
                    saveAs(blob, 'report.jpeg'); // Specify the file name
                }, 'image/jpeg'); // Specify the image format
            });
    }
    

    
    

    
    function downloadPNG() {
        const element = document.getElementById(selectTemplate);

            // Use html2canvas to capture the div
            html2canvas(element).then((canvas) => {
                // Convert the canvas to PNG
                canvas.toBlob((blob) => {
                    // Use FileSaver.js to save the blob directly without an anchor tag
                    saveAs(blob, 'report.png'); // Specify the file name
                }, 'image/png'); // Specify the image format
            });
    }
});



const learner = document.querySelectorAll('.learners');

learner.forEach(learner => {
    const select = learner.querySelector('.select-learner');
    const caret = learner.querySelector('.ccaret');
    const menu = learner.querySelector('.menu-learner');
    const options = learner.querySelectorAll('.menu-learner li');
    const selected = learner.querySelector('.selected-learner');

    // Toggle the dropdown on select click
    select.addEventListener('click', () => {
        select.classList.toggle('select-clicked-lerner');
        caret.classList.toggle('caret-rotate-lerner');
        menu.classList.toggle('menu-open-lerner');
    });

    // Handle option selection
    options.forEach(option => {
        option.addEventListener('click', () => {
            // Update the selected text
            selected.innerText = option.innerText;

            // Close the dropdown
            select.classList.remove('select-clicked-lerner');
            caret.classList.remove('caret-rotate-lerner');
            menu.classList.remove('menu-open-lerner');

            // Remove active class and styles from all options
            options.forEach(opt => {
                opt.classList.remove('active-learner');
                opt.style.backgroundColor = '';
            });

            // Set the clicked option as active
            option.classList.add('active-learner');
            option.style.backgroundColor = '#dc143cfa'; // Optional color change
        });
    });
});




let tableContainer;
images.forEach(image => {
    image.addEventListener('click', function() {
        hideAllTemplates()
        const templateKey = this.getAttribute('data-template');
        // selectTemplate = this.getAttribute('data-template');
        // console.log(templateKey);
        selectTemplate=templateKey;

        const selectedTemplate = document.getElementById(templateKey);
        if (selectedTemplate) {

            if(templateKey==="template2"){
                tableContainer = document.getElementById('tableContainer2')  
            }
            else if(templateKey==="template4"){
                tableContainer=document.getElementById('tableContainer4')
            }
            else if(templateKey==="template3"){
                tableContainer=document.getElementById('tableContainer3')
            }
            else{
                tableContainer=document.getElementById('tableContainer1')

            }

            tableContainer.innerHTML = '';



        }})});



const contentDiv = document.getElementById('workspace');
// const tableContainer = document.getElementById('tableContainer');
let selectedCell = null; // To track the currently selected cell

function createTable() {
    const rows = parseInt(document.getElementById('rowCount').value);
    const cols = parseInt(document.getElementById('colCount').value);
    
    const table = document.createElement('table');
    table.className = 'custom-table';
    
    for (let i = 0; i < rows; i++) {
        const row = table.insertRow();
        for (let j = 0; j < cols; j++) {
            const cell = row.insertCell();
            cell.contentEditable = true; // Make cell editable
            cell.innerText = `Row ${i + 1}, Col ${j + 1}`;
            cell.onclick = () => selectCell(cell); // Set as selected on click
        }
    }

    tableContainer.appendChild(table);
    selectedTable = table;
}

function selectCell(cell) {
    // Clear highlight from previously selected cell
    if (selectedCell) {
        selectedCell.classList.remove('selected-cell');
    }
    
    // Highlight the new selected cell
    selectedCell = cell;
    selectedCell.classList.add('selected-cell');
}





function toggleBold() {
    if (selectedCell) {
        selectedCell.style.fontWeight = selectedCell.style.fontWeight === 'bold' ? 'normal' : 'bold';
    } else {
        alert('Please select a cell to apply bold formatting.');
    }
}

function changeTextColor() {
    const color = document.getElementById('textColorPicker').value;
    if (selectedCell) {
        selectedCell.style.color = color;
    } else {
        alert('Please select a cell to change text color.');
    }
}

function changeCellColor() {
    const color = document.getElementById('bgColorPicker').value;
    if (selectedCell) {
        selectedCell.style.backgroundColor = color;
    } else {
        alert('Please select a cell to change background color.');
    }
}

function toggleBorder() {
    const tables = document.querySelectorAll('.custom-table');
    tables.forEach(table => {
        table.classList.toggle('dark-border');
    });
}

function changeRowColor() {
    if (!selectedCell) {
        alert('Please select a cell to change the row color.');
        return;
    }
    const row = selectedCell.parentElement;
    const color = document.getElementById('rowColorPicker').value;
    Array.from(row.cells).forEach(cell => {
        cell.style.backgroundColor = color;
    });
}

function changeColumnColor() {
    if (!selectedCell) {
        alert('Please select a cell to change the column color.');
        return;
    }
    const columnIndex = selectedCell.cellIndex;
    const tables = document.querySelectorAll('.custom-table');
    const color = document.getElementById('colColorPicker').value;
    tables.forEach(table => {
        Array.from(table.rows).forEach(row => {
            row.cells[columnIndex].style.backgroundColor = color;
        });
    });
}


// let selectedCells = [];
// function selectCell(cell, event) {
//             // Check if the Ctrl or Command key is pressed for multi-select
//             if (event.ctrlKey || event.metaKey) {
//                 if (selectedCells.includes(cell)) {
//                     // Deselect the cell
//                     selectedCells = selectedCells.filter(c => c !== cell);
//                     cell.classList.remove('selected-cell'); // Remove highlight
//                 } else {
//                     // Select the cell
//                     selectedCells.push(cell);
//                     cell.classList.add('selected-cell'); // Add highlight
//                 }
//             } else {
//                 // If no key is pressed, clear selections and select the clicked cell
//                 clearSelections();
//                 selectedCells.push(cell);
//                 cell.classList.add('selected-cell');
//             }
//         }

function mergeCells() {
    if (!selectedTable) {
        alert("Please add a table first.");
        return;
    }

    const startRow = parseInt(document.getElementById("mergeRowStart").value) - 1;
    const endRow = parseInt(document.getElementById("mergeRowEnd").value) - 1;
    const startCol = parseInt(document.getElementById("mergeColStart").value) - 1;
    const endCol = parseInt(document.getElementById("mergeColEnd").value) - 1;

    // Validate inputs
    if (startRow < 0 || endRow < startRow || startCol < 0 || endCol < startCol) {
        alert("Please enter valid merge range.");
        return;
    }

    // Merge the selected cells by setting colspan and rowspan on the top-left cell
    const mainCell = selectedTable.rows[startRow].cells[startCol];
    const rowspan = endRow - startRow + 1;
    const colspan = endCol - startCol + 1;

    mainCell.rowSpan = rowspan;
    mainCell.colSpan = colspan;

    // Remove the merged cells from the table
    for (let i = startRow; i <= endRow; i++) {
        for (let j = startCol; j <= endCol; j++) {
            if (i === startRow && j === startCol) continue;
            selectedTable.rows[i].deleteCell(startCol); // Always delete at startCol as cells shift left
        }
    }
}



        function deleteCell() {
            if (!selectedTable) {
                alert("Please add a table first.");
                return;
            }
        
            const deleteRow = parseInt(document.getElementById("deleteRow").value) - 1;
            const deleteCol = parseInt(document.getElementById("deleteCol").value) - 1;
        
            // Validate inputs
            if (deleteRow < 0 || deleteRow >= selectedTable.rows.length || 
                deleteCol < 0 || deleteCol >= selectedTable.rows[deleteRow].cells.length) {
                alert("Please enter a valid cell location.");
                return;
            }
        
            // Delete the specified cell
            selectedTable.rows[deleteRow].deleteCell(deleteCol);
        
            // If the row has no more cells, delete the entire row
            if (selectedTable.rows[deleteRow].cells.length === 0) {
                selectedTable.deleteRow(deleteRow);
            }
        }

        function setTableSpacing() {
            const spacing = parseInt(document.getElementById('tableSpacing').value) || 0;
            const tables = document.querySelectorAll('.custom-table');
            
            tables.forEach((table, index) => {
                if (index > 0) { // Skip the first table to avoid top margin on it
                    table.style.marginTop = `${spacing}px`;
                }
            });
        }

        function increaseIndent() {
            if (selectedCell) {
                let currentIndent = parseInt(selectedCell.style.paddingLeft) || 0;
                selectedCell.style.paddingLeft = (currentIndent + 10) + 'px';
            } else {
                alert('Please select a cell to indent.');
            }
        }
        
        
        function decreaseIndent() {
            if (selectedCell) {
                let currentIndent = parseInt(selectedCell.style.paddingLeft) || 0;
                if (currentIndent > 0) {
                    selectedCell.style.paddingLeft = (currentIndent - 10) + 'px';
                }
            } else {
                alert('Please select a cell to decrease indent.');
            }
        }

        function increaseTextSize() {
            if (selectedCell) {
                let currentSize = parseInt(window.getComputedStyle(selectedCell).fontSize);
                selectedCell.style.fontSize = (currentSize + 2) + 'px';
            } else {
                alert('Please select a cell to increase text size.');
            }
        }
        
        
        function decreaseTextSize() {
            if (selectedCell) {
                let currentSize = parseInt(window.getComputedStyle(selectedCell).fontSize);
                if (currentSize > 6) { // Prevents text size from becoming too small
                    selectedCell.style.fontSize = (currentSize - 2) + 'px';
                }
            } else {
                alert('Please select a cell to decrease text size.');
            }
        }


        function increaseTableTextSize() {
            if (selectedTable) {
                const cells = selectedTable.getElementsByTagName('td');
                for (let cell of cells) {
                    let currentSize = parseInt(window.getComputedStyle(cell).fontSize);
                    cell.style.fontSize = (currentSize + 2) + 'px';
                }
            } else {
                alert('Please select a table to increase text size.');
            }
        }
        
        
        function decreaseTableTextSize() {
            if (selectedTable) {
                const cells = selectedTable.getElementsByTagName('td');
                for (let cell of cells) {
                    let currentSize = parseInt(window.getComputedStyle(cell).fontSize);
                    if (currentSize > 6) { // Prevents text size from becoming too small
                        cell.style.fontSize = (currentSize - 2) + 'px';
                    }
                }
            } else {
                alert('Please select a table to decrease text size.');
            }
        }



        const editor = document.getElementById('editor');
    const toolbar = document.getElementById('toolbar');

    // Show the toolbar when the editor is focused or when typing
    editor.addEventListener('focus', showToolbar);
    editor.addEventListener('input', showToolbar);

    // Hide the toolbar when clicking outside the editor
    document.addEventListener('click', (event) => {
        if (!editor.contains(event.target) && !toolbar.contains(event.target)) {
            toolbar.style.display = 'none';
        }
    });

    function showToolbar() {
        toolbar.style.display = 'flex';
    }

    // Toolbar functions
    function changeBackgroundColor() {
        const bgColor = document.getElementById('bgColorPicker').value;
        editor.style.backgroundColor = bgColor; // Change the background color of the editor
    }

    function changeFontColor() {
        const fontColor = document.getElementById('fontColorPicker').value;
        document.execCommand('foreColor', false, fontColor); // Change font color
    }

    function toggleBold() {
        document.execCommand('bold');
    }

    function toggleItalic() {
        document.execCommand('italic');
    }

    function addBulletPoints() {
        document.execCommand('insertUnorderedList');
    }

    function increaseFontSize() {
        document.execCommand('fontSize', false, '5');
    }





    

















  


    
    


    