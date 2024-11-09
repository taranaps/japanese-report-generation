
function preview_togglepopup() {
  document.getElementById("preview-popup").classList.toggle("active");
}

function share_togglepopup() {
  document.getElementById("share-popup").classList.toggle("active");
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
  image.addEventListener('click', function () {
    hideAllTemplates()
    const templateKey = this.getAttribute('data-template');
    // selectTemplate = this.getAttribute('data-template');
    // console.log(templateKey);
    selectTemplate = templateKey;

    const selectedTemplate = document.getElementById(templateKey);
    if (selectedTemplate) {

      if (templateKey === "template1") {
        fetch("../data.json")
          .then(response => response.json())
          .then(content => {
            let templatHeaderh3 = document.getElementById("header-template1-h3");
            templatHeaderh3.textContent = content[0].month

          })
          .catch(error => console.error('Error fetching films:', error));
      }
      if (templateKey === "template2") {
        fetch("../data.json")
          .then(response => response.json())
          .then(content => {
            let templatHeaderh3 = document.getElementById("template2-month");
            templatHeaderh3.textContent = content[0].month

          })
          .catch(error => console.error('Error fetching films:', error));
      }
      if (templateKey === "template3") {
        fetch("../data.json")
          .then(response => response.json())
          .then(content => {
            let templatHeaderh3 = document.getElementById("subtitle");
            templatHeaderh3.textContent = content[0].month

          })
          .catch(error => console.error('Error fetching films:', error));
      }
      if (templateKey === "template4") {
        fetch("../data.json")
          .then(response => response.json())
          .then(content => {
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
  const fileInputButton = document.getElementById("img-input");

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
    img.onload = function () {
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

      fetch(imgData)
        .then(res => res.blob())
        .then(blob => {
          // Get the current date and time for a unique filename
          const now = new Date();
          const formattedDate = now.toISOString().replace(/[:.]/g, '-'); // Format YYYY-MM-DDTHH-MM-SS

          // Create a unique file name using the timestamp
          const fileName = `captured_image_${formattedDate}.png`;
          const file = new File([blob], fileName, { type: "image/png" });

          // Assign this file to the file input element's `files` property
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputButton.files = dataTransfer.files;
        });
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



// const learner = document.querySelectorAll('.learners');

// learner.forEach(learner => {
//     const select = learner.querySelector('.select-learner');
//     const caret = learner.querySelector('.ccaret');
//     const menu = learner.querySelector('.menu-learner');
//     const options = learner.querySelectorAll('.menu-learner li');
//     const selected = learner.querySelector('.selected-learner');

//     // Toggle the dropdown on select click
//     select.addEventListener('click', () => {
//         select.classList.toggle('select-clicked-lerner');
//         caret.classList.toggle('caret-rotate-lerner');
//         menu.classList.toggle('menu-open-lerner');
//     });

//     // Handle option selection
//     options.forEach(option => {
//         option.addEventListener('click', () => {
//             // Update the selected text
//             selected.innerText = option.innerText;

//             // Close the dropdown
//             select.classList.remove('select-clicked-lerner');
//             caret.classList.remove('caret-rotate-lerner');
//             menu.classList.remove('menu-open-lerner');

//             // Remove active class and styles from all options
//             options.forEach(opt => {
//                 opt.classList.remove('active-learner');
//                 opt.style.backgroundColor = '';
//             });

//             // Set the clicked option as active
//             option.classList.add('active-learner');
//             option.style.backgroundColor = '#dc143cfa'; // Optional color change
//         });
//     });
// });











let tableContainer;
let toolbarId;
let mergeRowIndex;
let startColumnIndex;
let endColumnIndex;
let mergeColIndex;
let startrowIndex;
let endrowIndex;
let toolbar_text;
let textColorPicker;
let highlightColorPicker;
let imageToolbar;
let hideImage;
images.forEach(image => {
  image.addEventListener('click', function () {
    hideAllTemplates()
    const templateKey = this.getAttribute('data-template');
    // selectTemplate = this.getAttribute('data-template');
    // console.log(templateKey);
    selectTemplate = templateKey;

    const selectedTemplate = document.getElementById(templateKey);
    if (selectedTemplate) {

      if (templateKey === "template2") {
        tableContainer = document.getElementById('tableContent2')
        toolbarId = 'toolbar2'
        mergeRowIndex = 'mergeRowIndex2'
        startColumnIndex = 'startColumnIndex2'
        endColumnIndex = 'endColumnIndex2'
        mergeColIndex = 'mergeColIndex2'
        startrowIndex = 'startRowIndex2'
        endrowIndex = 'endRowIndex2'
        toolbar_text = 'toolbar-text2'
        textColorPicker = 'textColorPicker2'
        highlightColorPicker = 'highlightColorPicker2'
        imageToolbar = 'imageToolbar2'
        hideImage = '#tableContent2 img'


      }
      else if (templateKey === "template5") {
        tableContainer = document.getElementById('tableContent4')
        toolbarId = 'toolbar4'
        mergeRowIndex = 'mergeRowIndex4'
        startColumnIndex = 'startColumnIndex4'
        endColumnIndex = 'endColumnIndex4'
        mergeColIndex = 'mergeColIndex4'
        startrowIndex = 'startRowIndex4'
        endrowIndex = 'endRowIndex4'
        toolbar_text = 'toolbar-text4'
        textColorPicker = 'textColorPicker4'
        highlightColorPicker = 'highlightColorPicker4'
        imageToolbar = 'imageToolbar4'
        hideImage = '#tableContent4 img'

      }
      else if (templateKey === "template3") {
        tableContainer = document.getElementById('tableContent3')
        toolbarId = 'toolbar3'
        mergeRowIndex = 'mergeRowIndex3'
        startColumnIndex = 'startColumnIndex3'
        endColumnIndex = 'endColumnIndex3'
        mergeColIndex = 'mergeColIndex3'
        startrowIndex = 'startRowIndex3'
        endrowIndex = 'endRowIndex3'
        toolbar_text = 'toolbar-text3'
        textColorPicker = 'textColorPicker3'
        highlightColorPicker = 'highlightColorPicker3'
        imageToolbar = 'imageToolbar3'
        hideImage = '#tableContent3 img'

      }
      else {
        tableContainer = document.getElementById('tableContent1')
        tableId = 'tablecontainer1'
        toolbarId = 'toolbar1'
        mergeRowIndex = 'mergeRowIndex1'
        startColumnIndex = 'startColumnIndex1'
        endColumnIndex = 'endColumnIndex1'
        mergeColIndex = 'mergeColIndex1'
        startrowIndex = 'startRowIndex1'
        endrowIndex = 'endRowIndex1'
        toolbar_text = 'toolbar-text1'
        textColorPicker = 'textColorPicker1'
        highlightColorPicker = 'highlightColorPicker1'
        imageToolbar = 'imageToolbar1'
        hideImage = '#tableContent1 img'


      }

      tableContainer.innerHTML = '';



    }
  })
});



const contentDiv = document.getElementById('workspace');



document.getElementById("increaseMarginBtn").onclick = function () {
  const targetDiv = document.getElementById(tableId);

  // Get the current margin-bottom of the div
  const currentMarginTop = parseInt(window.getComputedStyle(targetDiv).marginTop);

  // Increase the margin-bottom by 10 pixels
  targetDiv.style.marginTop = (currentMarginTop - 10) + "px";
  let toolbar = document.getElementById(toolbarId)
  toolbar.style.marginTop = '-170px';
  let toolbarText = document.getElementById(toolbar_text);
  toolbarText.style.marginTop = '-170px'
  let toolbarImage = document.getElementById(imageToolbar);
  toolbarImage.style.marginTop = '-170px'
};

document.getElementById("decreaseMarginBtn").onclick = function () {
  const targetDiv = document.getElementById(tableId);

  // Get the current margin-bottom of the div
  const currentMarginTop = parseInt(window.getComputedStyle(targetDiv).marginTop);

  // Increase the margin-bottom by 10 pixels
  targetDiv.style.marginTop = (currentMarginTop + 10) + "px";
  let toolbar = document.getElementById(toolbarId)
  toolbar.style.marginTop = '70px';
  let toolbarText = document.getElementById(toolbar_text);
  toolbarText.style.marginTop = '70px'
  let toolbarImage = document.getElementById(imageToolbar);
  toolbarImage.style.marginTop = '70px'



};





let selectedTable = null; // Track the selected table
let selectedCell = null;  // Track the selected cell


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
      cell.onclick = () => selectCell(cell, table); // Set as selected on click
    }
  }

  tableContainer.appendChild(table);
}

// Function to select a cell and set its table as the selectedTable
function selectCell(cell, table) {
  selectedCell = cell;
  selectedTable = table;

  // Display and position the toolbar
  const toolbar = document.getElementById(toolbarId);
  toolbar.style.display = 'block';
  const rect = cell.getBoundingClientRect();
  toolbar.style.top = `${rect.top - toolbar.offsetHeight - 5}px`;
  toolbar.style.left = `${rect.left}px`;
}

// Close toolbar when clicking outside the toolbar and tables
document.addEventListener('click', (event) => {
  const toolbar = document.getElementById(toolbarId);
  if (!toolbar.contains(event.target) && (!selectedTable || !selectedTable.contains(event.target))) {
    toolbar.style.display = 'none';
    selectedCell = null;
    selectedTable = null;
  }
});


function makeBold() {
  if (selectedCell) {
    selectedCell.style.fontWeight =
      selectedCell.style.fontWeight === 'bold' ? 'normal' : 'bold';
  }
}

function increaseTextSize() {
  if (selectedCell) {
    const currentSize = window.getComputedStyle(selectedCell).fontSize;
    selectedCell.style.fontSize = `${parseInt(currentSize) + 2}px`;
  }
}


// function mergeCells() {
//     if (!selectedTable) {
//         alert("Please add a table first.");
//         return;
//     }

//     const startRow = parseInt(document.getElementById("mergeRowStart").value) - 1;
//     const endRow = parseInt(document.getElementById("mergeRowEnd").value) - 1;
//     const startCol = parseInt(document.getElementById("mergeColStart").value) - 1;
//     const endCol = parseInt(document.getElementById("mergeColEnd").value) - 1;

//     // Validate inputs
//     if (startRow < 0 || endRow < startRow || startCol < 0 || endCol < startCol) {
//         alert("Please enter valid merge range.");
//         return;
//     }

//     // Merge the selected cells by setting colspan and rowspan on the top-left cell
//     const mainCell = selectedTable.rows[startRow].cells[startCol];
//     const rowspan = endRow - startRow + 1;
//     const colspan = endCol - startCol + 1;

//     mainCell.rowSpan = rowspan;
//     mainCell.colSpan = colspan;

//     // Remove the merged cells from the table
//     for (let i = startRow; i <= endRow; i++) {
//         for (let j = startCol; j <= endCol; j++) {
//             if (i === startRow && j === startCol) continue;
//             selectedTable.rows[i].deleteCell(startCol); // Always delete at startCol as cells shift left
//         }
//     }
// }



function setTableSpacing() {
  const spacing = parseInt(document.getElementById('tableSpacing').value) || 0;
  const tables = document.querySelectorAll('.custom-table');

  tables.forEach((table, index) => {
    if (index > 0) { // Skip the first table to avoid top margin on it
      table.style.marginTop = `${spacing}px`;
    }
  });
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



function increaseTableSize() {
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


function decreaseTableSize() {
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


function changeCellBackground() {
  if (selectedCell) {
    // Create a color picker dynamically
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.style.position = 'relative';
    colorPicker.style.zIndex = '1000';
    //   colorPicker.style.opacity = '0'; // Hide the picker but keep it clickable

    // Add event listener to apply color on change
    colorPicker.addEventListener('input', (event) => {
      selectedCell.style.backgroundColor = event.target.value;
    });

    // Append to body and click to open the picker
    document.body.appendChild(colorPicker);
    colorPicker.click();

    // Remove the color picker after color is selected
    colorPicker.addEventListener('change', () => {
      document.body.removeChild(colorPicker);
    });
  }
}


let defaultTextColor = '#000000'; // Initial default text color (black)

function changeTextColorTable() {
  if (selectedCell) {
    // Create a color picker with the last chosen color as the default
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    // colorPicker.value = defaultTextColor; // Set the default text color
    colorPicker.style.position = 'absolute';
    colorPicker.style.zIndex = '1000';
    colorPicker.style.opacity = '0';

    // Add event listener to apply color on change
    colorPicker.addEventListener('input', (event) => {
      selectedCell.style.color = event.target.value;
      defaultTextColor = event.target.value; // Update default text color
    });

    // Append to body and click to open the picker
    document.body.appendChild(colorPicker);
    colorPicker.click();

    // Remove the color picker after color is selected
    colorPicker.addEventListener('change', () => {
      document.body.removeChild(colorPicker);
    });
  }
}


function changeRowBackground() {
  if (selectedCell) {
    // Create a color picker with the last chosen color as the default
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.style.position = 'absolute';
    colorPicker.style.zIndex = '1000';
    colorPicker.style.opacity = '0';

    // Get the row of the selected cell
    const row = selectedCell.parentElement;

    // Add event listener to apply color on change
    colorPicker.addEventListener('input', (event) => {
      row.style.backgroundColor = event.target.value; // Change the background color of the entire row
    });

    // Append to body and click to open the picker
    document.body.appendChild(colorPicker);
    colorPicker.click();

    // Remove the color picker after color is selected
    colorPicker.addEventListener('change', () => {
      document.body.removeChild(colorPicker);
    });
  }
}

function changeColumnBackground() {
  if (selectedCell) {
    // Create a color picker with the last chosen color as the default
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.style.position = 'absolute';
    colorPicker.style.zIndex = '1000';
    colorPicker.style.opacity = '0';

    // Get the column index of the selected cell
    const colIndex = selectedCell.cellIndex;
    const table = selectedCell.closest('table'); // Get the closest table

    // Add event listener to apply color on change
    colorPicker.addEventListener('input', (event) => {
      for (let row of table.rows) {
        row.cells[colIndex].style.backgroundColor = event.target.value; // Change the background color of the entire column
      }
    });

    // Append to body and click to open the picker
    document.body.appendChild(colorPicker);
    colorPicker.click();

    // Remove the color picker after color is selected
    colorPicker.addEventListener('change', () => {
      document.body.removeChild(colorPicker);
    });
  }
}




function mergeRowCells() {
  const rowIndex = parseInt(document.getElementById(mergeRowIndex).value) - 1; // Convert to 0-based index
  const startColIndex = parseInt(document.getElementById(startColumnIndex).value) - 1; // Convert to 0-based index
  const endColIndex = parseInt(document.getElementById(endColumnIndex).value) - 1; // Convert to 0-based index

  if (selectedTable && rowIndex >= 0 && startColIndex >= 0 && endColIndex >= startColIndex) {
    const row = selectedTable.rows[rowIndex];
    if (row) {
      const cellsToMerge = Array.from(row.cells).slice(startColIndex, endColIndex + 1); // Get the cells to merge

      if (cellsToMerge.length > 1) {
        const mergedText = cellsToMerge.map(c => c.innerText).join(' '); // Combine text from merged cells
        cellsToMerge[0].colSpan = cellsToMerge.length; // Set colspan for the first cell
        cellsToMerge[0].innerText = mergedText; // Set combined text
        cellsToMerge.slice(1).forEach(c => {
          c.style.display = 'none'; // Hide the merged cells
          c.classList.remove('selected'); // Remove selection from hidden cells
        });
        selectedCells = []; // Clear selected cells after merging
        document.getElementById(toolbarId).style.display = 'none'; // Hide toolbar
      }

      document.getElementById(mergeRowIndex).value = '';
      document.getElementById(startColumnIndex).value = '';
      document.getElementById(endColumnIndex).value = '';
    }
  } else {
    alert("Invalid row or column index");
  }
}


function toggleTableBorder() {
  if (selectedTable) {
    const isBorderVisible = selectedTable.style.borderCollapse = 'collapse';
    // selectedTable.style.borderCollapse = isBorderVisible ? 'separate' : 'collapse';
    selectedTable.style.border = isBorderVisible ? '1px solid #333' : '2px solid #333';

    // Optionally, you can also toggle individual cell borders
    const cells = selectedTable.getElementsByTagName('td');
    for (let cell of cells) {
      cell.style.border = isBorderVisible ? '1px solid #333' : '2px solid #333';
    }
  }
  isBorderVisible = 'seperate'

}



function mergeColumnCells() {
  const colIndex = parseInt(document.getElementById(mergeColIndex).value) - 1; // Convert to 0-based index
  const startRowIndex = parseInt(document.getElementById(startrowIndex).value) - 1; // Convert to 0-based index
  const endRowIndex = parseInt(document.getElementById(endrowIndex).value) - 1; // Convert to 0-based index

  if (selectedTable && colIndex >= 0 && startRowIndex >= 0 && endRowIndex >= startRowIndex) {
    const rowsToMerge = Array.from(selectedTable.rows).slice(startRowIndex, endRowIndex + 1);

    if (rowsToMerge.length > 1) {
      const mergedText = rowsToMerge.map(row => row.cells[colIndex]?.innerText || "").join(" ");
      const firstCell = rowsToMerge[0].cells[colIndex];

      firstCell.rowSpan = rowsToMerge.length; // Set row span for the first cell
      firstCell.innerText = mergedText; // Set combined text

      // Hide merged cells in subsequent rows
      rowsToMerge.slice(1).forEach(row => {
        row.cells[colIndex].style.display = 'none';
      });

      // Clear toolbar inputs
      document.getElementById(mergeColIndex).value = '';
      document.getElementById(startrowIndex).value = '';
      document.getElementById(endrowIndex).value = '';
    }
  } else {
    alert("Invalid row or column index.");
  }
}


function addRow() {
  if (selectedTable && selectedCell) {
    const selectedRow = selectedCell.parentNode;
    const rowIndex = selectedRow.rowIndex;
    const newRow = selectedTable.insertRow(rowIndex + 1); // Insert below the selected row

    const cols = selectedTable.rows[0].cells.length;
    for (let i = 0; i < cols; i++) {
      const cell = newRow.insertCell();
      cell.contentEditable = true;
      cell.innerText = `New Row, Col ${i + 1}`;
      cell.onclick = () => selectCell(cell, selectedTable);
    }
  } else {
    alert('Please select a cell to insert a row below.');
  }
}


function addColumn() {
  if (selectedTable && selectedCell) {
    const colIndex = selectedCell.cellIndex;

    for (let i = 0; i < selectedTable.rows.length; i++) {
      const row = selectedTable.rows[i];
      const newCell = row.insertCell(colIndex + 1); // Insert right of the selected cell
      newCell.contentEditable = true;
      newCell.innerText = `Row ${i + 1}, New Col ${colIndex + 2}`;
      newCell.onclick = () => selectCell(newCell, selectedTable);
    }
  } else {
    alert('Please select a cell to insert a column to the right.');
  }
}



function setUniformSize() {
  if (selectedTable) {
    const width = prompt("Enter cell width in pixels:", "100");
    const height = prompt("Enter cell height in pixels:", "50");

    if (width && height) {
      const cells = selectedTable.getElementsByTagName("td");
      for (let cell of cells) {
        cell.style.width = `${width}px`;
        cell.style.height = `${height}px`;
      }
    }
  } else {
    alert("Please select a table by clicking a cell first.");
  }
}



function deleteTable() {
  if (selectedTable) {
    selectedTable.remove(); // Remove the selected table from the DOM
    selectedTable = null; // Reset the selected table
    document.getElementById(toolbarId).style.display = 'none'; // Hide the toolbar
  } else {
    alert("Please select a table to delete.");
  }
}

function deleteCell() {
  if (selectedCell) {
    const row = selectedCell.parentNode;
    row.deleteCell(selectedCell.cellIndex); // Delete the selected cell
    selectedCell = null; // Reset the selected cell
    document.getElementById(toolbarId).style.display = 'none'; // Hide the toolbar
  } else {
    alert("Please select a cell to delete.");
  }
}















let activeEditableDiv;

function createTextarea() {
  const specificDiv = tableContainer

  // Create a contenteditable div
  const editableDiv = document.createElement('div');
  editableDiv.contentEditable = "true";
  editableDiv.className = "editable-div";
  // editableDiv.style.border = "1px solid #ccc";
  editableDiv.style.padding = "10px";
  editableDiv.style.height = "auto";
  editableDiv.style.fontSize = "16px"; // Default font size
  editableDiv.innerText = "Enter your text here...";

  // Show toolbar when div is focused (clicked)
  editableDiv.addEventListener('click', () => {
    activeEditableDiv = editableDiv;
    showToolbar();
  })

  // Add the editable div to the specific container
  specificDiv.appendChild(editableDiv);
  activeEditableDiv = editableDiv;

  function showToolbar() {
    const toolbar1 = document.getElementById(toolbar_text);
    toolbar1.style.display = 'block';

  }
}



function hideToolbar() {
  const toolbar1 = document.getElementById(toolbar_text);
  toolbar1.style.display = 'none';
}

// Toolbar action functions
function makeBold() {
  document.execCommand('bold');
}

function makeItalic() {
  document.execCommand('italic');
}

function makeUnderline() {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const selectedText = range.toString();

  if (selectedText) {
    const span = document.createElement('span');
    const currentStyle = range.startContainer.parentElement.style.textDecoration;

    // Check if the selected text is already underlined
    if (currentStyle === 'underline') {
      // Remove underline
      range.startContainer.parentElement.style.textDecoration = '';
    } else {
      // Apply underline
      span.style.textDecoration = 'underline';
      span.textContent = selectedText;

      // Replace the selected text with the underlined version
      range.deleteContents();
      range.insertNode(span);
    }
  }
}


function increaseFontSize() {
  document.execCommand('fontSize', false, '5'); // Larger font size (default options: 1-7)
}

function decreaseFontSize() {
  document.execCommand('fontSize', false, '3'); // Smaller font size
}

// Global event listener to hide toolbar if click is outside editable div or toolbar
document.addEventListener('click', (event) => {
  const toolbar1 = document.getElementById(toolbar_text);
  if (activeEditableDiv && !toolbar1.contains(event.target) && !activeEditableDiv.contains(event.target)) {
    hideToolbar();

  }
});


function changeTextColor() {
  const color = document.getElementById(textColorPicker).value;
  document.execCommand("foreColor", false, color);
}

function highlightText() {
  const color = document.getElementById(highlightColorPicker).value;
  document.execCommand("backColor", false, color); // Use "hiliteColor" in some browsers
}
function toggleBulletPoints() {
  document.execCommand("insertUnorderedList"); // Toggles bullet points
}

function applyIndent() {
  document.execCommand("indent"); // Indent selected text
}

function applyOutdent() {
  document.execCommand("outdent"); // Outdent selected text  
}





let selectedImages = [];
let selectedImageElement = null;

// Store the selected images when the user uploads them
document.getElementById("uploadImage").addEventListener("change", function (event) {
  selectedImages = Array.from(event.target.files); // Convert file list to array
});

// Display all selected images in the container when the button is clicked
function displayUploadedPhotos() {
  // const imageContainer = document.getElementById("imageContainer");
  // imageContainer.innerHTML = ""; // Clear the container before displaying new images

  if (selectedImages.length > 0) {
    selectedImages.forEach(imageFile => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const imgElement = document.createElement("img");
        imgElement.src = e.target.result;
        imgElement.alt = "Uploaded Image";
        imgElement.onclick = () => showToolbar(imgElement);
        tableContainer.appendChild(imgElement);
      };
      reader.readAsDataURL(imageFile);
    });
  } else {
    alert("Please select one or more images first.");
  }
}

// Show toolbar above the clicked image
function showToolbar(imgElement) {
  selectedImageElement = imgElement; // Set the selected image element
  const toolbar = document.getElementById(imageToolbar);

  // Calculate position above the image
  const imgRect = imgElement.getBoundingClientRect();
  toolbar.style.display = "block";
  toolbar.style.top = `${imgRect.top - toolbar.offsetHeight - 10}px`;
  toolbar.style.left = `${imgRect.left}px`;
}

// Reduce the size of the selected image
function reduceImageSize() {
  if (selectedImageElement) {
    // Get the current width of the image in pixels
    const currentWidth = parseInt(window.getComputedStyle(selectedImageElement).width);
    // Reduce the width by 10px
    selectedImageElement.style.width = `${currentWidth - 10}px`;
  }
}


function increaseImageSize() {
  if (selectedImageElement) {
    const currentWidth = parseInt(window.getComputedStyle(selectedImageElement).width);
    selectedImageElement.style.width = `${currentWidth + 10}px`;
  }
}

function indentImageLeft() {
  if (selectedImageElement) {
    const currentMarginLeft = parseInt(window.getComputedStyle(selectedImageElement).marginLeft) || 0;
    selectedImageElement.style.marginLeft = `${currentMarginLeft - 10}px`; // Move left by 10px
  }
}


function indentImageRight() {
  if (selectedImageElement) {
    const currentMarginLeft = parseInt(window.getComputedStyle(selectedImageElement).marginLeft) || 0;
    selectedImageElement.style.marginLeft = `${currentMarginLeft + 10}px`; // Move right by 10px
  }
}


function setImageBorderColor() {
  if (selectedImageElement) {
    const color = document.getElementById("borderColorPicker").value;
    selectedImageElement.style.border = `2px solid ${color}`; // Apply border with the selected color
  }
}
function addMarginTop() {
  if (selectedImageElement) {
    const currentMarginTop = parseInt(window.getComputedStyle(selectedImageElement).marginTop) || 0;
    selectedImageElement.style.marginTop = `${currentMarginTop + 10}px`; // Move right by 10px
  }
}
function addMarginBottom() {
  if (selectedImageElement) {
    const currentMarginBottom = parseInt(window.getComputedStyle(selectedImageElement).marginTop) || 0;
    selectedImageElement.style.marginTop = `${currentMarginBottom - 10}px`; // Move right by 10px
  }

}


// Hide toolbar when clicking outside of an image
document.addEventListener("click", function (event) {
  const toolbar = document.getElementById(imageToolbar);
  if (!event.target.closest(hideImage) && event.target !== toolbar && !toolbar.contains(event.target)) {
    toolbar.style.display = "none";
  }
});

































