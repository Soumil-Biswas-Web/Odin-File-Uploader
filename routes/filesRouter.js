import { Router } from "express";
import upload from "../middleware/multerUploader.js";
import { body, validationResult } from "express-validator";
import prisma from "../middleware/prismaInit.js";
import cloudinary from "../middleware/cloudinaryInit.js";

const route = Router();

export async function getRecursiveParentFolders ( folderId ) {
  const folder = await prisma.ofu_Folder.findUnique({
    where: {
      id: folderId,
    },
  });
  if (folder?.parentFolderId) {
    return [...(await getRecursiveParentFolders(folder.parentFolderId)), folder];
  }
  return [folder];
}

async function deleteFolderRecursively(folderId) {
  try {
    const folder = await prisma.ofu_Folder.findUnique({
      where: { id: folderId },
      include: {
        children: {
          include: {
            files: true,
            children: {
              include: {
                files: true,
              },
            },
          },
        },
        files: true,
      },
    });

    if (folder?.children && folder.children.length > 0) {
      for (const child of folder.children) {
        await deleteFolderRecursively(child.id);
      }
    }
    if (folder?.files && folder.files.length > 0) {
      for (const file of folder.files) {
        if (file.publicId) {
          await cloudinary.uploader.destroy(file.publicId);
          await cloudinary.uploader.destroy(file.publicId, {
            resource_type: "raw",
          });
        }
        await prisma.ofu_File.delete({
          where: { id: file.id },
        });
      }
    }
    await prisma.ofu_Folder.delete({
      where: { id: folderId },
    });
  } catch (error) {
    console.log(error);
  }
}

function uploadToCloudinary(buffer) {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "fileuploader" },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.log("Upload to cloudinary error", error);
    throw error;
  }
}

function uploadToCloudinaryRaw(buffer) {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder: "fileuploader" },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.log("Upload to cloudinary error", error);
    throw error;
  }
}

// if is not authenticated, redirect to login
route.use((req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect("/auth/login");
  }
  next();
});

