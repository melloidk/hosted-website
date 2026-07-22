const imagefeed = document.getElementById("image-feed");
const emptymessage = document.getElementById("empty-message");

async function loadimages() {
  try {
    const response = await fetch("images.json");

    if (!response.ok) {
      throw new Error("could not load the image list");
    }

    const images = await response.json();

    if (images.length === 0) {
      return;
    }

    emptymessage.style.display = "none";

    for (const filename of images) {
      const imagecard = document.createElement("article");
      imagecard.className = "image-card";

      const imageframe = document.createElement("div");
      imageframe.className = "image-frame";

      const image = document.createElement("img");
      image.src = `images/${encodeURIComponent(filename)}`;
      image.alt = filename.toLowerCase();
      image.loading = "lazy";

      const imagename = document.createElement("p");
      imagename.textContent = filename.toLowerCase();

      imageframe.append(image);
      imagecard.append(imageframe, imagename);
      imagefeed.append(imagecard);
    }
  } catch (error) {
    emptymessage.textContent = "the image gallery could not be loaded.";
  }
}

loadimages();