import {
    ClassicEditor,
    AccessibilityHelp,
    Autoformat,
    AutoLink,
    Autosave,
    BalloonToolbar,
    Bold,
    Heading,
    Essentials,
    Font, 
    Underline, 
    Alignment,
    Italic,
    Link,
    List,
    ListProperties,
    Paragraph,
    SelectAll,
    ShowBlocks,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableProperties,
    TableToolbar,
    TextPartLanguage,
    TextTransformation,
    Title,
    TodoList,
    Undo,
} from 'ckeditor5';

const templateImages = document.querySelectorAll(".side-bar img");
const editorElement = document.querySelector("#editor");
let editorInstance;  
const templates = {
  template1: `
    <h1>Template 1: Welcome to Our Platform</h1>
    <p>This is a simple introduction to our platform where you can add more content here.</p>`,
  
  template2: `
    <h1>Template 2: Project Overview</h1>
    <p>This template is used to describe your project in detail.</p>
    <ul>
      <li>Key Milestones</li>
      <li>Important Deadlines</li>
      <li>Team Members</li>
    </ul>`,
  
  template3: `
    <h1>Template 3: Meeting Notes</h1>
    <p>Document the key points from your recent meeting.</p>
    <table border="1">
      <tr><th>Topic</th><th>Discussion Points</th></tr>
      <tr><td>Agenda Item 1</td><td>Details for agenda item 1</td></tr>
    </table>`,
  
  template4: `
    <h1>Template 4: Product Catalog</h1>
    <p>List your products here along with descriptions and pricing.</p>
    <table border="1">
      <tr><th>Product</th><th>Description</th><th>Price</th></tr>
      <tr><td>Product 1</td><td>Amazing product 1</td><td>$10</td></tr>
    </table>`
};

function loadTemplate(templateContent) {
    // Destroy any existing CKEditor instance
    if (editorInstance) {
      editorInstance.destroy();
    }
// editorElement.innerHTML = templateContent;  
ClassicEditor.create(editorElement, {
    toolbar: {
        items: [
            'undo', 'redo', '|',
            'bold', 'italic', 'underline', '|',
             'heading',
            'fontFamily', 'fontSize', 
            'fontColor', 'fontBackgroundColor',
            'alignment', 
            'bulletedList', 'numberedList', '|',
            'insertTable', '|',
            'link', 'blockQuote', '|',
            'showBlocks'
        ],
        shouldNotGroupWhenFull: false
    },
    plugins: [
        AccessibilityHelp, Autoformat, AutoLink, Autosave, BalloonToolbar, Bold, Essentials,
        Font, 
        Heading,
        Underline, 
        Alignment,
        Italic, Link, List, ListProperties,
        Paragraph, SelectAll, ShowBlocks, Table, TableCaption, TableCellProperties, TableColumnResize,
        TableProperties, TableToolbar, TextPartLanguage, TextTransformation, Title, TodoList, Undo
    ],
    fontFamily: {
        options: [
            'default',
            'Arial, Helvetica, sans-serif', 
            'Times New Roman, Times, serif', 
            'Brush Script MT, cursive', 
            'Copperplate, Copperplate Gothic Light, serif', 
            'Montserrat, sans-serif'
        ],
        supportAllValues: true // Allow users to paste in other font names manually
    },
    fontSize: {
        options: [9, 11, 13, 15, 17, 19, 21, 24, 28, 32, 36, 40, 48], // Numeric font sizes
        supportAllValues: true // Allow users to enter custom font sizes
    },
    alignment: {
        options: ['left', 'center', 'right', 'justify'] // Text alignment options
    },
    placeholder: 'Type or paste your content here!',
    table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
    }

})
.then(editor => {
    editorInstance = editor;  // Save the instance of the editor
    editor.setData(templateContent);
  })
  .catch(error => {
    console.error('There was a problem initializing the editor.', error);
  });
 }

 templateImages.forEach(image => {
    image.addEventListener("click", function () {
      // Get the data-template attribute value to load the correct template
      const selectedTemplate = this.getAttribute("data-template");
  
      if (templates[selectedTemplate]) {
        // Load the corresponding template content into the workspace and re-initialize the editor
        loadTemplate(templates[selectedTemplate]);
      } else {
        console.error('Selected template not found!');
      }
    });
  });

const imageScroll = document.getElementById('image-scroll');
const arrowUp = document.getElementById('arrow-up');
const arrowDown = document.getElementById('arrow-down');

// Variables to control scrolling
let scrollPosition = 0;
const scrollStep = 150; // Adjust this value to control how much the images move on each click

// Update maximum scroll based on the image container size
function updateMaxScroll() {
    const maxScroll = imageScroll.scrollHeight - imageScroll.parentElement.offsetHeight;
    return maxScroll > 0 ? maxScroll : 0;
}

// Scroll up by clicking the arrow
arrowUp.addEventListener('click', () => {
    if (scrollPosition > 0) {
        scrollPosition -= scrollStep;
        if (scrollPosition < 0) scrollPosition = 0;  // Prevent over-scrolling
        imageScroll.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    }
    updateArrowVisibility();
});

// Scroll down by clicking the arrow
arrowDown.addEventListener('click', () => {
    const maxScroll = updateMaxScroll();
    if (scrollPosition < maxScroll) {
        scrollPosition += scrollStep;
        if (scrollPosition > maxScroll) scrollPosition = maxScroll;  // Prevent over-scrolling
        imageScroll.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    }
    updateArrowVisibility();
});

// Handle manual scrolling with mouse or trackpad
imageScroll.addEventListener('scroll', () => {
    scrollPosition = imageScroll.scrollTop;
    updateArrowVisibility();
});

// Update arrow visibility based on scroll position
function updateArrowVisibility() {
    const maxScroll = updateMaxScroll();
    arrowUp.style.visibility = scrollPosition > 0 ? 'visible' : 'hidden';
    arrowDown.style.visibility = scrollPosition < maxScroll ? 'visible' : 'hidden';
}



// Initialize arrow visibility
updateArrowVisibility();