route.get("/dashboard", async(req, res) => {
  const folders = await prisma.ofu_Folder.findMany({
      where: {
        ownerId: req.user.id,
        parentFolderId: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        files: true,
        children: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
  });

  const files = await prisma.ofu_File.findMany({
    where: {
      ownerId: req.user.id,
      folderId: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.render("layout.ejs", {
    title: "Odin-File-Uploader",
    body: "components/dashBoard.ejs",
    folders: folders,
    files: files,
    user: req.user
  });
})

route.post('/upload', upload.array('file'), async (req, res) => {
  try {
    let userId = req.user.id; // Extract user ID from the request body
    const files = req.files; // Multer attaches file info here
    const parentFolderId = req.body.parentFolderId; // We need the parent folder (if it exists)
    // console.log(userId);
    // console.log(files);

    // upload all files to cloudinary
    const uploadedPromises = files.map((file) =>
      file.mimetype.includes("image")
        ? uploadToCloudinary(file.buffer)
        : uploadToCloudinaryRaw(file.buffer)
    );

    const cloudinaryResults = await Promise.all(uploadedPromises);

    // console.log("cloudinaryResults", cloudinaryResults);

    if (parentFolderId === "") {
      // create file in the database
      const fileRecords = cloudinaryResults.map(
        (result, index) => ({
          name: files[index].originalname,
          url: result.secure_url,
          size: files[index].size,
          type: files[index].mimetype,
          ownerId: userId,
          publicId: result.public_id,
        })
      );

      await prisma.ofu_File.createMany({
        data: fileRecords,
      });
    } else {
      // create file in the database
      const fileRecords = cloudinaryResults.map(
        (result, index) => ({
          name: files[index].originalname,
          url: result.secure_url,
          size: files[index].size,
          type: files[index].mimetype,
          ownerId: userId,
          folderId: parentFolderId,
          publicId: result.public_id,
        })
      );
      await prisma.ofu_File.createMany({
        data: fileRecords,
      });
    }

    res.json({ success: true, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error :', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }  
});

route.get("/file/:fileId/delete", async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.user.id;

    const file = await prisma.ofu_File.findUnique({
      where: { id: fileId, ownerId: userId },
    });

    if (!file) {
      console.log("error", "File not found");
      return res.redirect("back");
    }

    if (file.publicId) {
      await cloudinary.uploader.destroy(file.publicId);
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: "raw",
      });
    }
    await prisma.ofu_File.delete({
      where: { id: fileId, ownerId: userId },
    });

    console.log("success", "File deleted successfully");
    res.redirect("back");
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// CRUD Folders:

// Create folder
route.post("/folder", [body("folderName").notEmpty().withMessage("Folder name is required")], async (req, res) => {
  // console.log(req.body);
  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log("error", error.array()[0].msg);
  }

  const { folderName, parentFolderId } = req.body;
  console.log({ folderName, parentFolderId })

  const userId = req.user.id;

  try {
    if (!parentFolderId) {
      // create folder in root
      const folder = await prisma.ofu_Folder.create({
        data: {
          name: folderName,
          ownerId: userId,
        },
      });
      console.log("success", "Folder created successfully");
      return res.redirect(`/files/dashboard`);
      // res.json({ success: true, message: 'File uploaded successfully' });
    }

    const parentFolder = await prisma.ofu_Folder.findUnique({
      where: {
        id: parentFolderId,
      },
    });

    // console.log(parentFolder);

    if (!parentFolder) {
      return res.status(404).json({ error: "Parent folder not found" });
    }

    if (parentFolder.ownerId !== userId) {
      return res.status(403).json({
        error: "You are not allowed to create folder in this folder",
      });
    }

    const folder = await prisma.ofu_Folder.create({
      data: {
        name: folderName,
        parentFolderId: parentFolderId,
        ownerId: userId,
      },
    });

    console.log("success", "Folder created successfully");
    return res.redirect(`/files/folder/${folder.id}`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create folder" });
  }
});

// Read / Navigate to folder
route.get("/folder/:folderId", async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const folder = await prisma.ofu_Folder.findUnique({
      where: {
        id: folderId,
      },
      include: {
        files: true,
        children: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            files: true,
            children: {
              orderBy: {
                createdAt: "desc",
              },
            },
            parentFolder: true,
          },
        },
        parentFolder: true,
      },
    });

    const parentFolders = await getRecursiveParentFolders(folderId);
    console.log(folder);
    res.render("layout.ejs", {
      title: "Odin-File-Uploader",
      body: "components/folderPage.ejs",
      self: folder,
      folders: parentFolders,
    });    
  } catch (error) {
    console.error('Error :', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });    
  }  
});

// Update / Edit Folder
// Edit folder name mayber
route.get("/folder/:folderId/update", async (req, res) => {

});


// Delete Folder
route.get("/folder/:folderId/delete", async (req, res) => {
  const folderId = req.params.folderId;
  const userId = req.user.id;

  const folder = await prisma.ofu_Folder.findUnique({
    where: { id: folderId, ownerId: userId },
    include: {
      files: true,
      children: true,
    },
  });

  if (!folder) {
    console.log("error", "Folder not found");
    return res.redirect("back");
  }

  folder.files.forEach(async (file) => {
    try {
      if (file.publicId) {
        await cloudinary.uploader.destroy(file.publicId);
        await cloudinary.uploader.destroy(file.publicId, {
          resource_type: "raw",
        });
      }
      await prisma.ofu_File.delete({
        where: { id: file.id, ownerId: userId },
      });
    } catch (error) {
      console.log(error);
      return;
    }
  });

  if (folder.children.length > 0) {
    // recursively delete all the files in the folder
    await deleteFolderRecursively(folderId);
  } else {
    await prisma.ofu_Folder.delete({
      where: { id: folderId, ownerId: userId },
    });
  }

  console.log("success", "Folder deleted successfully");
  res.redirect("back");
});

export default route;
