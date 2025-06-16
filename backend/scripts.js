const modeSelector = document.getElementById("mode");
const textSection = document.getElementById("textSection");
const readSection = document.getElementById("readSection");
const stegoSection = document.getElementById("stego");
const coverImage = document.getElementById("cover");
const mainContent = document.getElementById("mainContent");
const imagesSection = document.getElementById("imagesSection");
const originalImage = document.getElementById("img");

modeSelector.addEventListener("change", () => {
    const mode = modeSelector.value;

    if (!mode) {
        // Hide all except mode selector if nothing selected
        mainContent.classList.add("d-none");
        imagesSection.classList.add("d-none");
        textSection.classList.add("d-none");
        readSection.classList.add("d-none");
        stegoSection.classList.add("d-none");
        document.getElementById("messageArea").classList.add("invisible");
        return;
    }

    // Show main content and original image
    mainContent.classList.remove("d-none");
    imagesSection.classList.remove("d-none");
    stegoSection.classList.add("d-none");
    document.getElementById("messageArea").classList.add("invisible");

    if (mode === "encode") {
        textSection.classList.remove("d-none");
        readSection.classList.add("d-none");
    } else {
        textSection.classList.add("d-none");
        readSection.classList.remove("d-none");
    }

    // Reset images and message area
    coverImage.src = "";
    originalImage.src = "images/0406.png";
});

// Hide functionality
document.getElementById("hide").addEventListener("click", () => {
    const text = document.getElementById("text").value;
    const fileInput = document.getElementById("file");
    if (!fileInput.files.length) return alert("Please choose an image.");

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const binaryText = text
                .split("")
                .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
                .join("") + "00000000";
            for (let i = 0; i < binaryText.length && i * 4 < imageData.data.length; i++) {
                imageData.data[i * 4 + 3] = parseInt(binaryText[i] + "0000000", 2);
            }
            ctx.putImageData(imageData, 0, 0);
            const encodedData = canvas.toDataURL();
            coverImage.src = encodedData;
            document.getElementById("download").href = encodedData;
            stegoSection.classList.remove("d-none");
        };
        img.src = e.target.result;
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(fileInput.files[0]);
});

// Read functionality
document.getElementById("read").addEventListener("click", () => {
    const fileInput = document.getElementById("file");
    if (!fileInput.files.length) return alert("Please choose an image.");

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let binary = "";
            for (let i = 0; i < imageData.data.length; i += 4) {
                let bit = imageData.data[i + 3] >> 7;
                binary += bit;
                if (binary.endsWith("00000000")) break;
            }
            binary = binary.substring(0, binary.length - 8);
            let message = "";
            for (let i = 0; i < binary.length; i += 8) {
                const byte = binary.slice(i, i + 8);
                message += String.fromCharCode(parseInt(byte, 2));
            }
            document.getElementById("message").innerText = message;
            document.getElementById("messageArea").classList.remove("invisible");
            originalImage.src = e.target.result;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(fileInput.files[0]);
});

function copyText() {
    const text = document.getElementById("message").innerText;
    navigator.clipboard.writeText(text).then(() => alert("Copied!"));
}
