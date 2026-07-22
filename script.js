const imageupload = document.getElementById("image-upload");
const imagefeed = document.getElementById("image-feed");
const emptymessage = document.getElementById("empty-message");

imageupload.addEventListener("change", () => {
  const files = imageupload.files;

  if (files.length > 0) {
    emptymessage.style.display = "none";
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      continue;
    }

    const imageurl = URL.createObjectURL(file);

    const imagecard = document.createElement("article");
    imagecard.className = "image-card";

    const image = document.createElement("img");
    image.src = imageurl;
    image.alt = file.name;

    const imagename = document.createElement("p");
    imagename.textContent = file.name.toLowerCase();

    imagecard.append(image, imagename);
    imagefeed.append(imagecard);
  }

  imageupload.value = "";
});