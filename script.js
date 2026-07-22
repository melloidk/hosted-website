import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseurl = "https://psvtrblyughigvzqthdt.supabase.co";
const supabasekey = "sb_publishable_jiL0A2-eBFY26qSvGRmHwg_GaJnpDNv";

const supabase = createClient(supabaseurl, supabasekey);

const loginbox = document.getElementById("login-box");
const loginform = document.getElementById("login-form");
const loginmessage = document.getElementById("login-message");
const uploadbox = document.getElementById("upload-box");
const imageupload = document.getElementById("image-upload");
const uploadmessage = document.getElementById("upload-message");
const logoutbutton = document.getElementById("logout-button");
const imagefeed = document.getElementById("image-feed");
const emptymessage = document.getElementById("empty-message");

async function updateownercontrols() {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  loginbox.hidden = Boolean(session);
  uploadbox.hidden = !session;
}

function makeimagecard(filename, imageurl) {
  const imagecard = document.createElement("article");
  imagecard.className = "image-card";

  const imageframe = document.createElement("div");
  imageframe.className = "image-frame";

  const image = document.createElement("img");
  image.src = imageurl;
  image.alt = filename.toLowerCase();
  image.loading = "lazy";

  const imagename = document.createElement("p");
  imagename.textContent = filename.toLowerCase();

  imageframe.append(image);
  imagecard.append(imageframe, imagename);

  return imagecard;
}

async function loadgallery() {
  imagefeed.innerHTML = "";
  imagefeed.append(emptymessage);
  emptymessage.style.display = "block";
  emptymessage.textContent = "loading images...";

  const { data: files, error } = await supabase.storage
    .from("gallery")
    .list("images", {
      limit: 100,
      sortBy: {
        column: "created_at",
        order: "desc"
      }
    });

  if (error) {
    emptymessage.textContent = `gallery error: ${error.message}`;
    return;
  }

  const imagefiles = files.filter((file) => file.name !== ".emptyfolderplaceholder");

  if (imagefiles.length === 0) {
    emptymessage.textContent = "no images have been added yet.";
    return;
  }

  emptymessage.style.display = "none";

  for (const file of imagefiles) {
    const { data: publicurl } = supabase.storage
      .from("gallery")
      .getPublicUrl(`images/${file.name}`);

    imagefeed.append(makeimagecard(file.name, publicurl.publicUrl));
  }
}

loginform.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  loginmessage.textContent = "logging in...";

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginmessage.textContent = `login failed: ${error.message}`;
    return;
  }

  loginmessage.textContent = "";
  await updateownercontrols();
});

imageupload.addEventListener("change", async () => {
  const files = imageupload.files;

  if (files.length === 0) {
    return;
  }

  uploadmessage.textContent = "uploading images...";

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      continue;
    }

    const cleanname = file.name.replaceAll("/", "-");
    const filename = `${crypto.randomUUID()}-${cleanname}`;

    const { error } = await supabase.storage
      .from("gallery")
      .upload(`images/${filename}`, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      uploadmessage.textContent = `upload failed: ${error.message}`;
      return;
    }
  }

  imageupload.value = "";
  uploadmessage.textContent = "your images were uploaded.";
  await loadgallery();
});

logoutbutton.addEventListener("click", async () => {
  await supabase.auth.signOut();
  await updateownercontrols();
});

await updateownercontrols();
await loadgallery();