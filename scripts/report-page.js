const images = document.querySelectorAll('.image-container img');
const templates = document.querySelectorAll('.workspace > div');

function hideAllTemplates() {
    templates.forEach(template => {
        template.style.display = 'none';
    });
}

images.forEach(image => {
    image.addEventListener('click', function() {
        hideAllTemplates()
        const templateKey = this.getAttribute('data-template');
        console.log(templateKey);

        const selectedTemplate = document.getElementById(templateKey);
        if (selectedTemplate) {
            selectedTemplate.style.display = 'block';
        }
    });
});
