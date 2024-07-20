document.addEventListener('DOMContentLoaded', () => {
    const atlButton = document.getElementById("atlButton");
    const pacButton = document.getElementById("pacButton");
    const cpacButton = document.getElementById("cpacButton");

    const atlImage = document.getElementById("atlImage");
    const pacImage = document.getElementById("pacImage");
    const cpacImage = document.getElementById("cpacImage");

    atlButton.onclick = () => changeImageDisplay(atlImage, pacImage, cpacImage);
    pacButton.onclick = () => changeImageDisplay(pacImage, atlImage, cpacImage);
    cpacButton.onclick = () => changeImageDisplay(cpacImage, pacImage, atlImage);
});

function changeImageDisplay(showImage, ...hideImages) {
    showImage.style.display = "block";
    hideImages.forEach(image => image.style.display = "none");
}