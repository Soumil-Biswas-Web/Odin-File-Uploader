function passId (dialogId, id) {
  if (id) {
    // console.log(id);
    const zoner = document.querySelector("#"+dialogId+" .zonerId");
    const linker = document.querySelector("#"+dialogId+" a");
    if (zoner) {zoner.value = id}
    else if (linker) {
      if (dialogId == "delete-folder-dialog")
        linker.setAttribute("href", "/files/folder/"+id+"/delete");
      else
        linker.setAttribute("href", "/files/file/"+id+"/delete");
    }
    else if (dialogId === "info-folder-dialog") {
      document.querySelector("#"+dialogId+">p:nth-child(2) span").textContent = id.name;
      document.querySelector("#"+dialogId+">p:nth-child(3) span").textContent = new Date("2025-03-12T08:40:06.835Z").toISOString().split("T")[0];
    }
    else if (dialogId === "info-file-dialog") {
      document.querySelector("#"+dialogId+">p:nth-child(2) span").textContent = id.name;
      document.querySelector("#"+dialogId+">p:nth-child(3) span").textContent = new Date("2025-03-12T08:40:06.835Z").toISOString().split("T")[0];
      document.querySelector("#"+dialogId+">p:nth-child(4) span").textContent = (id.size+ " Bytes");
    }
  }  
}

function showDialog(dialogId, id) {
    const dialog = document.getElementById(dialogId);

    console.log(id);

    // If the operation needs a file/folder id, pass it.
    passId(dialogId, id);

    if (dialog) {
      dialog.showModal();
    }
}
  
function closeDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
      dialog.close();
    }
}
  